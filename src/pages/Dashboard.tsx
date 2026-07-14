import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Clock,
  TrendingUp,
  Phone,
  Route,
  ChevronDown,
  Target,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/DashboardLayout";

const Dashboard = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("This week");
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

  const stats = [
    { title: "Total Students", value: "24", change: "+12%", icon: Users, color: "text-blue-600", bgColor: "bg-blue-50" },
    { title: "Lessons", value: "89", change: "+8%", icon: Calendar, color: "text-green-600", bgColor: "bg-green-50" },
    { title: "Messages", value: "342", change: "+23%", icon: MessageSquare, color: "text-purple-600", bgColor: "bg-purple-50" },
    { title: "Revenue", value: "£2,450", change: "+15%", icon: TrendingUp, color: "text-orange-600", bgColor: "bg-orange-50" },
    { title: "Cancel Rate", value: "4.5%", change: "-1.2%", icon: Clock, color: "text-red-600", bgColor: "bg-red-50" },
    { title: "Avg. Value", value: "£52", change: "+3%", icon: BarChart3, color: "text-indigo-600", bgColor: "bg-indigo-50" },
  ];

  const todaySchedule = [
    { student: "John Smith", time: "10:00 AM", duration: "1h", status: "confirmed" },
    { student: "Emma Davis", time: "2:00 PM", duration: "1.5h", status: "pending" },
    { student: "Michael Brown", time: "4:00 PM", duration: "1h", status: "confirmed" },
  ];

  const upcomingLessons = [
    { student: "John Smith", time: "Today, 10:00 AM", status: "confirmed" },
    { student: "Emma Davis", time: "Today, 2:00 PM", status: "pending" },
    { student: "Michael Brown", time: "Tomorrow, 9:00 AM", status: "confirmed" },
    { student: "Sarah Wilson", time: "Tomorrow, 3:30 PM", status: "pending" },
  ];

  const activity = [
    { text: "John Smith booked a lesson", time: "2 min ago", icon: Calendar },
    { text: "WhatsApp reminder sent to Emma Davis", time: "15 min ago", icon: Phone },
    { text: "Route optimized for tomorrow", time: "1 hour ago", icon: Route },
    { text: "New student signup: Tom Harris", time: "3 hours ago", icon: Users },
  ];

  const revenueData = [
    { name: "Mon", revenue: 240 },
    { name: "Tue", revenue: 180 },
    { name: "Wed", revenue: 320 },
    { name: "Thu", revenue: 260 },
    { name: "Fri", revenue: 390 },
    { name: "Sat", revenue: 450 },
    { name: "Sun", revenue: 120 },
  ];

  const lessonData = [
    { name: "Booked", value: 42, color: "#3b82f6" },
    { name: "Completed", value: 38, color: "#10b981" },
    { name: "Cancelled", value: 4, color: "#f59e0b" },
  ];

  const studentGrowth = [
    { name: "Jan", students: 12 },
    { name: "Feb", students: 18 },
    { name: "Mar", students: 22 },
    { name: "Apr", students: 24 },
  ];

  const revenueGoal = { current: 2450, target: 3000 };
  const revenueProgress = Math.round((revenueGoal.current / revenueGoal.target) * 100);

  return (
    <DashboardLayout title="Dashboard" subtitle="Here’s what’s happening with your driving school today.">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Welcome back, Alex</h3>
          <p className="text-muted-foreground">Here’s what’s happening with your driving school today.</p>
        </div>

        <div className="relative group">
          <Button variant="outline" className="gap-2">
            {dateRange}
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div className="absolute right-0 top-full mt-2 bg-white border rounded-xl shadow-lg p-2 hidden group-hover:block z-20">
            {["Today", "This week", "This month", "This year"].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <Card className="border-0 shadow-sm mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today&apos;s Schedule
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate("/calendar")}>
            View Calendar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaySchedule.map((lesson, index) => (
              <div key={index} className="p-4 rounded-xl border bg-white hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-slate-900">{lesson.student}</p>
                  <Badge
                    variant={lesson.status === "confirmed" ? "secondary" : "outline"}
                    className={lesson.status === "confirmed" ? "bg-green-100 text-green-700" : "text-amber-600 border-amber-200"}
                  >
                    {lesson.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{lesson.time} · {lesson.duration}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue This Week</CardTitle>
              <CardDescription>Click a bar to see daily breakdown</CardDescription>
            </div>
            {selectedChart?.startsWith("revenue") && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedChart(null)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `£${v}`} />
                  <Tooltip formatter={(v) => `£${v}`} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} onClick={(data) => setSelectedChart(`revenue-${data.name}`)} className="cursor-pointer" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {selectedChart?.startsWith("revenue") && (
              <div className="mt-4 p-4 rounded-lg bg-slate-50 text-sm">
                <p className="font-semibold">Revenue on {selectedChart.split("-")[1]}</p>
                <p className="text-muted-foreground">3 lessons booked · £{revenueData.find(d => d.name === selectedChart.split("-")[1])?.revenue} total</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Lesson Status</CardTitle>
            <CardDescription>Click a segment for details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={lessonData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                    {lessonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="cursor-pointer" onClick={() => setSelectedChart(`lesson-${entry.name}`)} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2 flex-wrap">
              {lessonData.map((item) => (
                <button key={item.name} onClick={() => setSelectedChart(`lesson-${item.name}`)} className="flex items-center gap-1 text-xs">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </button>
              ))}
            </div>
            {selectedChart?.startsWith("lesson") && (
              <div className="mt-4 p-4 rounded-lg bg-slate-50 text-sm">
                <p className="font-semibold">{selectedChart.split("-")[1]} Lessons</p>
                <p className="text-muted-foreground">{lessonData.find(d => d.name === selectedChart.split("-")[1])?.value} lessons in this period</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm lg:col-span-3">
          <CardHeader>
            <CardTitle>Student Growth</CardTitle>
            <CardDescription>Click a point to view month details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64" onClick={() => setSelectedChart("growth-detail")}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={studentGrowth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="students" stroke="#10b981" strokeWidth={3} dot={{ r: 4, className: "cursor-pointer" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {selectedChart === "growth-detail" && (
              <div className="mt-4 p-4 rounded-lg bg-slate-50 text-sm">
                <p className="font-semibold">Student Growth Trend</p>
                <p className="text-muted-foreground">Growth from {studentGrowth[0].students} to {studentGrowth[studentGrowth.length - 1].students} students</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-green-600 bg-green-50 text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Lessons */}
        <Card className="xl:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Lessons
              </CardTitle>
              <CardDescription>Your schedule for the next few days</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/calendar")}>View Calendar</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingLessons.map((lesson, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-white hover:bg-slate-50 transition-colors gap-3"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      lesson.time.startsWith("Today") ? "bg-sky-100" : "bg-slate-100"
                    }`}>
                      <Clock className="h-5 w-5 text-sky-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{lesson.student}</p>
                      <p className="text-sm text-muted-foreground">{lesson.time}</p>
                    </div>
                  </div>
                  <Badge
                    variant={lesson.status === "confirmed" ? "secondary" : "outline"}
                    className={
                      lesson.status === "confirmed"
                        ? "bg-green-100 text-green-700 w-fit"
                        : "text-amber-600 border-amber-200 w-fit"
                    }
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
            </div>
          </CardContent>
        </Card>

        {/* Activity & Quick Actions */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send WhatsApp
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Lesson
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activity.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-900">{item.text}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revenue Goal */}
      <Card className="mt-6 border-0 shadow-sm bg-gradient-to-r from-orange-50 to-amber-50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Monthly Revenue Goal</h3>
                <p className="text-sm text-muted-foreground">£{revenueGoal.current.toLocaleString()} of £{revenueGoal.target.toLocaleString()} target</p>
              </div>
            </div>
            <div className="w-full sm:w-1/3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">{revenueProgress}%</span>
                <span className="font-medium">£{revenueGoal.target - revenueGoal.current} left</span>
              </div>
              <Progress value={revenueProgress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Progress */}
      <Card className="mt-6 border-0 shadow-sm bg-gradient-to-r from-sky-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Complete your setup</h3>
              <p className="text-sm text-muted-foreground">Connect your Google Calendar to sync your lessons</p>
            </div>
            <Button variant="default">Connect Google Calendar</Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Dashboard;
