import { useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";

const Messages = () => {
  const [message, setMessage] = useState("");

  const chats = [
    { name: "John Smith", message: "Can we reschedule tomorrow to 11am?", time: "10m ago", unread: true },
    { name: "Emma Davis", message: "Thanks for the lesson today!", time: "1h ago", unread: false },
    { name: "Michael Brown", message: "I need to book 2 more lessons", time: "3h ago", unread: true },
  ];

  return (
    <DashboardLayout title="Messages" subtitle="WhatsApp conversations with students.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[600px]">
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chats
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {chats.map((chat, index) => (
                <div
                  key={index}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${chat.unread ? "bg-sky-50" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-slate-900">{chat.name}</p>
                    <span className="text-xs text-muted-foreground">{chat.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{chat.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>John Smith</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto">
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[90%] sm:max-w-[80%]">
                  <p className="text-sm">Can we reschedule tomorrow to 11am?</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-sky-500 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[90%] sm:max-w-[80%]">
                  <p className="text-sm">Sure, I&apos;ve updated the calendar. See you at 11am!</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Textarea
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 min-h-[80px]"
              />
              <Button className="self-start sm:self-end" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
