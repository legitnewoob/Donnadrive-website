import { useState } from "react";
import { Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import DashboardLayout from "@/components/DashboardLayout";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const lessons = [
    { student: "John Smith", time: "10:00 AM", duration: "1h", status: "confirmed" },
    { student: "Emma Davis", time: "2:00 PM", duration: "1.5h", status: "pending" },
    { student: "Michael Brown", time: "4:00 PM", duration: "1h", status: "confirmed" },
  ];

  return (
    <DashboardLayout title="Calendar" subtitle="Manage your lessons and availability.">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Select a Date
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Lessons for {date?.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lessons.map((lesson, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-white hover:bg-slate-50 transition-colors gap-3"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{lesson.student}</p>
                    <p className="text-sm text-muted-foreground">{lesson.time} · {lesson.duration}</p>
                  </div>
                </div>
                <Badge
                  variant={lesson.status === "confirmed" ? "secondary" : "outline"}
                  className={lesson.status === "confirmed" ? "bg-green-100 text-green-700 w-fit" : "text-amber-600 border-amber-200 w-fit"}
                >
                  {lesson.status === "confirmed" ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Confirmed
                    </>
                  ) : (
                    "Pending"
                  )}
                </Badge>
              </div>
            ))}
            <Button className="w-full" variant="outline">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule New Lesson
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
