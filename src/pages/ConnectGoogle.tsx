import { ArrowLeft, Calendar, Shield, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ConnectGoogle() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const type = params.get("type");

  const handleGoogle = () => {
    // TODO:
    // Google OAuth goes here

    if (type === "ADI") {
      navigate("/payment");
    } else {
      navigate("/welcome");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 flex items-center justify-center p-6">

      <Card className="w-full max-w-xl rounded-3xl shadow-xl">

        <CardHeader>

          <Button
            variant="ghost"
            className="w-fit -ml-3 mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <CardTitle className="text-3xl">
            Connect your Google Account
          </CardTitle>

          <CardDescription className="text-base mt-2">
            Donna Drive uses your Google Calendar to automatically
            manage bookings and avoid double bookings.
          </CardDescription>

        </CardHeader>

        <CardContent className="space-y-8">

          <div className="space-y-4">

            <div className="flex items-start gap-4 rounded-xl border p-4">
              <Calendar className="mt-1 h-5 w-5 text-sky-600" />

              <div>
                <h3 className="font-semibold">
                  Google Calendar Sync
                </h3>

                <p className="text-sm text-muted-foreground">
                  Donna checks your availability before confirming
                  every lesson.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border p-4">
              <Shield className="mt-1 h-5 w-5 text-sky-600" />

              <div>
                <h3 className="font-semibold">
                  Secure OAuth
                </h3>

                <p className="text-sm text-muted-foreground">
                  You stay in control and can revoke access at any
                  time.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border p-4">
              <Clock3 className="mt-1 h-5 w-5 text-sky-600" />

              <div>
                <h3 className="font-semibold">
                  Takes less than 30 seconds
                </h3>

                <p className="text-sm text-muted-foreground">
                  One click and you're ready to continue.
                </p>
              </div>
            </div>

          </div>

          <Button
            size="lg"
            variant="outline"
            className="w-full h-12 text-base"
            onClick={handleGoogle}
          >
            Continue with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Your calendar remains private. Donna only accesses the
            information required to manage your lesson schedule.
          </p>

        </CardContent>

      </Card>

    </main>
  );
}