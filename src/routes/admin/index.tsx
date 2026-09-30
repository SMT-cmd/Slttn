import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { ADMIN_ACCESS_TIMEOUT_MS, runAdminAccessCheck } from "@/lib/admin/access";
import { signOut } from "@/lib/auth/client";
import { RedirectToSignIn } from "@/lib/auth/gates";
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
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({ component: Admin });

type TabKey = "overview" | "books" | "users" | "coupons" | "sales";
type OverviewData = Awaited<ReturnType<typeof adminOverview>>;
type UsersData = Awaited<ReturnType<typeof adminUsers>>;
type CouponsData = NonNullable<Awaited<ReturnType<typeof adminCoupons>>>;
type SalesData = NonNullable<Awaited<ReturnType<typeof adminSales>>>;
type LogsData = NonNullable<Awaited<ReturnType<typeof adminLogs>>>;
type SignedUpload = Awaited<ReturnType<typeof adminSignCloudinaryUpload>>;

type SettingsForm = {
  global_prelaunch: boolean;
  partner_code: string;
  support_email: string;
  telegram_url: string;
  whatsapp_url: string;
  community_links: string;
};

type BookDraft = {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  category: string;
  size: "short" | "medium" | "full";
  launch_mode: "prelaunch" | "launch";
  blurb: string;
  published: boolean;
  sort_order: number;
  cover_url: string;
};

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

function createBookDraft(book: BookRow): BookDraft {
  return {
    id: book.id,
    title: book.title,
    subtitle: book.subtitle,
    slug: book.slug,
    category: book.category,
    size: book.size as "short" | "medium" | "full",
    launch_mode: book.launch_mode === "prelaunch" ? "prelaunch" : "launch",
    blurb: book.description,
    published: book.published,
    sort_order: book.sort_order,
    cover_url: book.cover_url,
  };
}

