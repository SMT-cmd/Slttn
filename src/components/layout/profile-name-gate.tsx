import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMe, updateProfileName } from "@/lib/server/platform";

export function ProfileNameGate() {
  const { user, isPending } = useCurrentUserState();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isPending || !user || user.isDevFallback) return;
    let cancelled = false;
    void getMe().then((profile) => {
      if (cancelled) return;
      const currentName = profile.full_name?.trim() ?? "";
      setName(currentName);
      setOpen(currentName.length < 2);
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [isPending, user]);

  if (!user || user.isDevFallback) return null;
  return (
    <Dialog open={open}>
      <DialogContent className="[&>button]:hidden" onEscapeKeyDown={(event) => event.preventDefault()} onPointerDownOutside={(event) => event.preventDefault()}>
        <DialogTitle>What name should appear on your account?</DialogTitle>
        <DialogDescription>
          Add your real name to finish setting up your profile. We use it for your library shelf and the identifying watermark inside protected books.
        </DialogDescription>
        <form className="mt-4 space-y-4" onSubmit={async (event) => {
          event.preventDefault();
          const fullName = name.trim().replace(/\s+/g, " ");
          if (fullName.length < 2) { toast.error("Enter your full name to continue."); return; }
          setSaving(true);
          try {
            await updateProfileName({ data: { fullName } });
            setOpen(false);
            toast.success("Your name has been saved.");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "We could not save your name.");
          } finally { setSaving(false); }
        }}>
          <div className="space-y-2">
            <Label htmlFor="required-profile-name">Full name</Label>
            <Input id="required-profile-name" autoFocus autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required placeholder="Enter your full name" />
          </div>
          <Button type="submit" variant="navy" className="w-full" disabled={saving}>{saving ? "Saving…" : "Save and continue"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
