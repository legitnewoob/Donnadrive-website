import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendContactMessage } from "@/lib/api";
import mascot from "@/assets/mascot-smile.png";

const SUPPORT_EMAIL = "support@donnadrive.co.uk";

/** Contact us: a name, an email and a one-line question. We get an email and reply. */
const ContactUs = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const previous = document.title;
    document.title = "Contact us · Donna Drive";
    return () => {
      document.title = previous;
    };
  }, []);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await sendContactMessage(form);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send your message");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-[#F86C4F] via-[#F47B62] to-[#F59678] px-4 pb-12 pt-28 md:pt-32">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
          {sent ? (
            <div className="py-4 text-center">
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
              <h1 className="mb-2 text-2xl font-bold">Thanks, {form.name.split(" ")[0]}!</h1>
              <p className="mb-6 text-muted-foreground">
                We've got your message and will email you at <strong className="text-foreground">{form.email}</strong> soon.
              </p>
              <Button asChild variant="outline" className="rounded-xl">
                <Link to="/">Back to home</Link>
              </Button>
            </div>
          ) : (
            <>
              <img src={mascot} alt="" className="mx-auto mb-3 h-20 w-auto" />
              <h1 className="mb-1 text-center text-2xl font-bold sm:text-3xl">Contact us</h1>
              <p className="mb-6 text-center text-muted-foreground">
                Leave your name and email with a line about what you need. We'll get back to you quickly.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input id="contact-name" required autoComplete="name" value={form.name} onChange={set("name")} placeholder="Your name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input id="contact-email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-message">How can we help?</Label>
                  <Input id="contact-message" maxLength={300} value={form.message} onChange={set("message")} placeholder="e.g. I'd like a demo for my driving school" />
                </div>
                {/* Hidden from people; bots fill it in and get ignored */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} className="hidden" aria-hidden />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" size="lg" disabled={sending} className="h-12 w-full rounded-xl text-base">
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send"}
                </Button>
              </form>
              <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-sm text-muted-foreground">
                <Mail className="h-4 w-4" /> Or email{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-primary hover:underline">{SUPPORT_EMAIL}</a>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ContactUs;
