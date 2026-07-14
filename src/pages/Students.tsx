import { Plus, MoreHorizontal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";

const Students = () => {
  const students = [
    { name: "John Smith", email: "john@example.com", phone: "+44 7700 900001", lessons: 12, status: "active" },
    { name: "Emma Davis", email: "emma@example.com", phone: "+44 7700 900002", lessons: 8, status: "active" },
    { name: "Michael Brown", email: "michael@example.com", phone: "+44 7700 900003", lessons: 5, status: "pending" },
    { name: "Sarah Wilson", email: "sarah@example.com", phone: "+44 7700 900004", lessons: 15, status: "active" },
    { name: "Tom Harris", email: "tom@example.com", phone: "+44 7700 900005", lessons: 2, status: "new" },
  ];

  return (
    <DashboardLayout title="Students" subtitle="Manage your driving students.">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{students.length}</p>
            <p className="text-sm text-muted-foreground">Total students</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>All Students</CardTitle>
            <Input placeholder="Search students..." className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Phone</th>
                  <th className="pb-3 font-medium">Lessons</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </td>
                    <td className="py-4 text-muted-foreground">{student.phone}</td>
                    <td className="py-4">{student.lessons}</td>
                    <td className="py-4">
                      <Badge
                        variant={student.status === "active" ? "secondary" : "outline"}
                        className={
                          student.status === "active"
                            ? "bg-green-100 text-green-700"
                            : student.status === "new"
                            ? "bg-blue-100 text-blue-700"
                            : "text-amber-600 border-amber-200"
                        }
                      >
                        {student.status}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Students;
