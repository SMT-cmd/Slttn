import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
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

type SettingsForm = {
  global_prelaunch: boolean;
  partner_code: string;
  support_email: string;
  telegram_url: string;
  whatsapp_url: string;
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
  total: number;
  uploaded: number;
  failed: number;
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

function normalizeSettings(settings: Record<string, unknown>): SettingsForm {
  return {
    global_prelaunch:
      typeof settings.global_prelaunch === "boolean" ? settings.global_prelaunch : true,
    partner_code: typeof settings.partner_code === "string" ? settings.partner_code : "",
    support_email: typeof settings.support_email === "string" ? settings.support_email : "",
    telegram_url: typeof settings.telegram_url === "string" ? settings.telegram_url : "",
    whatsapp_url: typeof settings.whatsapp_url === "string" ? settings.whatsapp_url : "",
  };
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
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
      className={`h-10 rounded-md px-4 text-sm capitalize ${
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
    toast.success("Admin workspace draft cleared.");
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
              Manage books, covers, pages, coupons, users, sales, and settings with a
              persistent local workspace.
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
          <TabButton active={workspace.activeTab === "overview"} label="overview" onClick={() => setTab("overview")} />
          <TabButton active={workspace.activeTab === "books"} label="books" onClick={() => setTab("books")} />
          <TabButton active={workspace.activeTab === "users"} label="users" onClick={() => setTab("users")} />
          <TabButton active={workspace.activeTab === "coupons"} label="coupons" onClick={() => setTab("coupons")} />
          <TabButton active={workspace.activeTab === "sales"} label="sales" onClick={() => setTab("sales")} />
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
        ["Users", String(data.users)],
        ["Tagged", String(data.tagged)],
        ["Paid Sales", String(data.salesCount)],
        ["Sales Amount", formatMoney(data.salesCents / 100)],
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
          setSaving(true);
          const saves: Array<[string, string]> = [
            ["global_prelaunch", String(form.global_prelaunch)],
            ["partner_code", form.partner_code],
            ["support_email", form.support_email],
            ["telegram_url", form.telegram_url],
            ["whatsapp_url", form.whatsapp_url],
          ];
          try {
            await Promise.all(
              saves.map(([key, value]) => adminSaveSetting({ data: { key, value } })),
            );
            await loadOverview();
            toast.success("Settings saved.");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not save settings.");
          } finally {
            setSaving(false);
          }
        }}
      >
        <div className="mb-4">
          <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">Settings</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Save global prelaunch mode, partner code, and support links without leaving
            the admin area.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="rounded-lg border border-border bg-background p-4 text-sm">
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.global_prelaunch}
                onChange={(event) =>
                  setForm((current) =>
                    current ? { ...current, global_prelaunch: event.target.checked } : current,
                  )
                }
              />
              Global prelaunch
            </span>
          </label>
          <Field
            label="Partner code"
            value={form.partner_code}
            onChange={(value) =>
              setForm((current) => (current ? { ...current, partner_code: value } : current))
            }
          />
          <Field
            label="Support email"
            value={form.support_email}
            onChange={(value) =>
              setForm((current) => (current ? { ...current, support_email: value } : current))
            }
          />
          <Field
            label="Telegram URL"
            value={form.telegram_url}
            onChange={(value) =>
              setForm((current) => (current ? { ...current, telegram_url: value } : current))
            }
          />
          <Field
            label="WhatsApp URL"
            value={form.whatsapp_url}
            onChange={(value) =>
              setForm((current) => (current ? { ...current, whatsapp_url: value } : current))
            }
          />
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
  setWorkspace: React.Dispatch<React.SetStateAction<AdminWorkspaceDraft>>;
  clearWorkspaceDraft: () => void;
}) {
  const [booksState, setBooksState] = useState<QueryState<BookRow[]>>(() => createLoadingState());
  const [newBook, setNewBook] = useState<NewBookForm>(EMPTY_BOOK);
  const [creating, setCreating] = useState(false);

  const updateSelectedBook = useCallback(
    (book: BookRow | null) => {
      setWorkspace((current) => ({
        ...current,
        activeTab: "books",
        selectedBookId: book?.id ?? null,
        draft: book ? createBookDraft(book) : null,
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
        updateSelectedBook(nextBook);
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
          Create a book, then continue editing it from the admin workspace.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Title" value={newBook.title} onChange={(value) => setNewBook((current) => ({ ...current, title: value }))} />
          <Field label="Subtitle" value={newBook.subtitle} onChange={(value) => setNewBook((current) => ({ ...current, subtitle: value }))} />
          <Field label="Slug" value={newBook.slug} onChange={(value) => setNewBook((current) => ({ ...current, slug: value }))} />
          <Field label="Category" value={newBook.category} onChange={(value) => setNewBook((current) => ({ ...current, category: value }))} />
          <SelectField
            label="Size"
            value={newBook.size}
            options={["short", "medium", "full"]}
            onChange={(value) =>
              setNewBook((current) => ({ ...current, size: value as NewBookForm["size"] }))
            }
          />
          <SelectField
            label="Launch mode"
            value={newBook.launch_mode}
            options={["prelaunch", "launch"]}
            onChange={(value) =>
              setNewBook((current) => ({
                ...current,
                launch_mode: value as NewBookForm["launch_mode"],
              }))
            }
          />
        </div>
        <label className="mt-4 block text-sm">
          <span className="mb-2 block text-muted-foreground">Blurb</span>
          <textarea
            value={newBook.blurb}
            onChange={(event) => setNewBook((current) => ({ ...current, blurb: event.target.value }))}
            className="min-h-28 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={newBook.published}
            onChange={(event) => setNewBook((current) => ({ ...current, published: event.target.checked }))}
          />
          Published
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
                      {book.slug} · {book.pages?.length ?? 0} pages
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {book.published ? "Published" : "Unpublished"} · sort {book.sort_order}
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
                message="Choose a book from the list to edit covers, pages, coupons, and metadata."
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
  const [pages, setPages] = useState<BookPageRow[]>(book.pages ?? []);
  const [saving, setSaving] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [pageUploadProgress, setPageUploadProgress] = useState<PageUploadProgress>({
    active: false,
    total: 0,
    uploaded: 0,
    failed: 0,
  });
  const [reordering, setReordering] = useState(false);
  const [deletingPageId, setDeletingPageId] = useState<string | null>(null);
  const [deletingBook, setDeletingBook] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setPages(book.pages ?? []);
  }, [book]);

  const isBusy = saving || coverUploading || pageUploadProgress.active || reordering || deletingBook;

  const applyDraftPatch = useCallback(
    (patch: Partial<BookDraft>) => {
      onDraftChange({ ...draft, ...patch });
    },
    [draft, onDraftChange],
  );

  const saveBook = useCallback(
    async (overrides?: Partial<BookDraft>) => {
      const nextDraft = { ...draft, ...overrides };
      onDraftChange(nextDraft);
      setSaving(true);
      try {
        await adminUpdateBook({
          data: {
            id: nextDraft.id,
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
        await onReload(nextDraft.id);
        toast.success(`Saved ${nextDraft.title}.`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save the book.");
      } finally {
        setSaving(false);
      }
    },
    [draft, onDraftChange, onReload],
  );

  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const signed = await adminSignCloudinaryUpload({
        data: { kind: "cover", bookSlug: draft.slug || draft.title, fileName: file.name },
      });
      const coverUrl = await uploadFile(file, signed);
      await adminSaveBookCover({ data: { id: draft.id, coverUrl } });
      onDraftChange({ ...draft, cover_url: coverUrl });
      await onReload(draft.id);
      toast.success("Cover updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cover upload failed.");
    } finally {
      event.target.value = "";
      setCoverUploading(false);
    }
  }

  async function handlePageUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setPageUploadProgress({
      active: true,
      total: files.length,
      uploaded: 0,
      failed: 0,
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
          uploaded: uploadedUrls.length,
          failed: failedFiles.length,
        }));
      }

      if (uploadedUrls.length > 0) {
        const nextPages = await adminCreateBookPages({
          data: { bookId: draft.id, imageUrls: uploadedUrls },
        });
        setPages(nextPages);
        await onReload(draft.id);
      }

      if (uploadedUrls.length > 0 && failedFiles.length === 0) {
        toast.success(`Uploaded ${uploadedUrls.length} page image${uploadedUrls.length === 1 ? "" : "s"}.`);
      } else if (uploadedUrls.length > 0) {
        toast.success(
          `Uploaded ${uploadedUrls.length} of ${files.length} page images. ${failedFiles.length} failed.`,
        );
      } else {
        toast.error(`All ${files.length} page uploads failed.`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Page upload failed.");
    } finally {
      event.target.value = "";
      setPageUploadProgress((current) => ({ ...current, active: false }));
    }
  }

  async function movePage(pageId: string, direction: -1 | 1) {
    const currentIndex = pages.findIndex((page) => page.id === pageId);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= pages.length) return;

    const previousPages = [...pages];
    const nextPages = [...pages];
    const [moved] = nextPages.splice(currentIndex, 1);
    nextPages.splice(nextIndex, 0, moved);
    setPages(nextPages);
    setReordering(true);

    try {
      const refreshed = await adminReorderBookPages({
        data: { bookId: draft.id, pageIds: nextPages.map((page) => page.id) },
      });
      setPages(refreshed);
      await onReload(draft.id);
    } catch (error) {
      setPages(previousPages);
      toast.error(error instanceof Error ? error.message : "Could not reorder pages.");
    } finally {
      setReordering(false);
    }
  }

  async function deletePage(pageId: string) {
    setDeletingPageId(pageId);
    try {
      const nextPages = await adminDeleteBookPage({
        data: { pageId, bookId: draft.id },
      });
      setPages(nextPages);
      await onReload(draft.id);
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
            <span className="mb-2 block text-muted-foreground">Replace cover</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              disabled={isBusy}
            />
          </label>
          <p className="mt-3 text-xs text-muted-foreground">
            {pages.length} page image{pages.length === 1 ? "" : "s"} · {formatMoney(book.online_price_cents / 100)} online
          </p>
        </div>

        <div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title" value={draft.title} onChange={(value) => applyDraftPatch({ title: value })} />
            <Field label="Subtitle" value={draft.subtitle} onChange={(value) => applyDraftPatch({ subtitle: value })} />
            <Field label="Slug" value={draft.slug} onChange={(value) => applyDraftPatch({ slug: value })} />
            <Field label="Category" value={draft.category} onChange={(value) => applyDraftPatch({ category: value })} />
            <Field
              label="Sort order"
              value={String(draft.sort_order)}
              onChange={(value) =>
                applyDraftPatch({ sort_order: Number.parseInt(value || "0", 10) || 0 })
              }
            />
            <SelectField
              label="Size"
              value={draft.size}
              options={["short", "medium", "full"]}
              onChange={(value) => applyDraftPatch({ size: value as BookDraft["size"] })}
            />
            <SelectField
              label="Launch mode"
              value={draft.launch_mode}
              options={["prelaunch", "launch"]}
              onChange={(value) =>
                applyDraftPatch({ launch_mode: value as BookDraft["launch_mode"] })
              }
            />
            <label className="flex items-end gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(event) => applyDraftPatch({ published: event.target.checked })}
              />
              Published
            </label>
          </div>

          <label className="mt-4 block text-sm">
            <span className="mb-2 block text-muted-foreground">Blurb</span>
            <textarea
              value={draft.blurb}
              onChange={(event) => applyDraftPatch({ blurb: event.target.value })}
              className="min-h-32 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </label>

          <label className="mt-4 block text-sm">
            <span className="mb-2 block text-muted-foreground">Admin note</span>
            <textarea
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder="Optional workspace note"
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
              {draft.published ? "Unpublish" : "Publish"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                applyDraftPatch({
                  launch_mode: draft.launch_mode === "prelaunch" ? "launch" : "prelaunch",
                })
              }
              disabled={isBusy}
            >
              Toggle launch mode
            </Button>
            <Button type="button" variant="outline" onClick={onClearDraft} disabled={isBusy}>
              Clear draft
            </Button>
            <Button
              type="button"
              variant="loss"
              onClick={async () => {
                if (!window.confirm(`Delete ${draft.title} and all pages?`)) return;
                setDeletingBook(true);
                try {
                  await adminDeleteBook({ data: { id: draft.id } });
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
                  Upload page images, preview them at full size, reorder them, or remove one page.
                </p>
                {pageUploadProgress.active ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Uploaded {pageUploadProgress.uploaded} of {pageUploadProgress.total}
                    {pageUploadProgress.failed > 0 ? ` · ${pageUploadProgress.failed} failed` : ""}
                  </p>
                ) : null}
              </div>
              <label className="text-sm">
                <span className="mb-2 block text-muted-foreground">Upload page images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePageUpload}
                  disabled={isBusy}
                />
              </label>
            </div>

            {pages.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No pages yet. Upload page images.</p>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {pages.map((page, index) => {
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
                          Enlarge
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
                          disabled={pageBusy || index === pages.length - 1}
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
    return <PanelStateCard title="Loading users" message="Fetching profiles for admin review." />;
  }

  if (usersState.status === "error") {
    return (
      <PanelStateCard
        title="Users failed to load"
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
        <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">Users</p>
        <p className="mt-2 text-sm text-muted-foreground">
          List email, role, tagged state, and ban state. Update tagged and banned flags directly.
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
                <td className="py-3">{user.full_name ?? "Unnamed"}</td>
                <td>{user.email ?? "—"}</td>
                <td>{user.role}</td>
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
                        toast.success(user.deriv_tagged ? "User untagged." : "User tagged.");
                      } catch (error) {
                        toast.error(
                          error instanceof Error ? error.message : "Could not update tagged status.",
                        );
                      } finally {
                        setBusyUserId(null);
                      }
                    }}
                  >
                    {user.deriv_tagged ? "Untag" : "Tag"}
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
                        toast.success(user.banned ? "User unbanned." : "User banned.");
                      } catch (error) {
                        toast.error(
                          error instanceof Error ? error.message : "Could not update ban status.",
                        );
                      } finally {
                        setBusyUserId(null);
                      }
                    }}
                  >
                    {user.banned ? "Unban" : "Ban"}
                  </Button>
                </td>
              </tr>
            );
          })}
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
            await adminCreateCoupon({
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
            toast.success("Coupon created.");
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
            Create admin coupons with manual or auto-generated codes. Leave the code blank to auto-generate one.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Field label="Code" value={form.code} onChange={(value) => setForm((current) => ({ ...current, code: value }))} />
          <Field label="Kind" value={form.kind} onChange={(value) => setForm((current) => ({ ...current, kind: value }))} />
          <Field
            label="Uses remaining"
            value={form.usesRemaining}
            onChange={(value) => setForm((current) => ({ ...current, usesRemaining: value }))}
          />
          <label className="text-sm">
            <span className="mb-2 block text-muted-foreground">Book</span>
            <select
              value={form.bookId}
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
            <span className="mb-2 block text-muted-foreground">User</span>
            <select
              value={form.userId}
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
        <PanelStateCard title="No coupons yet." message="Create your first coupon from the form above." />
      ) : (
        <ul className="space-y-3 text-sm">
          {couponState.data.rows.map((coupon) => (
            <li key={coupon.id} className="rounded-xl border border-border bg-card px-4 py-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-medium">{coupon.code}</p>
                  <p className="mt-1 text-muted-foreground">
                    {coupon.kind} · {coupon.uses_remaining ?? 0} left
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Book: {coupon.book_id ? booksById.get(coupon.book_id) ?? coupon.book_id : "All books"}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    User: {coupon.user_id ? usersById.get(coupon.user_id) ?? coupon.user_id : "Unassigned"}
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
              <li className="text-muted-foreground">No sales yet.</li>
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
              <li className="text-muted-foreground">No pages opened yet.</li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm">
      <span className="mb-2 block text-muted-foreground">{label}</span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm">
      <span className="mb-2 block text-muted-foreground">{label}</span>
      <select
        value={value}
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
