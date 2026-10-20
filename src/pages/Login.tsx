import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useLaunchActions } from "@/components/launch/LaunchProvider";
import { homePath } from "@/lib/access";

/** /login — a bookmarkable way in for existing accounts, admins and staff, in every launch mode. */
export default function Login() {
  const { openSignIn } = useLaunchActions();
  const signedIn = (() => {
    try {
      return !!localStorage.getItem("dd_token");
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    const previous = document.title;
    document.title = "Sign in · Donna Drive";
    if (!signedIn) openSignIn();
    return () => {
      document.title = previous;
    };
  }, [signedIn, openSignIn]);

  if (signedIn) return <Navigate to={homePath()} replace />;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-[#F86C4F] via-[#F47B62] to-[#F59678] px-4 pb-12 pt-28">
        <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
          <h1 className="text-2xl font-bold">Sign in to Donna Drive</h1>
          <p className="mt-2 text-sm text-muted-foreground">Use the Google account you signed up with.</p>
          <Button className="mt-5 h-11 w-full rounded-xl" onClick={openSignIn}>Sign in with Google</Button>
        </div>
      </main>
    </div>
  );
}
