import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  isPopupScheduled,
  popupDismissalKey,
  type PrelaunchPopupConfig,
} from "@/lib/prelaunch-popup";

type Props = { config: PrelaunchPopupConfig | null; preview?: boolean; onPreviewClose?: () => void };

export function PrelaunchPopup({ config, preview = false, onPreviewClose }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!config) return;
    if (preview) {
      setOpen(true);
      return;
    }
    if (!isPopupScheduled(config)) return;
    const key = popupDismissalKey(config);
    const dismissed = config.frequency === "browser"
      ? window.localStorage.getItem(key)
      : config.frequency === "session"
        ? window.sessionStorage.getItem(key)
        : null;
    if (dismissed) return;
    const timer = window.setTimeout(() => setOpen(true), 650);
    return () => window.clearTimeout(timer);
  }, [config, preview]);

  if (!config) return null;
  const dismiss = () => {
    setOpen(false);
    if (!preview) {
      const key = popupDismissalKey(config);
      if (config.frequency === "browser") window.localStorage.setItem(key, "dismissed");
      if (config.frequency === "session") window.sessionStorage.setItem(key, "dismissed");
    }
    onPreviewClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) dismiss(); else setOpen(true); }}>
      <DialogContent
        aria-describedby="prelaunch-popup-description"
        className="max-h-[92dvh] w-[min(94vw,68rem)] max-w-none overflow-y-auto p-0 sm:rounded-2xl"
      >
        <div className="grid min-h-0 lg:grid-cols-[minmax(18rem,.85fr)_minmax(22rem,1fr)]">
          <div className="bg-[#eef8fc] p-3 sm:p-5">
            {config.flyerUrl ? (
              <img src={config.flyerUrl} alt={config.flyerAlt} className="mx-auto h-auto max-h-[78dvh] w-full object-contain" />
            ) : (
              <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
                Upload the final prelaunch flyer to complete this announcement.
              </div>
            )}
          </div>
          <div className="flex flex-col p-5 pt-12 sm:p-8 sm:pt-12 lg:p-10">
            <p className="text-xs font-semibold tracking-[.18em] text-primary uppercase">Prelaunch announcement</p>
            <DialogTitle className="mt-3 text-3xl leading-tight sm:text-4xl">{config.title}</DialogTitle>
            <DialogDescription id="prelaunch-popup-description" className="mt-5 whitespace-pre-line text-sm leading-6 sm:text-base">
              {config.message}
            </DialogDescription>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="navy" size="lg">
                <a href={config.primaryUrl} target="_blank" rel="noreferrer">{config.primaryLabel}<ArrowUpRight className="size-4" /></a>
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={dismiss}>{config.secondaryLabel}</Button>
            </div>
            <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">{config.footer}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
