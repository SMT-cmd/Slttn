import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import { toast } from "sonner";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ADMIN_ACCESS_TIMEOUT_MS } from "@/lib/admin/access";
import { useAdminGate } from "@/lib/admin/gate";
import {
  clearAdminWorkspace,
  defaultAdminWorkspace,
  loadAdminWorkspace,
  saveAdminWorkspace,
  type AdminBookWorkspaceDraft,
  type AdminWorkspaceDraft,
  type AdminWorkspaceTab,
} from "@/lib/admin/workspace";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  adminAccess,
  adminBooks,
  adminCoupons,
  adminCreateBook,
  adminCreateBookPages,
  adminCreateCoupon,
  adminDeleteBook,
  adminDeleteBookPage,
  adminDeleteCoupon,
  adminLogs,
  adminOverview,
  adminReorderBookPages,
  adminSales,
  adminSaveBookCover,
  adminSaveSetting,
  adminSetBan,
  adminSetTagged,
  adminSignCloudinaryUpload,
  adminUpdateBook,
  adminUsers,
  type BookPageRow,
  type BookRow,
} from "@/lib/server/platform";
import { formatMoney } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({ component: Admin });

type TabKey = AdminWorkspaceTab;
type OverviewData = Awaited<ReturnType<typeof adminOverview>>;
type UsersData = Awaited<ReturnType<typeof adminUsers>>;
type CouponsData = NonNullable<Awaited<ReturnType<typeof adminCoupons>>>;
type SalesData = NonNullable<Awaited<ReturnType<typeof adminSales>>>;
type LogsData = NonNullable<Awaited<ReturnType<typeof adminLogs>>>;
type SignedUpload = Awaited<ReturnType<typeof adminSignCloudinaryUpload>>;
type BookDraft = AdminBookWorkspaceDraft;

type CommunityLinkForm = {
  id: string;
  label: string;
  url: string;
};

type SettingsForm = {
  global_prelaunch: boolean;
  partner_code: string;
  support_email: string;
  telegram_url: string;
  whatsapp_url: string;
  community_links: CommunityLinkForm[];
};

type QueryState<T> =
  | { status: "loading"; data: null; error: string }
  | { status: "ready"; data: T; error: string }
  | { status: "error"; data: null; error: string };

type NewBookForm = {
  title: string;
  subtitle: string;
  slug: string;
  category: string;
  size: "short" | "medium" | "full";
  launch_mode: "prelaunch" | "launch";
  blurb: string;
  published: boolean;
};

type CouponForm = {
  code: string;
  kind: string;
  usesRemaining: string;
  bookId: string;
  userId: string;
};

type PageUploadProgress = {
  active: boolean;
  stage: "idle" | "uploading" | "saving" | "done";
  total: number;
  completed: number;
  uploaded: number;
  failed: number;
  failedFiles: string[];
};

const EMPTY_BOOK: NewBookForm = {
  title: "",
  subtitle: "",
  slug: "",
  category: "Synthetic Indices",
  size: "medium",
  launch_mode: "prelaunch",
  blurb: "",
  published: true,
};

const EMPTY_COUPON_FORM: CouponForm = {
  code: "",
  kind: "promo",
  usesRemaining: "20",
  bookId: "",
  userId: "",
};

function createLoadingState<T>(): QueryState<T> {
  return { status: "loading", data: null, error: "" };
}

function createReadyState<T>(data: T): QueryState<T> {
  return { status: "ready", data, error: "" };
}

function createErrorState<T>(error: unknown, fallback: string): QueryState<T> {
  return {
    status: "error",
    data: null,
    error: error instanceof Error && error.message ? error.message : fallback,
  };
}

function createBookDraft(book: BookRow): BookDraft {
  return {
    id: book.id,
    title: book.title,
    subtitle: book.subtitle,
    slug: book.slug,
    category: book.category,
    size: book.size === "short" || book.size === "full" ? book.size : "medium",
    launch_mode: book.launch_mode === "prelaunch" ? "prelaunch" : "launch",
    blurb: book.description,
    published: book.published,
    sort_order: book.sort_order,
    cover_url: book.cover_url,
  };
}

function createCommunityLink(
  patch: Partial<CommunityLinkForm> = {},
  index = 0,
): CommunityLinkForm {
  const label = typeof patch.label === "string" ? patch.label : "";
  const url = typeof patch.url === "string" ? patch.url : "";
  return {
    id: patch.id ?? `community-link-${index}-${label || "new"}-${url || "link"}`,
    label,
    url,
  };
}

function normalizeCommunityLinks(value: unknown): CommunityLinkForm[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as Record<string, unknown>;
      if (typeof record.label !== "string" || typeof record.url !== "string") return null;
      return createCommunityLink(
        {
          id: typeof record.id === "string" ? record.id : undefined,
          label: record.label,
          url: record.url,
        },
        index,
      );
    })
    .filter((entry): entry is CommunityLinkForm => entry !== null);
}

