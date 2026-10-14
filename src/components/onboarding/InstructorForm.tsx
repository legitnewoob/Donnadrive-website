import { User, Mail, Phone, MapPin, Users } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { OnboardingForm } from "./types";

interface Props {
  form: OnboardingForm;
  setForm: React.Dispatch<React.SetStateAction<OnboardingForm>>;
}

const studentOptions = [
  "1–5",
  "6–15",
  "16–30",
  "30+",
];

export default function InstructorForm({
  form,
  setForm,
}: Props) {
  const updateField = (
    field: keyof OnboardingForm,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">

      {/* Full Name */}

      <div className="space-y-2">
        <Label>Full name</Label>

        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

          <Input
            className="pl-10"
            placeholder="Josh Smith"
            value={form.fullName}
            onChange={(e) =>
              updateField("fullName", e.target.value)
            }
          />
        </div>
      </div>

      {/* Email */}

      <div className="space-y-2">
        <Label>Email address</Label>

        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

          <Input
            type="email"
            className="pl-10"
            placeholder="josh@email.com"
            value={form.email}
            onChange={(e) =>
              updateField("email", e.target.value)
            }
          />
        </div>
      </div>

      {/* Phone */}

      <div className="space-y-2">
        <Label>Phone number</Label>

        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

          <Input
            className="pl-10"
            placeholder="+44..."
            value={form.phone}
            onChange={(e) =>
              updateField("phone", e.target.value)
            }
          />
        </div>
      </div>

      {/* Postcode */}

      <div className="space-y-2">
        <Label>Teaching postcode</Label>

        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

          <Input
            className="pl-10"
            placeholder="NG1"
            value={form.postcode}
            onChange={(e) =>
              updateField("postcode", e.target.value)
            }
          />
        </div>
      </div>

      {/* Students */}

      <div className="space-y-2">
        <Label>Active students</Label>

        <div className="relative">
          <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />

          <select
            value={form.activeStudents}
            onChange={(e) =>
              updateField("activeStudents", e.target.value)
            }
            className="flex h-11 w-full rounded-md border bg-background pl-10 pr-4 text-sm"
          >
            <option value="">
              Select...
            </option>

            {studentOptions.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

    </div>
  );
}