function normalizeSettings(settings: Record<string, string>): SettingsForm {
  return {
    global_prelaunch: settings.global_prelaunch !== "false",
    partner_code: settings.partner_code ?? "",
    support_email: settings.support_email ?? "",
    telegram_url: settings.telegram_url ?? "",
    whatsapp_url: settings.whatsapp_url ?? "",
    community_links: settings.community_links ?? "[]",
  };
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
  const [tab, setTab] = useState<TabKey>("overview");
  const [accessState, setAccessState] = useState<"checking" | "allowed" | "locked" | "error">(
    "checking",
  );
  const [accessMessage, setAccessMessage] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (isPending) {
      const timer = window.setTimeout(() => {
        setAccessState("error");
        setAccessMessage("Admin session check timed out. Reload or sign in again to continue.");
      }, ADMIN_ACCESS_TIMEOUT_MS);
      return () => window.clearTimeout(timer);
    }

    if (!user) {
      setAccessState("checking");
      setAccessMessage("");
      return;
    }

    let cancelled = false;
    setAccessState("checking");
    setAccessMessage("");

    runAdminAccessCheck(() => adminAccess())
      .then((result) => {
        if (cancelled) return;
        setAccessState(result.allowed ? "allowed" : "locked");
        setAccessMessage(result.message ?? "");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setAccessState("error");
        setAccessMessage(
          error instanceof Error && error.message
            ? error.message
            : "We could not confirm your admin access.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [isPending, user]);

  if (accessState === "error") {
    return (
      <Shell>
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <h1 className="font-display text-4xl">We could not confirm admin access yet.</h1>
          <p className="mt-3 text-muted-foreground">
            {accessMessage || "Please refresh your sign-in session and try again."}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              Reload this page
            </Button>
            <Button asChild variant="navy">
              <Link to="/admin/login">Go to admin login</Link>
            </Button>
          </div>
        </div>
      </Shell>
    );
  }
  if (!user && !isPending) return <RedirectToSignIn to="/admin/login" />;
  if (accessState === "locked") {
    return (
      <Shell>
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <h1 className="font-display text-4xl">Admin access required.</h1>
          <p className="mt-3 text-muted-foreground">
            {accessMessage || "This account does not have admin access."}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in with an approved admin account or ask the owner to add your email to the
            admin allowlist.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild variant="navy">
              <Link to="/admin/login">Use another account</Link>
            </Button>
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
        </div>
      </Shell>
    );
  }
  if (isPending || accessState === "checking") {
    return <div className="grid min-h-dvh place-items-center">Checking admin access…</div>;
  }

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs tracking-[0.18em] uppercase text-muted-foreground">
              Admin desk
            </p>
            <h1 className="mt-2 font-display text-5xl">Platform dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Manage books, users, coupons, sales, and site settings without reader onboarding
              checks.
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
        <div className="mt-6 flex flex-wrap gap-2">
          <TabButton
            active={tab === "overview"}
            label="overview"
            onClick={() => setTab("overview")}
          />
          <TabButton active={tab === "books"} label="books" onClick={() => setTab("books")} />
          <TabButton active={tab === "users"} label="users" onClick={() => setTab("users")} />
          <TabButton active={tab === "coupons"} label="coupons" onClick={() => setTab("coupons")} />
          <TabButton active={tab === "sales"} label="sales" onClick={() => setTab("sales")} />
        </div>
        <div className="mt-8">
          {tab === "overview" ? <HomePanel /> : null}
          {tab === "books" ? <BooksPanel /> : null}
          {tab === "users" ? <UsersPanel /> : null}
          {tab === "coupons" ? <CouponsPanel /> : null}
          {tab === "sales" ? <SalesPanel /> : null}
        </div>
      </div>
    </Shell>
  );
}

function HomePanel() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [form, setForm] = useState<SettingsForm | null>(null);

  useEffect(() => {
    adminOverview()
      .then((payload) => {
        setData(payload);
        setForm(normalizeSettings(payload.settings));
      })
      .catch((error: unknown) =>
        toast.error(error instanceof Error ? error.message : "Could not load admin overview."),
      );
  }, []);

  if (!data || !form) return <p>Loading…</p>;

  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {[
        ["Users", data.users],
        ["Tagged", data.tagged],
        ["Titles", data.books],
        ["Sales", formatMoney(data.salesCents / 100)],
      ].map(([label, value]) => (
        <div key={String(label)} className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl">{value}</p>
        </div>
      ))}

      <form
        className="xl:col-span-4 rounded-xl border border-border bg-card p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          const saves: Array<[string, string]> = [
            ["global_prelaunch", String(form.global_prelaunch)],
            ["partner_code", form.partner_code],
            ["support_email", form.support_email],
            ["telegram_url", form.telegram_url],
            ["whatsapp_url", form.whatsapp_url],
            ["community_links", form.community_links],
          ];
          try {
            await Promise.all(
              saves.map(([key, value]) => adminSaveSetting({ data: { key, value } })),
            );
            toast.success("Settings saved.");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not save settings.");
          }
        }}
      >
        <div className="mb-4">
          <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">
            Overview and settings
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure platform-wide settings and review current admin metrics.
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
              Global pre-launch coupon mode
            </span>
          </label>
          <Field
            label="Partner code"
            value={form.partner_code}
            onChange={(value: string) => setForm((current) => (current ? { ...current, partner_code: value } : current))}
          />
          <Field
            label="Support email"
            value={form.support_email}
            onChange={(value: string) => setForm((current) => (current ? { ...current, support_email: value } : current))}
          />
          <Field
            label="Telegram link"
            value={form.telegram_url}
            onChange={(value: string) => setForm((current) => (current ? { ...current, telegram_url: value } : current))}
          />
          <Field
            label="WhatsApp link"
            value={form.whatsapp_url}
            onChange={(value: string) => setForm((current) => (current ? { ...current, whatsapp_url: value } : current))}
          />
        </div>
        <label className="mt-4 block text-sm">
          <span className="mb-2 block text-muted-foreground">Community links JSON</span>
          <textarea
            value={form.community_links}
            onChange={(event) =>
              setForm((current) => (current ? { ...current, community_links: event.target.value } : current))
            }
            className="min-h-40 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <Button type="submit" variant="navy" className="mt-4">
          Save settings
        </Button>
      </form>
    </div>
  );
}