function normalizeSettings(settings: Record<string, unknown>): SettingsForm {
  return {
    global_prelaunch:
      typeof settings.global_prelaunch === "boolean" ? settings.global_prelaunch : true,
    partner_code: typeof settings.partner_code === "string" ? settings.partner_code : "",
    support_email: typeof settings.support_email === "string" ? settings.support_email : "",
    telegram_url: typeof settings.telegram_url === "string" ? settings.telegram_url : "",
    whatsapp_url: typeof settings.whatsapp_url === "string" ? settings.whatsapp_url : "",
    community_links: normalizeCommunityLinks(settings.community_links),
  };
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function formatRoleLabel(role: string | null | undefined) {
  if (!role) return "Member";
  return role
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getMemberName(user: UsersData[number]) {
  return user.full_name?.trim() || user.email?.trim() || "Unnamed member";
}

function getPageUploadMessage(progress: PageUploadProgress) {
  if (progress.stage === "saving") return "Saving pages to library…";
  if (progress.stage === "done") {
    return `Done: ${progress.uploaded} uploaded, ${progress.failed} failed`;
  }
  if (progress.stage === "uploading") {
    const current = Math.min(progress.completed, progress.total);
    return `Uploading ${current} of ${progress.total}…`;
  }
  return "";
}

function isBookPageRow(value: BookPageRow | null | undefined): value is BookPageRow {
  return Boolean(value?.id && value.image_url);
}

function isCommunityLinkForm(
  value: CommunityLinkForm | null | undefined,
): value is CommunityLinkForm {
  return Boolean(value?.id);
}

function PanelStateCard({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      {actionLabel && onAction ? (
        <Button type="button" variant="outline" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-md px-4 text-sm ${
        active ? "bg-navy text-navy-foreground" : "bg-muted"
      }`}
    >
      {label}
    </button>
  );
}

async function uploadFile(file: File, signed: SignedUpload) {
  const body = new FormData();
  body.set("file", file);
  body.set("api_key", signed.apiKey);
  body.set("folder", signed.folder);
  body.set("public_id", signed.publicId);
  body.set("resource_type", signed.resourceType);
  body.set("signature", signed.signature);
  body.set("tags", signed.tags);
  body.set("timestamp", String(signed.timestamp));

  const response = await fetch(signed.uploadUrl, {
    method: "POST",
    body,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Cloudinary upload failed.");
  }

  const payload = (await response.json()) as { secure_url?: string };
  if (!payload.secure_url) throw new Error("Cloudinary did not return a secure image URL.");
  return payload.secure_url;
}

function Admin() {
  const { user, isPending } = useCurrentUserState();
  const [signingOut, setSigningOut] = useState(false);
  const [workspace, setWorkspace] = useState<AdminWorkspaceDraft>(() => loadAdminWorkspace());
  const checkAccess = useCallback(() => adminAccess(), []);
  const { state: gate, retry } = useAdminGate({
    isPending,
    userId: user?.id ?? null,
    checkAccess,
    timeoutMs: ADMIN_ACCESS_TIMEOUT_MS,
  });

  useEffect(() => {
    setWorkspace(loadAdminWorkspace());
  }, []);

  useEffect(() => {
    saveAdminWorkspace(workspace);
  }, [workspace]);

  const setTab = useCallback((nextTab: TabKey) => {
    setWorkspace((current) => ({ ...current, activeTab: nextTab }));
  }, []);

  const handleClearDraft = useCallback(() => {
    clearAdminWorkspace();
    setWorkspace((current) => ({ ...defaultAdminWorkspace(), activeTab: current.activeTab }));
    toast.success("Draft cleared.");
  }, []);

  if (gate.status === "denied") {
    return <Navigate to="/admin/login" />;
  }

  if (gate.status === "error") {
    return (
      <Shell>
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <h1 className="font-display text-4xl">We could not confirm admin access yet.</h1>
          <p className="mt-3 text-muted-foreground">{gate.message}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" variant="outline" onClick={retry}>
              Retry
            </Button>
            <Button asChild variant="navy">
              <Link to="/admin/login">Go to admin login</Link>
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  if (gate.status === "checking") {
    return <div className="grid min-h-dvh place-items-center">{gate.message}</div>;
  }

  const continueTitle = workspace.draft?.title?.trim() || "Untitled book";
  const hasWorkspaceDraft = Boolean(workspace.selectedBookId || workspace.draft || workspace.note);

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs tracking-[0.18em] uppercase text-muted-foreground">Admin</p>
            <h1 className="mt-2 font-display text-5xl">Platform dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Run books, members, sales, coupons, and site settings from one workspace
              that stays open after refresh.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={signingOut}
            onClick={() => {
              setSigningOut(true);
              void signOut("/admin/login").catch(() => {
                setSigningOut(false);
                toast.error("We couldn't sign you out just yet. Please try again.");
              });
            }}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>

        {hasWorkspaceDraft ? (
          <div className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium">Continue editing: {continueTitle}</p>
              <p className="text-sm text-muted-foreground">
                Restores your selected book, active tab, draft metadata, and admin note.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="navy" onClick={() => setTab("books")}>
                Continue editing
              </Button>
              <Button type="button" variant="outline" onClick={handleClearDraft}>
                Clear draft
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <TabButton active={workspace.activeTab === "overview"} label="Overview" onClick={() => setTab("overview")} />
          <TabButton active={workspace.activeTab === "books"} label="Books" onClick={() => setTab("books")} />
          <TabButton active={workspace.activeTab === "users"} label="Members" onClick={() => setTab("users")} />
          <TabButton active={workspace.activeTab === "coupons"} label="Coupons" onClick={() => setTab("coupons")} />
          <TabButton active={workspace.activeTab === "sales"} label="Sales" onClick={() => setTab("sales")} />
        </div>

        <div className="mt-8">
          {workspace.activeTab === "overview" ? <HomePanel /> : null}
          {workspace.activeTab === "books" ? (
            <BooksPanel workspace={workspace} setWorkspace={setWorkspace} clearWorkspaceDraft={handleClearDraft} />
          ) : null}
          {workspace.activeTab === "users" ? <UsersPanel /> : null}
          {workspace.activeTab === "coupons" ? <CouponsPanel /> : null}
          {workspace.activeTab === "sales" ? <SalesPanel /> : null}
        </div>
      </div>
    </Shell>
  );
}

function HomePanel() {
  const [overviewState, setOverviewState] = useState<QueryState<OverviewData>>(() =>
    createLoadingState(),
  );
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [saving, setSaving] = useState(false);

  const loadOverview = useCallback(async () => {
    setOverviewState(createLoadingState());
    try {
      const payload = await adminOverview();
      setOverviewState(createReadyState(payload));
      setForm(normalizeSettings(payload.settings));
    } catch (error: unknown) {
      setOverviewState(createErrorState(error, "Could not load admin overview."));
      setForm(null);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  if (overviewState.status === "loading") {
    return (
      <PanelStateCard
        title="Loading overview"
        message="Fetching admin metrics and global settings."
      />
    );
  }

  if (overviewState.status === "error" || !form) {
    return (
      <PanelStateCard
        title="Overview failed to load"
        message={overviewState.error || "Could not load admin overview."}
        actionLabel="Retry"
        onAction={() => {
          void loadOverview();
        }}
      />
    );
  }

  const data = overviewState.data;

  return (
    <div className="grid gap-4 xl:grid-cols-5">
      {[
        ["Members", String(data.users)],
        ["Tagged members", String(data.tagged)],
        ["Paid orders", String(data.salesCount)],
        ["Revenue", formatMoney(data.salesCents / 100)],
        ["Books", String(data.books)],
      ].map(([label, value]) => (
        <div key={label} className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl">{value}</p>
        </div>
      ))}

      <form
        className="xl:col-span-5 rounded-xl border border-border bg-card p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          const hasHalfFilledCommunityLink = form.community_links.some(
            (link) =>
              (link.label.trim().length > 0 || link.url.trim().length > 0) &&
              (link.label.trim().length === 0 || link.url.trim().length === 0),
          );
          if (hasHalfFilledCommunityLink) {
            toast.error("Each community link needs both a name and a link.");
            return;
          }

          setSaving(true);
          const communityLinks = form.community_links
            .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
            .filter((link) => link.label.length > 0 && link.url.length > 0);

          const saves: Array<[string, string]> = [
            ["global_prelaunch", String(form.global_prelaunch)],
            ["partner_code", form.partner_code],
            ["support_email", form.support_email],
            ["telegram_url", form.telegram_url],
            ["whatsapp_url", form.whatsapp_url],
            ["community_links", JSON.stringify(communityLinks)],
          ];
          try {
            await Promise.all(
              saves.map(([key, value]) => adminSaveSetting({ data: { key, value } })),
            );
            await loadOverview();
            toast.success("Settings saved.");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "We could not save your settings.");
          } finally {
            setSaving(false);
          }
        }}
      >
        <div className="mb-4">
          <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">Site settings</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Update launch mode, support details, and community links for the public site.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="rounded-lg border border-border bg-background p-4 text-sm">
            <span className="block font-medium">Pre-launch mode</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Turn this on to keep the public site in pre-launch mode.
            </span>
            <span className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.global_prelaunch}
                disabled={saving}
                onChange={(event) =>
                  setForm((current) =>
                    current ? { ...current, global_prelaunch: event.target.checked } : current,
                  )
                }
              />
              Keep pre-launch mode on
            </span>
          </label>
          <Field
            label="Partner code"
            helperText="Use this when you need to match a partner code on the public site."
            value={form.partner_code}
            disabled={saving}
            onChange={(value) =>
              setForm((current) => (current ? { ...current, partner_code: value } : current))
            }
          />
          <Field
            label="Support email"
            helperText="This email is shown on the public site for support questions."
            value={form.support_email}
            disabled={saving}
            type="email"
            onChange={(value) =>
              setForm((current) => (current ? { ...current, support_email: value } : current))
            }
          />
          <Field
            label="Telegram link"
            helperText="Add the main Telegram link for your public site."
            value={form.telegram_url}
            disabled={saving}
            onChange={(value) =>
              setForm((current) => (current ? { ...current, telegram_url: value } : current))
            }
          />
          <Field
            label="WhatsApp link"
            helperText="Add the main WhatsApp link for your public site."
            value={form.whatsapp_url}
            disabled={saving}
            onChange={(value) =>
              setForm((current) => (current ? { ...current, whatsapp_url: value } : current))
            }
          />
        </div>
        <div className="mt-4 rounded-xl border border-border bg-background p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium">Community links</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add the links shown in your public community section, such as WhatsApp
                Community, Telegram Channel, or Support Group.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() =>
                setForm((current) =>
                  current
                    ? {
                        ...current,
                        community_links: [
                          ...current.community_links,
                          createCommunityLink({}, current.community_links.length),
                        ],
                      }
                    : current,
                )
              }
            >
              Add link
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            {form.community_links.filter(isCommunityLinkForm).map((link) => (
              <div
                key={link.id}
                className="grid gap-3 rounded-lg border border-border bg-card p-3 md:grid-cols-[1fr_1.4fr_auto]"
              >
                <Field
                  label="Link name"
                  helperText="Examples: WhatsApp Community, Telegram Channel, Support Group."
                  value={link.label}
                  disabled={saving}
                  onChange={(value) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            community_links: current.community_links.map((entry) =>
                              entry.id === link.id ? { ...entry, label: value } : entry,
                            ),
                          }
                        : current,
                    )
                  }
                />
                <Field
                  label="Link URL"
                  helperText="Paste the full public link."
                  value={link.url}
                  disabled={saving}
                  onChange={(value) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            community_links: current.community_links.map((entry) =>
                              entry.id === link.id ? { ...entry, url: value } : entry,
                            ),
                          }
                        : current,
                    )
                  }
                />
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={saving}
                    onClick={() =>
                      setForm((current) =>
                        current
                          ? {
                              ...current,
                              community_links: current.community_links.filter(
                                (entry) => entry.id !== link.id,
                              ),
                            }
                          : current,
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            {form.community_links.filter(isCommunityLinkForm).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No community links yet. Add your first public group link.
              </p>
            ) : null}
          </div>
        </div>
        <Button type="submit" variant="navy" className="mt-4" disabled={saving}>
          {saving ? "Saving settings…" : "Save settings"}
        </Button>
      </form>
    </div>
  );
}

function BooksPanel({
  workspace,
  setWorkspace,
  clearWorkspaceDraft,
}: {
  workspace: AdminWorkspaceDraft;
  setWorkspace: Dispatch<SetStateAction<AdminWorkspaceDraft>>;
  clearWorkspaceDraft: () => void;
}) {
  const [booksState, setBooksState] = useState<QueryState<BookRow[]>>(() => createLoadingState());
  const [newBook, setNewBook] = useState<NewBookForm>(EMPTY_BOOK);
  const [creating, setCreating] = useState(false);

  const updateSelectedBook = useCallback(
    (book: BookRow | null, options?: { preserveDraft?: boolean }) => {
      setWorkspace((current) => ({
        ...current,
        activeTab: "books",
        selectedBookId: book?.id ?? null,
        draft:
          book && options?.preserveDraft && current.draft?.id === book.id
            ? current.draft
            : book
              ? createBookDraft(book)
              : null,
      }));
    },
    [setWorkspace],
  );

  const loadBooks = useCallback(
    async (preferredBookId?: string | null) => {
      setBooksState(createLoadingState());
      try {
        const rows = await adminBooks();
        setBooksState(createReadyState(rows));
        const preferred = rows.find((book) => book.id === (preferredBookId ?? workspace.selectedBookId));
        const currentMatch = rows.find((book) => book.id === workspace.selectedBookId);
        const nextBook = preferred ?? currentMatch ?? rows[0] ?? null;
        updateSelectedBook(nextBook, { preserveDraft: true });
      } catch (error: unknown) {
        setBooksState(createErrorState(error, "Could not load books."));
      }
    },
    [updateSelectedBook, workspace.selectedBookId],
  );

  useEffect(() => {
    void loadBooks();
  }, [loadBooks]);

  const rows = booksState.status === "ready" ? booksState.data : [];
  const selectedBook = rows.find((book) => book.id === workspace.selectedBookId) ?? null;
  const draft =
    selectedBook && workspace.draft?.id === selectedBook.id
      ? workspace.draft
      : selectedBook
        ? createBookDraft(selectedBook)
        : null;

  return (
    <div className="space-y-6">
      <form
        className="rounded-xl border border-border bg-card p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setCreating(true);
          try {
            const created = await adminCreateBook({ data: newBook });
            if (!created?.id) {
              toast.error("We could not open the new book yet. Please try again.");
              return;
            }
            setNewBook(EMPTY_BOOK);
            await loadBooks(created.id);
            toast.success("Book created.");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not create the book.");
          } finally {
            setCreating(false);
          }
        }}
      >
        <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">Create book</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Add the main details first, then keep editing cover images and pages below.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field
            label="Book title"
            helperText="This is the name members will see in the library."
            value={newBook.title}
            disabled={creating}
            onChange={(value) => setNewBook((current) => ({ ...current, title: value }))}
          />
          <Field
            label="Short description"
            helperText="Use one short line to explain what this book is about."
            value={newBook.subtitle}
            disabled={creating}
            onChange={(value) => setNewBook((current) => ({ ...current, subtitle: value }))}
          />
          <Field
            label="Category"
            helperText="Choose the shelf or topic this book belongs to."
            value={newBook.category}
            disabled={creating}
            onChange={(value) => setNewBook((current) => ({ ...current, category: value }))}
          />
          <SelectField
            label="Size"
            helperText="Tell readers whether this is a short, medium, or full read."
            value={newBook.size}
            options={["short", "medium", "full"]}
            disabled={creating}
            onChange={(value) =>
              setNewBook((current) => ({ ...current, size: value as NewBookForm["size"] }))
            }
          />
          <SelectField
            label="Launch mode"
            helperText="Choose whether this book follows pre-launch access or full launch access."
            value={newBook.launch_mode}
            options={["prelaunch", "launch"]}
            disabled={creating}
            onChange={(value) =>
              setNewBook((current) => ({
                ...current,
                launch_mode: value as NewBookForm["launch_mode"],
              }))
            }
          />
        </div>
        <label className="mt-4 block text-sm">
          <span className="mb-2 block font-medium">Full description</span>
          <span className="mb-2 block text-sm text-muted-foreground">
            Share the longer description shown on the book page.
          </span>
          <textarea
            value={newBook.blurb}
            disabled={creating}
            onChange={(event) => setNewBook((current) => ({ ...current, blurb: event.target.value }))}
            className="min-h-28 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="mt-4 block rounded-lg border border-border bg-background p-4 text-sm">
          <span className="block font-medium">Publish this book</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Turn this on if the book should appear on the public site right away.
          </span>
          <span className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              checked={newBook.published}
              disabled={creating}
              onChange={(event) =>
                setNewBook((current) => ({ ...current, published: event.target.checked }))
              }
            />
            Show this book on the public site
          </span>
        </label>
        <Button type="submit" variant="navy" className="mt-4" disabled={creating}>
          {creating ? "Creating book…" : "Create book"}
        </Button>
      </form>

      {booksState.status === "loading" ? (
        <PanelStateCard title="Loading books" message="Fetching books, covers, and page counts." />
      ) : null}

      {booksState.status === "error" ? (
        <PanelStateCard
          title="Books failed to load"
          message={booksState.error}
          actionLabel="Retry"
          onAction={() => {
            void loadBooks();
          }}
        />
      ) : null}

      {booksState.status === "ready" ? (
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <aside className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">Library</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pick one book to continue editing.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => void loadBooks(workspace.selectedBookId)}>
                Refresh
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {rows.map((book) => {
                const active = workspace.selectedBookId === book.id;
                return (
                  <button
                    key={book.id}
                    type="button"
                    className={`w-full rounded-xl border p-3 text-left ${
                      active ? "border-navy bg-navy/5" : "border-border bg-background"
                    }`}
                    onClick={() => updateSelectedBook(book)}
                  >
                    <p className="font-medium">{book.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {book.category} · {book.pages?.length ?? 0} page
                      {(book.pages?.length ?? 0) === 1 ? "" : "s"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {book.published ? "Visible on site" : "Hidden from site"} · shelf order{" "}
                      {book.sort_order}
                    </p>
                  </button>
                );
              })}
              {rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No books yet. Create your first book above.
                </p>
              ) : null}
            </div>
          </aside>

          <div>
            {selectedBook && draft ? (
              <BookEditor
                book={selectedBook}
                draft={draft}
                note={workspace.note}
                onDraftChange={(nextDraft) =>
                  setWorkspace((current) => ({
                    ...current,
                    activeTab: "books",
                    selectedBookId: nextDraft.id,
                    draft: nextDraft,
                  }))
                }
                onNoteChange={(note) => setWorkspace((current) => ({ ...current, note }))}
                onReload={loadBooks}
                onClearDraft={clearWorkspaceDraft}
              />
            ) : (
              <PanelStateCard
                title="Select a book"
                message="Choose a book from the list to edit details, cover image, and pages."
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BookEditor({
  book,
  draft,
  note,
  onDraftChange,
  onNoteChange,
  onReload,
  onClearDraft,
}: {
  book: BookRow;
  draft: BookDraft;
  note: string;
  onDraftChange: (draft: BookDraft) => void;
  onNoteChange: (note: string) => void;
  onReload: (preferredBookId?: string | null) => Promise<void>;
  onClearDraft: () => void;
}) {
  const [pages, setPages] = useState<BookPageRow[]>(() => (book.pages ?? []).filter(isBookPageRow));
  const [saving, setSaving] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [pageUploadProgress, setPageUploadProgress] = useState<PageUploadProgress>({
    active: false,
    stage: "idle",
    total: 0,
    completed: 0,
    uploaded: 0,
    failed: 0,
    failedFiles: [],
  });
  const [reordering, setReordering] = useState(false);
  const [deletingPageId, setDeletingPageId] = useState<string | null>(null);
  const [deletingBook, setDeletingBook] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setPages((book.pages ?? []).filter(isBookPageRow));
  }, [book]);

  const isBusy = saving || coverUploading || pageUploadProgress.active || reordering || deletingBook;
  const visiblePages = pages.filter(isBookPageRow);

  const requireSelectedBook = useCallback(() => {
    if (!draft?.id || !book?.id) {
      toast.error("Select or create a book first.");
      return null;
    }
    return {
      bookId: book.id,
      draftId: draft.id,
    };
  }, [book, draft]);

  const applyDraftPatch = useCallback(
    (patch: Partial<BookDraft>) => {
      onDraftChange({ ...draft, ...patch });
    },
    [draft, onDraftChange],
  );

  const saveBook = useCallback(
    async (overrides?: Partial<BookDraft>) => {
      const selected = requireSelectedBook();
      if (!selected) return;
      const nextDraft = { ...draft, ...overrides };
      onDraftChange(nextDraft);
      setSaving(true);
      try {
        await adminUpdateBook({
          data: {
            id: selected.draftId,
            title: nextDraft.title,
            subtitle: nextDraft.subtitle,
            slug: nextDraft.slug,
            category: nextDraft.category,
            size: nextDraft.size,
            launch_mode: nextDraft.launch_mode,
            blurb: nextDraft.blurb,
            published: nextDraft.published,
            sort_order: nextDraft.sort_order,
            cover_url: nextDraft.cover_url,
          },
        });
        await onReload(selected.draftId);
        toast.success(`Saved ${nextDraft.title}.`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save the book.");
      } finally {
        setSaving(false);
      }
    },
    [draft, onDraftChange, onReload, requireSelectedBook],
  );

  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const selected = requireSelectedBook();
    if (!selected) {
      event.target.value = "";
      return;
    }
    setCoverUploading(true);
    try {
      const signed = await adminSignCloudinaryUpload({
        data: { kind: "cover", bookSlug: draft.slug || draft.title, fileName: file.name },
      });
      const coverUrl = await uploadFile(file, signed);
      await adminSaveBookCover({ data: { id: selected.draftId, coverUrl } });
      onDraftChange({ ...draft, cover_url: coverUrl });
      await onReload(selected.draftId);
      toast.success("Cover image updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not upload the cover image.");
    } finally {
      event.target.value = "";
      setCoverUploading(false);
    }
  }

  async function handlePageUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    const selected = requireSelectedBook();
    if (!selected) {
      event.target.value = "";
      return;
    }

    setPageUploadProgress({
      active: true,
      stage: "uploading",
      total: files.length,
      completed: 0,
      uploaded: 0,
      failed: 0,
      failedFiles: [],
    });

    const uploadedUrls: string[] = [];
    const failedFiles: string[] = [];

    try {
      for (let index = 0; index < files.length; index += 3) {
        const batch = files.slice(index, index + 3);
        const results = await Promise.allSettled(
          batch.map(async (file) => {
            const signed = await adminSignCloudinaryUpload({
              data: { kind: "page", bookSlug: draft.slug || draft.title, fileName: file.name },
            });
            const secureUrl = await uploadFile(file, signed);
            return { fileName: file.name, secureUrl };
          }),
        );

        results.forEach((result, resultIndex) => {
          if (result.status === "fulfilled") {
            uploadedUrls.push(result.value.secureUrl);
          } else {
            failedFiles.push(batch[resultIndex]?.name ?? "Unknown file");
          }
        });

        setPageUploadProgress((current) => ({
          ...current,
          stage: "uploading",
          completed: uploadedUrls.length + failedFiles.length,
          uploaded: uploadedUrls.length,
          failed: failedFiles.length,
          failedFiles: [...failedFiles],
        }));
      }

      if (uploadedUrls.length > 0) {
        setPageUploadProgress((current) => ({
          ...current,
          stage: "saving",
          completed: current.total,
        }));
        try {
          const nextPages = await adminCreateBookPages({
            data: { bookId: selected.draftId, imageUrls: uploadedUrls },
          });
          setPages((nextPages ?? []).filter(isBookPageRow));
          await onReload(selected.draftId);
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "We uploaded the images, but we could not save the pages yet.",
          );
          return;
        }
      }

      const summary = `Done: ${uploadedUrls.length} uploaded, ${failedFiles.length} failed`;
      if (uploadedUrls.length > 0 && failedFiles.length === 0) {
        toast.success(summary);
      } else if (uploadedUrls.length > 0) {
        toast.success(summary);
      } else {
        toast.error(`Done: 0 uploaded, ${failedFiles.length} failed`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not upload those page images.");
    } finally {
      event.target.value = "";
      setPageUploadProgress((current) => ({
        ...current,
        active: false,
        stage: "done",
      }));
    }
  }

  async function movePage(pageId: string, direction: -1 | 1) {
    const selected = requireSelectedBook();
    if (!selected) return;
    const currentIndex = visiblePages.findIndex((page) => page.id === pageId);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= visiblePages.length) return;

    const previousPages = [...visiblePages];
    const nextPages = [...visiblePages];
    const [moved] = nextPages.splice(currentIndex, 1);
    nextPages.splice(nextIndex, 0, moved);
    setPages(nextPages);
    setReordering(true);

    try {
      const refreshed = await adminReorderBookPages({
        data: { bookId: selected.draftId, pageIds: nextPages.map((page) => page.id) },
      });
      setPages((refreshed ?? []).filter(isBookPageRow));
      await onReload(selected.draftId);
    } catch (error) {
      setPages(previousPages);
      toast.error(error instanceof Error ? error.message : "Could not reorder pages.");
    } finally {
      setReordering(false);
    }
  }

  async function deletePage(pageId: string) {
    const selected = requireSelectedBook();
    if (!selected) return;
    setDeletingPageId(pageId);
    try {
      const nextPages = await adminDeleteBookPage({
        data: { pageId, bookId: selected.draftId },
      });
      setPages((nextPages ?? []).filter(isBookPageRow));
      await onReload(selected.draftId);
      toast.success("Page removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove the page.");
    } finally {
      setDeletingPageId(null);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <Dialog open={Boolean(previewImage)} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-5xl">
          <DialogTitle>Page preview</DialogTitle>
          {previewImage ? (
            <img
              src={previewImage}
              alt="Full page preview"
              className="max-h-[80vh] w-full rounded-md object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="grid gap-5 xl:grid-cols-[260px_1fr]">
        <div>
          <div className="rounded-xl border border-border bg-background p-3">
            <img
              src={draft.cover_url}
              alt={draft.title}
              className="h-80 w-full rounded-xl bg-muted object-contain shadow-[var(--shadow)]"
            />
          </div>
          <label className="mt-3 block text-sm">
            <span className="mb-2 block font-medium">Cover image</span>
            <span className="mb-2 block text-sm text-muted-foreground">
              Upload a new cover image for this book.
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              disabled={isBusy}
            />
          </label>
          <p className="mt-3 text-xs text-muted-foreground">
            {visiblePages.length} page image{visiblePages.length === 1 ? "" : "s"} · {formatMoney(book.online_price_cents / 100)} online
          </p>
        </div>

        <div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Book title"
              helperText="This is the name shown in the library."
              value={draft.title}
              disabled={isBusy}
              onChange={(value) => applyDraftPatch({ title: value })}
            />
            <Field
              label="Short description"
              helperText="Use a short line that helps members recognize the book."
              value={draft.subtitle}
              disabled={isBusy}
              onChange={(value) => applyDraftPatch({ subtitle: value })}
            />
            <Field
              label="Category"
              helperText="Choose the shelf or topic for this book."
              value={draft.category}
              disabled={isBusy}
              onChange={(value) => applyDraftPatch({ category: value })}
            />
            <Field
              label="Shelf order"
              helperText="Lower numbers appear first in the library."
              value={String(draft.sort_order)}
              disabled={isBusy}
              onChange={(value) =>
                applyDraftPatch({ sort_order: Number.parseInt(value || "0", 10) || 0 })
              }
            />
            <SelectField
              label="Size"
              helperText="Choose the reading size shown to members."
              value={draft.size}
              options={["short", "medium", "full"]}
              disabled={isBusy}
              onChange={(value) => applyDraftPatch({ size: value as BookDraft["size"] })}
            />
            <SelectField
              label="Launch mode"
              helperText="Choose whether this book follows pre-launch access or full launch access."
              value={draft.launch_mode}
              options={["prelaunch", "launch"]}
              disabled={isBusy}
              onChange={(value) =>
                applyDraftPatch({ launch_mode: value as BookDraft["launch_mode"] })
              }
            />
            <label className="rounded-md border border-border bg-background px-3 py-2 text-sm">
              <span className="block font-medium">Show this book on the public site</span>
              <span className="mt-1 block text-sm text-muted-foreground">
                Turn this off to hide the book while you keep editing it.
              </span>
              <span className="mt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.published}
                  disabled={isBusy}
                  onChange={(event) => applyDraftPatch({ published: event.target.checked })}
                />
                {draft.published ? "Visible on site" : "Hidden from site"}
              </span>
            </label>
          </div>

          <label className="mt-4 block text-sm">
            <span className="mb-2 block font-medium">Full description</span>
            <span className="mb-2 block text-sm text-muted-foreground">
              Save the longer description shown on the book page.
            </span>
            <textarea
              value={draft.blurb}
              disabled={isBusy}
              onChange={(event) => applyDraftPatch({ blurb: event.target.value })}
              className="min-h-32 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </label>

          <label className="mt-4 block text-sm">
            <span className="mb-2 block font-medium">Workspace note</span>
            <span className="mb-2 block text-sm text-muted-foreground">
              Keep a local note for your next editing session.
            </span>
            <textarea
              value={note}
              disabled={isBusy}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder="Optional note for your next visit"
              className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="button" variant="navy" onClick={() => void saveBook()} disabled={isBusy}>
              {saving ? "Saving…" : "Save book"}
            </Button>
            <Button
              type="button"
              variant={draft.published ? "outline" : "profit"}
              onClick={() => void saveBook({ published: !draft.published })}
              disabled={isBusy}
            >
              {draft.published ? "Hide this book" : "Publish this book"}
            </Button>
            <Button type="button" variant="outline" onClick={onClearDraft} disabled={isBusy}>
              Clear draft
            </Button>
            <Button
              type="button"
              variant="loss"
              onClick={async () => {
                if (!window.confirm(`Delete ${draft.title} and all pages?`)) return;
                const selected = requireSelectedBook();
                if (!selected) return;
                setDeletingBook(true);
                try {
                  await adminDeleteBook({ data: { id: selected.draftId } });
                  await onReload(null);
                  onClearDraft();
                  toast.success("Book deleted.");
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Could not delete the book.");
                } finally {
                  setDeletingBook(false);
                }
              }}
              disabled={isBusy}
            >
              {deletingBook ? "Deleting…" : "Delete book"}
            </Button>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">Book pages</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload page images, preview them full size, reorder them, or remove one page.
                </p>
                {pageUploadProgress.stage !== "idle" ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {getPageUploadMessage(pageUploadProgress)}
                  </p>
                ) : null}
                {pageUploadProgress.failedFiles.length > 0 ? (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>Files that could not be uploaded:</p>
                    <p>{pageUploadProgress.failedFiles.join(", ")}</p>
                  </div>
                ) : null}
              </div>
              <label className="text-sm">
                <span className="mb-2 block font-medium">Upload page images</span>
                <span className="mb-2 block text-sm text-muted-foreground">
                  Choose one or many images. We upload a few at a time and keep going if one
                  file fails.
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePageUpload}
                  disabled={isBusy}
                />
              </label>
            </div>

            {visiblePages.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No pages yet. Upload page images for this book.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {visiblePages.map((page, index) => {
                  const pageBusy = deletingPageId === page.id || reordering;
                  return (
                    <div key={page.id} className="rounded-lg border border-border bg-card p-3">
                      <button
                        type="button"
                        className="w-full rounded-md border border-border bg-muted p-2"
                        onClick={() => setPreviewImage(page.image_url)}
                      >
                        <img
                          src={page.image_url}
                          alt={`Page ${page.page_number}`}
                          className="h-80 w-full rounded-md object-contain"
                        />
                      </button>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">Page {page.page_number}</p>
                        <Button type="button" size="sm" variant="outline" onClick={() => setPreviewImage(page.image_url)}>
                          Open preview
                        </Button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={pageBusy || index === 0}
                          onClick={() => void movePage(page.id, -1)}
                        >
                          Move up
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={pageBusy || index === visiblePages.length - 1}
                          onClick={() => void movePage(page.id, 1)}
                        >
                          Move down
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="loss"
                          disabled={pageBusy}
                          onClick={() => void deletePage(page.id)}
                        >
                          {deletingPageId === page.id ? "Deleting…" : "Delete"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function UsersPanel() {
  const [usersState, setUsersState] = useState<QueryState<UsersData>>(() => createLoadingState());
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setUsersState(createLoadingState());
    try {
      const users = await adminUsers();
      setUsersState(createReadyState(users));
    } catch (error: unknown) {
      setUsersState(createErrorState(error, "Could not load users."));
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (usersState.status === "loading") {
    return <PanelStateCard title="Loading members" message="Fetching member details for review." />;
  }

  if (usersState.status === "error") {
    return (
      <PanelStateCard
        title="Members failed to load"
        message={usersState.error}
        actionLabel="Retry"
        onAction={() => {
          void reload();
        }}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card p-4">
      <div className="mb-4">
        <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">Members</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Review members, see each role, and update tagged or banned status.
        </p>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Tagged</th>
            <th>Banned</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {usersState.data.map((user) => {
            const busy = busyUserId === user.user_id;
            return (
              <tr key={user.user_id} className="border-b border-border align-top">
                <td className="py-3">{getMemberName(user)}</td>
                <td>{user.email ?? "—"}</td>
                <td>{formatRoleLabel(user.role)}</td>
                <td>{user.deriv_tagged ? "Yes" : "No"}</td>
                <td>{user.banned ? "Yes" : "No"}</td>
                <td className="space-x-2 whitespace-nowrap">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={async () => {
                      setBusyUserId(user.user_id);
                      try {
                        await adminSetTagged({
                          data: { userId: user.user_id, tagged: !user.deriv_tagged },
                        });
                        await reload();
                        toast.success(
                          user.deriv_tagged ? "Tag removed from member." : "Member tagged.",
                        );
                      } catch (error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : "We could not update the member tag.",
                        );
                      } finally {
                        setBusyUserId(null);
                      }
                    }}
                  >
                    {user.deriv_tagged ? "Remove tag" : "Tag member"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={user.banned ? "profit" : "loss"}
                    disabled={busy}
                    onClick={async () => {
                      setBusyUserId(user.user_id);
                      try {
                        await adminSetBan({ data: { userId: user.user_id, banned: !user.banned } });
                        await reload();
                        toast.success(user.banned ? "Member unbanned." : "Member banned.");
                      } catch (error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : "We could not update the member status.",
                        );
                      } finally {
                        setBusyUserId(null);
                      }
                    }}
                  >
                    {user.banned ? "Unban member" : "Ban member"}
                  </Button>
                </td>
              </tr>
            );
          })}
          {usersState.data.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-6 text-muted-foreground">
                No members yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function CouponsPanel() {
  const [couponState, setCouponState] = useState<
    QueryState<{ rows: CouponsData; books: BookRow[]; users: UsersData }>
  >(() => createLoadingState());
  const [form, setForm] = useState<CouponForm>(EMPTY_COUPON_FORM);
  const [creating, setCreating] = useState(false);
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setCouponState(createLoadingState());
    try {
      const [couponRows, bookRows, userRows] = await Promise.all([
        adminCoupons(),
        adminBooks(),
        adminUsers(),
      ]);
      setCouponState(
        createReadyState({
          rows: couponRows ?? [],
          books: bookRows,
          users: userRows,
        }),
      );
    } catch (error: unknown) {
      setCouponState(createErrorState(error, "Could not load coupons."));
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (couponState.status === "loading") {
    return <PanelStateCard title="Loading coupons" message="Fetching coupons, books, and users." />;
  }

  if (couponState.status === "error") {
    return (
      <PanelStateCard
        title="Coupons failed to load"
        message={couponState.error}
        actionLabel="Retry"
        onAction={() => {
          void reload();
        }}
      />
    );
  }

  const booksById = new Map(couponState.data.books.map((book) => [book.id, book.title]));
  const usersById = new Map(
    couponState.data.users.map((user) => [user.user_id, user.email ?? user.full_name ?? user.user_id]),
  );

  return (
    <div className="space-y-6">
      <form
        className="rounded-xl border border-border bg-card p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setCreating(true);
          try {
            const created = await adminCreateCoupon({
              data: {
                code: form.code.trim() || undefined,
                kind: form.kind.trim(),
                usesRemaining: Number.parseInt(form.usesRemaining || "1", 10) || 1,
                bookId: form.bookId || undefined,
                userId: form.userId || undefined,
              },
            });
            setForm(EMPTY_COUPON_FORM);
            await reload();
            toast.success(`Coupon created: ${created.code}.`);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not create the coupon.");
          } finally {
            setCreating(false);
          }
        }}
      >
        <div className="mb-4">
          <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">Coupons</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a coupon code. Leave the code blank if you want us to generate one for you.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field
            label="Coupon code"
            helperText="Leave blank to auto-generate a code."
            value={form.code}
            disabled={creating}
            onChange={(value) => setForm((current) => ({ ...current, code: value }))}
          />
          <Field
            label="Total uses"
            helperText="Choose how many times this code can be used."
            value={form.usesRemaining}
            disabled={creating}
            onChange={(value) => setForm((current) => ({ ...current, usesRemaining: value }))}
          />
          <label className="text-sm">
            <span className="mb-2 block font-medium">Book</span>
            <span className="mb-2 block text-sm text-muted-foreground">
              Leave blank if this coupon should work for any book.
            </span>
            <select
              value={form.bookId}
              disabled={creating}
              onChange={(event) => setForm((current) => ({ ...current, bookId: event.target.value }))}
              className="h-11 w-full rounded-md border border-border bg-background px-3"
            >
              <option value="">All books</option>
              {couponState.data.books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-2 block font-medium">Member</span>
            <span className="mb-2 block text-sm text-muted-foreground">
              Leave blank if the code is not tied to one member.
            </span>
            <select
              value={form.userId}
              disabled={creating}
              onChange={(event) => setForm((current) => ({ ...current, userId: event.target.value }))}
              className="h-11 w-full rounded-md border border-border bg-background px-3"
            >
              <option value="">Unassigned</option>
              {couponState.data.users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.email ?? user.full_name ?? user.user_id}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Button type="submit" variant="navy" className="mt-4" disabled={creating}>
          {creating ? "Creating coupon…" : "Create coupon"}
        </Button>
      </form>

      {couponState.data.rows.length === 0 ? (
        <PanelStateCard title="No coupons yet." message="Create a coupon code." />
      ) : (
        <ul className="space-y-3 text-sm">
          {couponState.data.rows.map((coupon) => (
            <li key={coupon.id} className="rounded-xl border border-border bg-card px-4 py-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-medium">{coupon.code}</p>
                  <p className="mt-1 text-muted-foreground">
                    {coupon.uses_remaining ?? 0} use{coupon.uses_remaining === 1 ? "" : "s"} left
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Book: {coupon.book_id ? booksById.get(coupon.book_id) ?? coupon.book_id : "All books"}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Member: {coupon.user_id ? usersById.get(coupon.user_id) ?? coupon.user_id : "Unassigned"}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Created: {formatDateTime(coupon.created_at)}
                    {coupon.expires_at ? ` · Expires: ${formatDateTime(coupon.expires_at)}` : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="loss"
                  disabled={deletingCouponId === coupon.id}
                  onClick={async () => {
                    setDeletingCouponId(coupon.id);
                    try {
                      await adminDeleteCoupon({ data: { id: coupon.id } });
                      await reload();
                      toast.success("Coupon deleted.");
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "Could not delete the coupon.");
                    } finally {
                      setDeletingCouponId(null);
                    }
                  }}
                >
                  {deletingCouponId === coupon.id ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SalesPanel() {
  const [salesState, setSalesState] = useState<QueryState<SalesData>>(() => createLoadingState());
  const [logsState, setLogsState] = useState<QueryState<LogsData>>(() => createLoadingState());

  const loadSales = useCallback(async () => {
    setSalesState(createLoadingState());
    try {
      const saleRows = await adminSales();
      setSalesState(createReadyState(saleRows ?? []));
    } catch (error: unknown) {
      setSalesState(createErrorState(error, "Could not load purchases."));
    }
  }, []);

  const loadLogs = useCallback(async () => {
    setLogsState(createLoadingState());
    try {
      const logRows = await adminLogs();
      setLogsState(createReadyState(logRows ?? []));
    } catch (error: unknown) {
      setLogsState(createErrorState(error, "Could not load reading logs."));
    }
  }, []);

  useEffect(() => {
    void loadSales();
    void loadLogs();
  }, [loadLogs, loadSales]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="font-display text-2xl">Sales</h2>
        {salesState.status === "loading" ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading purchases…</p>
        ) : null}
        {salesState.status === "error" ? (
          <PanelStateCard
            title="Purchases failed to load"
            message={salesState.error}
            actionLabel="Retry"
            onAction={() => {
              void loadSales();
            }}
          />
        ) : null}
        {salesState.status === "ready" ? (
          <ul className="mt-3 space-y-2 text-sm">
            {salesState.data.map((sale) => (
              <li key={sale.id} className="rounded-md border border-border bg-card px-3 py-2">
                <p className="font-medium">
                  {sale.kind} · {formatMoney((sale.amount_cents ?? 0) / 100)}
                </p>
                <p className="text-muted-foreground">
                  {sale.provider} · {sale.status} · ref {sale.reference ?? "pending"}
                </p>
              </li>
            ))}
            {salesState.data.length === 0 ? (
              <li className="text-muted-foreground">No paid orders yet.</li>
            ) : null}
          </ul>
        ) : null}
      </div>

      <div>
        <h2 className="font-display text-2xl">Reader activity</h2>
        {logsState.status === "loading" ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading reading logs…</p>
        ) : null}
        {logsState.status === "error" ? (
          <PanelStateCard
            title="Reading logs failed to load"
            message={logsState.error}
            actionLabel="Retry"
            onAction={() => {
              void loadLogs();
            }}
          />
        ) : null}
        {logsState.status === "ready" ? (
          <ul className="mt-3 space-y-2 text-sm">
            {logsState.data.map((log, index) => (
              <li
                key={`${log.user_id}-${log.book_id}-${index}`}
                className="rounded-md border border-border bg-card px-3 py-2"
              >
                {log.user_id.slice(0, 8)} · book {log.book_id} · page {log.page_index + 1}
              </li>
            ))}
            {logsState.data.length === 0 ? (
              <li className="text-muted-foreground">No reading progress yet.</li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  helperText,
  value,
  onChange,
  disabled,
  type = "text",
}: {
  label: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  type?: "text" | "email";
}) {
  return (
    <label className="text-sm">
      <span className="mb-2 block font-medium">{label}</span>
      {helperText ? (
        <span className="mb-2 block text-sm text-muted-foreground">{helperText}</span>
      ) : null}
      <Input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({
  label,
  helperText,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  helperText?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="text-sm">
      <span className="mb-2 block font-medium">{label}</span>
      {helperText ? (
        <span className="mb-2 block text-sm text-muted-foreground">{helperText}</span>
      ) : null}
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-md border border-border bg-background px-3"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
