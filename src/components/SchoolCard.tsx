import { Building2, CreditCard, Eye, Mail, Power } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SchoolInfo } from "@/lib/access";

/**
 * For instructors who teach for a driving school: whose account this is, who
 * pays, what the school can see, and whether the school has Donna on.
 */
export default function SchoolCard({ school, onManageTeam }: { school: SchoolInfo; onManageTeam?: () => void }) {
  const schoolOn = school.donnaEnabled !== false;
  const Row = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
    <li className="flex items-start gap-2.5 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <span className="min-w-0">{children}</span>
    </li>
  );

  return (
    <Card className="mb-4 border-sky-200">
      <CardContent className="py-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100">
            <Building2 className="h-5 w-5 text-sky-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{school.name || "Your driving school"}</p>
            <p className="text-sm text-muted-foreground">{school.role === "manager" ? "Manager" : "Instructor"}</p>
          </div>
          {onManageTeam && (
            <Button size="sm" variant="outline" className="shrink-0" onClick={onManageTeam}>
              Manage team
            </Button>
          )}
        </div>
        <ul className="space-y-2">
          {school.ownerName && (
            <Row icon={Mail}>
              Run by <span className="font-medium">{school.ownerName}</span>
              {school.ownerEmail && (
                <>
                  {" · "}
                  <a href={`mailto:${school.ownerEmail}`} className="break-all text-primary hover:underline">
                    {school.ownerEmail}
                  </a>
                </>
              )}
            </Row>
          )}
          <Row icon={CreditCard}>Your school pays for Donna Drive, so there's nothing for you to pay.</Row>
          <Row icon={Eye}>Your school can see your learners and lessons, but can't change them.</Row>
          <Row icon={Power}>
            {schoolOn ? (
              "Your school has Donna switched on."
            ) : (
              <span className="font-medium text-red-700">Your school has switched Donna off for everyone.</span>
            )}
          </Row>
        </ul>
      </CardContent>
    </Card>
  );
}
