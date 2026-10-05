import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, EyeOff, Inbox, Send } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { myAnonymousMessages, submitAnonymousMessage } from "@/lib/server/platform";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/anonymous")({
  head: () => ({ meta: [{ title: `Anonymous Messages | ${SITE.name}` }, { name: "description", content: "Send a private anonymous message to the SLT Trade Hub team and track its status from this browser." }] }),
  component: AnonymousPage,
});

const AUTHOR_KEY = "slt.anonymous.author.v1";
type OwnMessage = Awaited<ReturnType<typeof myAnonymousMessages>>[number];

function getAuthorKey() {
  const saved = window.localStorage.getItem(AUTHOR_KEY);
  if (saved) return saved;
  const created = crypto.randomUUID();
  window.localStorage.setItem(AUTHOR_KEY, created);
  return created;
}

function AnonymousPage() {
  const [authorKey, setAuthorKey] = useState("");
  const [message, setMessage] = useState("");
  const [context, setContext] = useState("");
  const [messages, setMessages] = useState<OwnMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (key: string) => {
    setLoading(true);
    try { setMessages(await myAnonymousMessages({ data: { authorKey: key } })); }
    catch { setMessages([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const key = getAuthorKey();
    setAuthorKey(key);
    void refresh(key);
  }, [refresh]);

  return (
    <Shell>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
          <p className="text-xs tracking-[.2em] text-primary uppercase">Private message box</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl sm:text-6xl">Say what you need to say—without adding your name.</h1>
          <p className="mt-5 max-w-2xl text-muted-foreground">Your message goes privately to the SLT Trade Hub admin team. We do not ask for your name, email, or trading account. This is not an emergency service.</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground"><span className="rounded-full border border-border px-3 py-1"><EyeOff className="mr-1 inline size-3"/>No identity requested</span><span className="rounded-full border border-border px-3 py-1"><Inbox className="mr-1 inline size-3"/>Visible to admins only</span></div>
        </div>
      </section>
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 lg:grid-cols-[1.05fr_.95fr]">
        <form className="rounded-xl border border-border bg-card p-5 sm:p-7" onSubmit={async (event) => {
          event.preventDefault();
          if (!authorKey) return;
          setSending(true);
          try {
            const result = await submitAnonymousMessage({ data: { authorKey, message, context } });
            setMessage(""); setContext("");
            await refresh(authorKey);
            toast.success(`Message sent. Your receipt is ${result.public_id}.`);
          } catch (error) { toast.error(error instanceof Error ? error.message : "Your message could not be sent."); }
          finally { setSending(false); }
        }}>
          <h2 className="font-display text-3xl">Create an anonymous message</h2>
          <p className="mt-2 text-sm text-muted-foreground">Do not include your name, passwords, API tokens, financial details, or anything that identifies you.</p>
          <div className="mt-5 space-y-2"><Label htmlFor="anonymous-context">Topic (optional)</Label><Input id="anonymous-context" value={context} onChange={(event) => setContext(event.target.value)} maxLength={120} placeholder="Class question, feedback, website issue…" /></div>
          <div className="mt-4 space-y-2"><Label htmlFor="anonymous-message">Your message</Label><Textarea id="anonymous-message" className="min-h-48" value={message} onChange={(event) => setMessage(event.target.value)} minLength={10} maxLength={3000} required placeholder="Write your anonymous message here…" /><p className="text-right text-xs text-muted-foreground">{message.length}/3000</p></div>
          <Button type="submit" variant="navy" size="lg" className="mt-4 w-full" disabled={sending || message.trim().length < 10}>{sending ? "Sending privately…" : <><Send className="size-4"/>Send anonymously</>}</Button>
        </form>
        <section className="rounded-xl border border-border bg-card p-5 sm:p-7">
          <h2 className="font-display text-3xl">Messages from this browser</h2>
          <p className="mt-2 text-sm text-muted-foreground">Your private browser key lets you see delivery status here. Clearing browser storage removes this local access.</p>
          <div className="mt-5 space-y-3">{loading ? <p className="text-sm text-muted-foreground">Checking your messages…</p> : messages.length ? messages.map((item) => <article key={item.public_id} className="rounded-lg border border-border bg-background p-4"><div className="flex items-center justify-between gap-3"><code className="text-xs">{item.public_id}</code><span className="rounded-full bg-muted px-2 py-1 text-xs capitalize">{item.status}</span></div>{item.context ? <p className="mt-3 text-xs font-semibold tracking-wide text-primary uppercase">{item.context}</p> : null}<p className="mt-2 whitespace-pre-wrap text-sm">{item.message}</p><p className="mt-3 text-xs text-muted-foreground"><CheckCircle2 className="mr-1 inline size-3"/>{new Date(item.created_at).toLocaleString()}</p></article>) : <p className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">Messages you send from this browser will appear here.</p>}</div>
        </section>
      </div>
    </Shell>
  );
}
