import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import WaitlistFlow from "./WaitlistFlow";
import { useLaunchActions, type WaitlistOptions } from "./LaunchProvider";

/** The waitlist as a dialog, opened by any "Join the waitlist" button. */
export default function WaitlistDialog({ options, onClose }: { options: WaitlistOptions | null; onClose: () => void }) {
  const { openSignIn } = useLaunchActions();
  return (
    <Dialog open={!!options} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-md overflow-y-auto overflow-x-hidden rounded-3xl p-5 pt-8 sm:p-7 sm:pt-9">
        <DialogTitle className="sr-only">Join the Donna Drive waitlist</DialogTitle>
        <DialogDescription className="sr-only">Leave your name and email and we'll invite you when it's your turn.</DialogDescription>
        {options && <WaitlistFlow {...options} onSignIn={openSignIn} />}
      </DialogContent>
    </Dialog>
  );
}
