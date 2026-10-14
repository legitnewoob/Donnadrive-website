import { GraduationCap, Car, Building2 } from "lucide-react";
import { UserType } from "./types";

interface Props {
  value: UserType | "";
  onChange: (type: UserType) => void;
}

const options = [
  {
    type: "PDI" as const,
    title: "Potential Driving Instructor",
    short: "PDI",
    description: "Learn with Donna for free while you're training.",
    price: "FREE",
    icon: GraduationCap,
  },
  {
    type: "ADI" as const,
    title: "Approved Driving Instructor",
    short: "ADI",
    description: "Perfect for independent driving instructors.",
    price: "£10/mo",
    icon: Car,
  },
  {
    type: "SCHOOL" as const,
    title: "Driving School",
    short: "School",
    description: "3 instructors included, +£10/month each after.",
    price: "£20/mo",
    icon: Building2,
  },
];

export default function UserTypeSelector({
  value,
  onChange,
}: Props) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-lg">
          Choose your account
        </h3>

        <p className="text-sm text-muted-foreground">
          We'll personalise your setup based on your selection.
        </p>
      </div>

      <div className="space-y-3">
        {options.map((option) => {
          const Icon = option.icon;

          const selected = value === option.type;

          return (
            <button
              key={option.type}
              type="button"
              onClick={() => onChange(option.type)}
              className={`w-full rounded-2xl border p-4 sm:p-5 transition-all duration-200 text-left ${
                selected
                  ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100"
                  : "hover:border-sky-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                <div
                  className={`shrink-0 rounded-xl p-3 ${
                    selected
                      ? "bg-sky-100"
                      : "bg-slate-100"
                  }`}
                >
                  <Icon className="h-5 w-5 text-sky-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <h4 className="font-semibold">
                        {option.short}
                      </h4>

                      <span className="text-xs text-muted-foreground sm:rounded-full sm:bg-slate-100 sm:px-2 sm:py-1 sm:text-foreground">
                        {option.title}
                      </span>
                    </div>

                    <div className="shrink-0 font-bold text-sky-600">
                      {option.price}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}