function BooksPanel() {
  const [rows, setRows] = useState<BookRow[]>([]);
  const [newBook, setNewBook] = useState<NewBookForm>(EMPTY_BOOK);

  const reload = async () => {
    const books = await adminBooks();
    setRows(books);
  };

  useEffect(() => {
    reload().catch((error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Could not load books."),
    );
  }, []);

  return (
    <div className="space-y-6">
      <form
        className="rounded-xl border border-border bg-card p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await adminCreateBook({ data: newBook });
            setNewBook(EMPTY_BOOK);
            await reload();
            toast.success("Book created.");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not create the book.");
          }
        }}
      >
        <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">Manage books</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Add titles, update metadata, upload covers, and maintain page order.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field
            label="Title"
            value={newBook.title}
            onChange={(value: string) => setNewBook((current) => ({ ...current, title: value }))}
          />
          <Field
            label="Subtitle"
            value={newBook.subtitle}
            onChange={(value: string) => setNewBook((current) => ({ ...current, subtitle: value }))}
          />
          <Field
            label="Slug"
            value={newBook.slug}
            onChange={(value: string) => setNewBook((current) => ({ ...current, slug: value }))}
          />
          <Field
            label="Category"
            value={newBook.category}
            onChange={(value: string) => setNewBook((current) => ({ ...current, category: value }))}
          />
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
              setNewBook((current) => ({ ...current, launch_mode: value as NewBookForm["launch_mode"] }))
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
        <Button type="submit" variant="navy" className="mt-4">
          Create book
        </Button>
      </form>

      {rows.map((book) => (
        <BookEditor key={book.id} book={book} onReload={reload} />
      ))}
    </div>
  );
}

