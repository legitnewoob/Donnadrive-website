import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WhatsAppIcon } from "@/components/launch/WaitlistStatusCard";
import { getReferral, type Referral } from "@/lib/api";

const MESSAGE = "I use Donna Drive to book my driving lessons on WhatsApp. Sign up with my link and we both get a month free:";

/** "Give a month, get a month": their link, and what it's earned them. */
export default function ReferralCard({ token }: { token: string }) {
  const [ref, setRef] = useState<Referral | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getReferral(token).then(setRef).catch(() => {});
  }, [token]);

  if (!ref) return null;
  const link = `${window.location.origin}/?ref=${ref.code}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gift className="h-4 w-4 text-sky-600" />
          Give a month, get a month
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Share your link with other instructors. When someone you refer starts paying, you both get a month free, taken off your next payment.
        </p>
        <div className="flex gap-2">
          <Input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Your referral link" className="font-mono text-sm" />
          <Button variant="outline" className="shrink-0" onClick={copy}>
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button asChild className="shrink-0 bg-[#25D366] text-white hover:bg-[#1ebe5b]" aria-label="Share on WhatsApp">
            <a href={`https://wa.me/?text=${encodeURIComponent(`${MESSAGE} ${link}`)}`} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
            </a>
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ["Signed up", ref.signedUp],
            ["Paying", ref.rewarded],
            ["Free months", ref.freeMonths],
          ].map(([label, n]) => (
            <div key={label} className="rounded-lg bg-slate-50 py-2">
              <p className="text-lg font-bold tabular-nums">{n}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        {ref.freeMonths >= ref.maxFreeMonths && (
          <p className="text-xs text-muted-foreground">You've earned the most free months we give ({ref.maxFreeMonths}). Thank you!</p>
        )}
      </CardContent>
    </Card>
  );
}
