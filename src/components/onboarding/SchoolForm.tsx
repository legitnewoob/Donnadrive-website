import {
  Building2,
  User,
  Mail,
  Phone,
  Users,
  CalendarDays,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { OnboardingForm } from "./types";

interface Props {
  form: OnboardingForm;
  setForm: React.Dispatch<React.SetStateAction<OnboardingForm>>;
}

const instructorOptions = [
  "1–5",
  "6–15",
  "16+",
];

export default function SchoolForm({
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

      {/* School Name */}

      <div className="space-y-2">
        <Label>Driving school name</Label>

        <div className="relative">
          <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

          <Input
            className="pl-10"
            placeholder="ABC Driving School"
            value={form.schoolName}
            onChange={(e) =>
              updateField("schoolName", e.target.value)
            }
          />
        </div>
      </div>

      {/* Contact */}

      <div className="space-y-2">
        <Label>Contact name</Label>

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
            placeholder="josh@school.co.uk"
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

      {/* Instructor Count */}

      <div className="space-y-2">
        <Label>Number of instructors</Label>

        <div className="relative">
          <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />

          <select
            value={form.instructorCount}
            onChange={(e) =>
              updateField("instructorCount", e.target.value)
            }
            className="flex h-11 w-full rounded-md border bg-background pl-10 pr-4 text-sm"
          >
            <option value="">
              Select...
            </option>

            {instructorOptions.map((option) => (
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

      {/* Callback */}

      <div className="space-y-2">
        <Label>Preferred callback</Label>

        <div className="relative">
          <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

          <Input
            type="datetime-local"
            className="pl-10"
            value={form.callback}
            onChange={(e) =>
              updateField("callback", e.target.value)
            }
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Callbacks are available Monday–Friday, 9am–6pm. Please
          choose a time at least 24 hours in advance.
        </p>
      </div>

    </div>
  );
}