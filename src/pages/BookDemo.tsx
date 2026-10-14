import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import ScrollProgress from "@/components/ScrollProgress";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import UserTypeSelector from "@/components/onboarding/UserTypeSelector";
import InstructorForm from "@/components/onboarding/InstructorForm";
import SchoolForm from "@/components/onboarding/SchoolForm";
import PricingCard from "@/components/onboarding/PricingCard";

import {
  OnboardingForm,
  UserType,
} from "@/components/onboarding/types";

const Onboarding = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<OnboardingForm>({
    userType: "",

    fullName: "",
    email: "",
    phone: "",

    postcode: "",
    activeStudents: "",

    schoolName: "",
    instructorCount: "",
    callback: "",
  });

  const setUserType = (type: UserType) => {
    setForm((prev) => ({
      ...prev,
      userType: type,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log(form);

    e.preventDefault();

    if (form.userType === "SCHOOL") {

      navigate("/callback-confirmed");

      return;

    }

    navigate(`/connect-google?type=${form.userType}`);

  };

  const buttonText = {
    PDI: "Continue for Free →",
    ADI: "Continue →",
    SCHOOL: "Book Callback →",
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
      <ScrollProgress />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="-ml-3 mb-8 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">

          {/* FORM */}

          <Card className="rounded-3xl shadow-xl border-0">

            <CardHeader>

              <CardTitle className="text-3xl sm:text-4xl">
                Book your Donna Drive demo
              </CardTitle>

              <CardDescription className="text-base">
                Choose your account type and tell us a little about
                yourself. We'll tailor Donna Drive around your
                business.
              </CardDescription>

            </CardHeader>

            <CardContent>

              <form
                onSubmit={handleSubmit}
                className="space-y-8"
              >

                <UserTypeSelector
                  value={form.userType}
                  onChange={setUserType}
                />

                {form.userType && (
                  <div className="border-t pt-8">

                    {(form.userType === "PDI" ||
                      form.userType === "ADI") && (

                        <InstructorForm
                          form={form}
                          setForm={setForm}
                        />

                      )}

                    {form.userType === "SCHOOL" && (

                      <SchoolForm
                        form={form}
                        setForm={setForm}
                      />

                    )}

                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!form.userType}
                  size="lg"
                  className="w-full rounded-xl h-12 text-base"
                >
                  {form.userType
                    ? buttonText[form.userType]
                    : "Choose an account type"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Takes less than a minute • No obligation • Secure
                  setup
                </p>

              </form>

            </CardContent>

          </Card>

          {/* PRICING */}

          <div className="sticky top-8">
            <PricingCard
              userType={form.userType}
            />
          </div>

        </div>
      </div>
    </main>
  );
};

export default Onboarding;