function BookEditor({ book, onReload }: { book: BookRow; onReload: () => Promise<void> }) {
  const [draft, setDraft] = useState<BookDraft>(() => createBookDraft(book));
  const [pages, setPages] = useState<BookPageRow[]>(book.pages ?? []);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDraft(createBookDraft(book));
    setPages(book.pages ?? []);
  }, [book]);

  const reorderedPageIds = useMemo(() => pages.map((page) => page.id), [pages]);

  async function saveBook() {
    setBusy(true);
    try {
      await adminUpdateBook({
        data: {
          id: draft.id,
          title: draft.title,
          subtitle: draft.subtitle,
          slug: draft.slug,
          category: draft.category,
          size: draft.size,
          launch_mode: draft.launch_mode,
          blurb: draft.blurb,
          published: draft.published,
          sort_order: draft.sort_order,
          cover_url: draft.cover_url,
        },
      });
      await onReload();
      toast.success(`Saved ${draft.title}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the book.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const signed = await adminSignCloudinaryUpload({
        data: { kind: "cover", bookSlug: draft.slug || draft.title, fileName: file.name },
      });
      const coverUrl = await uploadFile(file, signed);
      await adminSaveBookCover({ data: { id: draft.id, coverUrl } });
      setDraft((current) => ({ ...current, cover_url: coverUrl }));
      await onReload();
      toast.success("Cover updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cover upload failed.");
    } finally {
      event.target.value = "";
      setBusy(false);
    }
  }

  async function handlePageUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setBusy(true);
    try {
      const urls = await Promise.all(
        files.map(async (file) => {
          const signed = await adminSignCloudinaryUpload({
            data: { kind: "page", bookSlug: draft.slug || draft.title, fileName: file.name },
          });
          return uploadFile(file, signed);
        }),
      );
      const nextPages = await adminCreateBookPages({ data: { bookId: draft.id, imageUrls: urls } });
      setPages(nextPages);
      await onReload();
      toast.success(`${files.length} page image${files.length > 1 ? "s" : ""} uploaded.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Page upload failed.");
    } finally {
      event.target.value = "";
      setBusy(false);
    }
  }

  async function movePage(pageId: string, direction: -1 | 1) {
    const index = pages.findIndex((page) => page.id === pageId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= pages.length) return;
    const nextPages = [...pages];
    const [moved] = nextPages.splice(index, 1);
    nextPages.splice(nextIndex, 0, moved);
    setPages(nextPages);
    try {
      const refreshed = await adminReorderBookPages({
        data: { bookId: draft.id, pageIds: nextPages.map((page) => page.id) },
      });
      setPages(refreshed);
    } catch (error) {
      setPages(book.pages ?? []);
      toast.error(error instanceof Error ? error.message : "Could not reorder pages.");
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <div>
          <img
            src={draft.cover_url}
            alt={draft.title}
            className="h-72 w-full rounded-xl object-cover shadow-[var(--shadow)]"
          />
          <label className="mt-3 block text-sm">
            <span className="mb-2 block text-muted-foreground">Change cover</span>
            <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={busy} />
          </label>
          <p className="mt-3 text-xs text-muted-foreground">
            {pages.length} page image{pages.length === 1 ? "" : "s"} · {formatMoney(book.online_price_cents / 100)} online
          </p>
        </div>

        <div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title" value={draft.title} onChange={(value: string) => setDraft((current) => ({ ...current, title: value }))} />
            <Field
              label="Subtitle"
              value={draft.subtitle}
              onChange={(value: string) => setDraft((current) => ({ ...current, subtitle: value }))}
            />
            <Field label="Slug" value={draft.slug} onChange={(value: string) => setDraft((current) => ({ ...current, slug: value }))} />
            <Field
              label="Category"
              value={draft.category}
              onChange={(value: string) => setDraft((current) => ({ ...current, category: value }))}
            />
            <Field
              label="Sort order"
              value={String(draft.sort_order)}
              onChange={(value: string) =>
                setDraft((current) => ({ ...current, sort_order: Number.parseInt(value || "0", 10) || 0 }))
              }
            />
            <SelectField
              label="Size"
              value={draft.size}
              options={["short", "medium", "full"]}
              onChange={(value) => setDraft((current) => ({ ...current, size: value as BookDraft["size"] }))}
            />
            <SelectField
              label="Launch mode"
              value={draft.launch_mode}
              options={["prelaunch", "launch"]}
              onChange={(value) =>
                setDraft((current) => ({ ...current, launch_mode: value as BookDraft["launch_mode"] }))
              }
            />
            <label className="flex items-end gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(event) => setDraft((current) => ({ ...current, published: event.target.checked }))}
              />
              Published
            </label>
          </div>

          <label className="mt-4 block text-sm">
            <span className="mb-2 block text-muted-foreground">Blurb</span>
            <textarea
              value={draft.blurb}
              onChange={(event) => setDraft((current) => ({ ...current, blurb: event.target.value }))}
              className="min-h-32 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="navy" onClick={saveBook} disabled={busy}>
              Save book
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  launch_mode: current.launch_mode === "prelaunch" ? "launch" : "prelaunch",
                }))
              }
            >
              Toggle launch mode
            </Button>
            <Button
              variant={draft.published ? "outline" : "profit"}
              onClick={() => setDraft((current) => ({ ...current, published: !current.published }))}
            >
              {draft.published ? "Mark unpublished" : "Publish"}
            </Button>
            <Button
              variant="loss"
              onClick={async () => {
                if (!window.confirm(`Delete ${draft.title}?`)) return;
                try {
                  await adminDeleteBook({ data: { id: draft.id } });
                  await onReload();
                  toast.success("Book deleted.");
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Could not delete the book.");
                }
              }}
            >
              Delete book
            </Button>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">Book pages</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload image pages, reorder them, or remove a page.
                </p>
              </div>
              <label className="text-sm">
                <span className="mb-2 block text-muted-foreground">Upload page images</span>
                <input type="file" accept="image/*" multiple onChange={handlePageUpload} disabled={busy} />
              </label>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {pages.map((page, index) => (
                <div key={page.id} className="rounded-lg border border-border bg-card p-3">
                  <img
                    src={page.image_url}
                    alt={`Page ${page.page_number}`}
                    className="h-48 w-full rounded-md object-cover"
                  />
                  <p className="mt-2 text-sm font-medium">Page {page.page_number}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" disabled={index === 0} onClick={() => movePage(page.id, -1)}>
                      Move up
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={index === pages.length - 1}
                      onClick={() => movePage(page.id, 1)}
                    >
                      Move down
                    </Button>
                    <Button
                      size="sm"
                      variant="loss"
                      onClick={async () => {
                        try {
                          const nextPages = await adminDeleteBookPage({
                            data: { pageId: page.id, bookId: draft.id },
                          });
                          setPages(nextPages);
                          await onReload();
                          toast.success("Page removed.");
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Could not remove the page.");
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {reorderedPageIds.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No page images uploaded yet.</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function UsersPanel() {
  const [rows, setRows] = useState<UsersData>([]);

  const reload = async () => {
    const users = await adminUsers();
    setRows(users);
  };

  useEffect(() => {
    reload().catch((error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Could not load users."),
    );
  }, []);

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card p-4">
      <div className="mb-4">
        <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">
          Manage users
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Review account roles and update tagging or ban status.
        </p>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>CR</th>
            <th>Role</th>
            <th>Tag</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((user) => (
            <tr key={user.user_id} className="border-b border-border align-top">
              <td className="py-3">{user.full_name ?? "Unnamed"}</td>
              <td>{user.email ?? "—"}</td>
              <td>{user.deriv_cr ?? "—"}</td>
              <td>{user.role}</td>
              <td>{user.deriv_tagged ? "tagged" : "not tagged"}</td>
              <td className="space-x-2 whitespace-nowrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await adminSetTagged({ data: { userId: user.user_id, tagged: !user.deriv_tagged } });
                    await reload();
                  }}
                >
                  Toggle tag
                </Button>
                <Button
                  size="sm"
                  variant={user.banned ? "profit" : "loss"}
                  onClick={async () => {
                    await adminSetBan({ data: { userId: user.user_id, banned: !user.banned } });
                    await reload();
                  }}
                >
                  {user.banned ? "Unban" : "Ban"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CouponsPanel() {
  const [rows, setRows] = useState<CouponsData>([]);
  const [books, setBooks] = useState<BookRow[]>([]);
  const [code, setCode] = useState("");
  const [uses, setUses] = useState("20");
  const [bookId, setBookId] = useState("");

  const reload = async () => {
        const [couponRows, bookRows] = await Promise.all([adminCoupons(), adminBooks()]);
        setRows(couponRows ?? []);
    setBooks(bookRows);
  };

  useEffect(() => {
    reload().catch((error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Could not load coupons."),
    );
  }, []);

  return (
    <div className="space-y-6">
      <form
        className="rounded-xl border border-border bg-card p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await adminCreateCoupon({
              data: {
                code,
                uses: Number.parseInt(uses || "1", 10) || 1,
                bookId: bookId || undefined,
              },
            });
            setCode("");
            setUses("20");
            setBookId("");
            await reload();
            toast.success("Coupon created.");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not create the coupon.");
          }
        }}
      >
        <div className="mb-4">
          <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">
            Manage coupons
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Create and review coupons issued across the library platform.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Code" value={code} onChange={setCode} />
          <Field label="Uses" value={uses} onChange={setUses} />
          <label className="text-sm">
            <span className="mb-2 block text-muted-foreground">Book scope</span>
            <select
              value={bookId}
              onChange={(event) => setBookId(event.target.value)}
              className="h-11 w-full rounded-md border border-border bg-background px-3"
            >
              <option value="">All books</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Button variant="navy" className="mt-4">
          Issue coupon
        </Button>
      </form>

      <ul className="space-y-3 text-sm">
        {rows.map((coupon) => (
          <li key={coupon.id} className="rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-medium">{coupon.code}</span>
              <span className="text-muted-foreground">
                {coupon.kind} · {coupon.uses_remaining} left
              </span>
            </div>
            <p className="mt-1 text-muted-foreground">
              Book: {coupon.book_id ?? "all books"} · User: {coupon.user_id ?? "unassigned"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SalesPanel() {
  const [sales, setSales] = useState<SalesData>([]);
  const [logs, setLogs] = useState<LogsData>([]);

  useEffect(() => {
    Promise.all([adminSales(), adminLogs()])
      .then(([saleRows, logRows]) => {
        setSales(saleRows ?? []);
        setLogs(logRows ?? []);
      })
      .catch((error: unknown) =>
        toast.error(error instanceof Error ? error.message : "Could not load sales."),
      );
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="font-display text-2xl">Sales overview</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {sales.map((sale) => (
            <li key={sale.id} className="rounded-md border border-border bg-card px-3 py-2">
              <p className="font-medium">
                {sale.kind} · {formatMoney(sale.amount_cents / 100)}
              </p>
              <p className="text-muted-foreground">
                {sale.provider} · {sale.status} · ref {sale.reference ?? "pending"}
              </p>
            </li>
          ))}
          {sales.length === 0 ? <li className="text-muted-foreground">No sales yet.</li> : null}
        </ul>
      </div>
      <div>
        <h2 className="font-display text-2xl">Reader activity</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {logs.map((log, index) => (
            <li key={`${log.user_id}-${log.book_id}-${index}`} className="rounded-md border border-border bg-card px-3 py-2">
              {log.user_id.slice(0, 8)} · book {log.book_id} · page {log.page_index + 1}
            </li>
          ))}
          {logs.length === 0 ? <li className="text-muted-foreground">No pages opened yet.</li> : null}
        </ul>
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
