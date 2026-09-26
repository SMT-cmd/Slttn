import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  adminBooks,
  adminCoupons,
  adminCreateCoupon,
  adminLogs,
  adminOverview,
  adminSales,
  adminSaveSetting,
  adminSetBan,
  adminSetTagged,
  adminUpdateBook,
  adminUsers,
  getMe,
  type BookRow,
  type Profile,
} from "@/lib/server/platform";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({ component: Admin });

function Admin() {
  const { user, isPending } = useCurrentUserState();
  const [tab, setTab] = useState<"home" | "books" | "users" | "coupons" | "sales">("home");
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (isPending || !user) return;
    getMe()
      .then((p) => setAllowed(p.role === "admin"))
      .catch(() => setAllowed(false));
  }, [isPending, user]);

  if (isPending || allowed === null) {
    return <div className="grid min-h-dvh place-items-center">Checking the desk…</div>;
  }
  if (!user) return <RedirectToSignIn />;
  if (!allowed) {
    return (
      <Shell>
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <h1 className="font-display text-4xl">This desk is locked.</h1>
          <p className="mt-3 text-muted-foreground">You need admin access.</p>
          <Button asChild variant="navy" className="mt-6">
            <Link to="/account">Back to account</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-display text-5xl">Admin</h1>
        <div className="mt-6 flex flex-wrap gap-2">
          {(["home", "books", "users", "coupons", "sales"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`h-10 rounded-md px-4 text-sm capitalize ${tab === t ? "bg-navy text-navy-foreground" : "bg-muted"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="mt-8">
          {tab === "home" ? <Home /> : null}
          {tab === "books" ? <Books /> : null}
          {tab === "users" ? <Users /> : null}
          {tab === "coupons" ? <Coupons /> : null}
          {tab === "sales" ? <Sales /> : null}
        </div>
      </div>
    </Shell>
  );
}

function Home() {
  const [data, setData] = useState<Awaited<ReturnType<typeof adminOverview>> | null>(null);
  useEffect(() => {
    adminOverview().then(setData).catch((e) => toast.error(String(e)));
  }, []);
  if (!data) return <p>Loading…</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-4">
      {[
        ["Readers", data.users],
        ["Tagged", data.tagged],
        ["Titles", data.books],
        ["Sales", formatMoney(data.salesCents / 100)],
      ].map(([k, v]) => (
        <div key={String(k)} className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">{k}</p>
          <p className="mt-2 font-display text-3xl">{v}</p>
        </div>
      ))}
      <form
        className="sm:col-span-4 rounded-xl border border-border bg-card p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          await adminSaveSetting({
            data: { key: "global_prelaunch", value: String(fd.get("pre") === "on") },
          });
          toast.success("Saved.");
        }}
      >
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="pre" defaultChecked /> Global pre-launch (free tagged coupons)
        </label>
        <Button type="submit" size="sm" className="mt-3" variant="navy">
          Save setting
        </Button>
      </form>
    </div>
  );
}

function Books() {
  const [rows, setRows] = useState<BookRow[]>([]);
  const load = () => adminBooks().then(setRows);
  useEffect(() => {
    load().catch((e) => toast.error(String(e)));
  }, []);
  return (
    <div className="space-y-4">
      {rows.map((b) => (
        <div key={b.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-medium">
              {b.title} {b.subtitle}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await adminUpdateBook({
                    data: {
                      id: b.id,
                      launch_mode: b.launch_mode === "prelaunch" ? "public" : "prelaunch",
                    },
                  });
                  load();
                }}
              >
                {b.launch_mode === "prelaunch" ? "Switch to public" : "Switch to pre-launch"}
              </Button>
              <Button
                size="sm"
                variant="loss"
                onClick={async () => {
                  await adminUpdateBook({ data: { id: b.id, archived: true } });
                  load();
                }}
              >
                Archive
              </Button>
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {b.category} · {formatMoney(b.online_price_cents / 100)} online · {b.launch_mode}
          </p>
        </div>
      ))}
    </div>
  );
}

function Users() {
  const [rows, setRows] = useState<(Profile & { created_at: string })[]>([]);
  const load = () => adminUsers().then(setRows);
  useEffect(() => {
    load().catch((e) => toast.error(String(e)));
  }, []);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>CR</th>
            <th>Tag</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.user_id} className="border-b border-border">
              <td className="py-2">{u.full_name}</td>
              <td>{u.email}</td>
              <td>{u.deriv_cr}</td>
              <td>{u.deriv_tagged ? "yes" : "no"}</td>
              <td className="space-x-2 whitespace-nowrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await adminSetTagged({ data: { userId: u.user_id, tagged: !u.deriv_tagged } });
                    load();
                  }}
                >
                  Toggle tag
                </Button>
                <Button
                  size="sm"
                  variant={u.banned ? "profit" : "loss"}
                  onClick={async () => {
                    await adminSetBan({ data: { userId: u.user_id, banned: !u.banned } });
                    load();
                  }}
                >
                  {u.banned ? "Unban" : "Ban"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Coupons() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof adminCoupons>>>([]);
  const [code, setCode] = useState("");
  const load = () => adminCoupons().then(setRows);
  useEffect(() => {
    load().catch((e) => toast.error(String(e)));
  }, []);
  return (
    <div>
      <form
        className="mb-6 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await adminCreateCoupon({ data: { code, uses: 20 } });
          setCode("");
          load();
        }}
      >
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="NEW-CODE" />
        <Button variant="navy">Create</Button>
      </form>
      <ul className="space-y-2 text-sm">
        {rows.map((c) => (
          <li key={c.id} className="rounded-md border border-border bg-card px-3 py-2">
            {c.code} · {c.kind} · {c.uses_remaining} left · {c.user_id ?? "unassigned"}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Sales() {
  const [sales, setSales] = useState<Awaited<ReturnType<typeof adminSales>>>([]);
  const [logs, setLogs] = useState<Awaited<ReturnType<typeof adminLogs>>>([]);
  useEffect(() => {
    adminSales().then(setSales);
    adminLogs().then(setLogs);
  }, []);
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="font-display text-2xl">Sales</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {sales.map((s) => (
            <li key={s.id} className="rounded-md border border-border bg-card px-3 py-2">
              {s.kind} · {formatMoney(s.amount_cents / 100)} · {s.provider} · {s.status}
            </li>
          ))}
          {sales.length === 0 ? <li className="text-muted-foreground">No sales yet.</li> : null}
        </ul>
      </div>
      <div>
        <h2 className="font-display text-2xl">Reading log</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {logs.map((l, i) => (
            <li key={i} className="rounded-md border border-border bg-card px-3 py-2">
              {l.user_id.slice(0, 8)} · book {l.book_id} · page {l.page_index + 1}
            </li>
          ))}
          {logs.length === 0 ? <li className="text-muted-foreground">No pages opened yet.</li> : null}
        </ul>
      </div>
    </div>
  );
}
