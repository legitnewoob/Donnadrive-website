import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Building2,
  Phone,
  Briefcase,
  CheckCircle2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ScrollProgress from "@/components/ScrollProgress";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

const Onboarding = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    role: "",
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Onboarding submitted:", form);

    navigate("/thank-you");
  };

  const benefits = [
    "24/7 WhatsApp learner support",
    "Automated reminders & notifications",
    "Instructor management dashboard",
    "Reduce admin work and missed lessons",
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
        <ScrollProgress />
      <Header/>
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
          {/* LEFT SECTION */}
          <div className="space-y-6 sm:space-y-8">
            {/* <Badge
              variant="secondary"
              className="rounded-full px-4 py-1"
            >
              🚗 Driving School Automation Platform
            </Badge> */}

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                Grow your driving school with{" "}
                <span className="text-sky-600">
                  Donna Drive
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
                Automate learner communication, lesson reminders,
                instructor coordination and support through a
                powerful WhatsApp-first platform.
              </p>
            </div>

            <div className="grid gap-4">
              {benefits.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600" />

                  <span className="font-medium">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge variant="outline">
                WhatsApp Powered
              </Badge>

              <Badge variant="outline">
                Secure Data Storage
              </Badge>

              <Badge variant="outline">
                No Credit Card Required
              </Badge>
            </div>

            <div className="rounded-2xl bg-sky-50 border p-6">
              <p className="text-muted-foreground italic">
                “Donna Drive has helped driving schools reduce
                repetitive admin work and improve learner engagement
                through conversational automation.”
              </p>
            </div>
          </div>

          {/* FORM */}
          <Card className="border-0 shadow-2xl rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl sm:text-3xl">
                Get Started
              </CardTitle>

              <CardDescription>
                Tell us a little about yourself and we'll help you
                get set up with Donna Drive.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>Name</Label>

                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                      <Input
                        className="pl-10"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>

                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                      <Input
                        className="pl-10"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Driving School</Label>

                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                      <Input
                        className="pl-10"
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="Donna Driving School"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Phone</Label>

                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                      <Input
                        className="pl-10"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+44 1234 567890"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>

                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                    <Input
                      className="pl-10"
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      placeholder="Owner, Instructor, Administrator..."
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-xl h-12 text-base"
                >
                  Book My Donna Demo →
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Takes less than a minute • No credit card required
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Onboarding;