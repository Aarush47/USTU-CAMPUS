import { Link } from "react-router";
import { 
  BookOpen, 
  UserCheck, 
  DollarSign, 
  Award,
  Bell,
  Calendar,
  TrendingUp,
  Clock
} from "lucide-react";
import { Card } from "./ui/card";
import { useSupabaseTable } from "../hooks/useSupabaseTable";

type NoticeItem = {
  id: number;
  title: string;
  date: string;
  category: string;
  urgent?: boolean;
};

type ClassItem = {
  id?: number;
  time: string;
  subject: string;
  room: string;
  status: "completed" | "ongoing" | "upcoming";
};

type EventItem = {
  id?: number;
  date: string;
  title: string;
  type: "deadline" | "event" | "exam";
};

const stats = [
  {
    icon: UserCheck,
    label: "Attendance",
    value: "92%",
    change: "+2%",
    color: "bg-emerald-500",
    link: "/attendance"
  },
  {
    icon: Award,
    label: "Average Grade",
    value: "8.5",
    change: "+0.3",
    color: "bg-primary",
    link: "/marks"
  },
  {
    icon: BookOpen,
    label: "Books Issued",
    value: "3",
    change: "Active",
    color: "bg-purple-500",
    link: "/library"
  },
  {
    icon: DollarSign,
    label: "Pending Fees",
    value: "₹0",
    change: "Paid",
    color: "bg-cyan-500",
    link: "/fees"
  },
];

export function Dashboard() {
  const {
    data: recentNotices,
    loading: noticesLoading,
  } = useSupabaseTable<NoticeItem>(["notices", "notice_board"], {
    fallbackData: [],
    orderBy: { column: "date", ascending: false },
    limit: 4,
  });

  const {
    data: todaysClasses,
    loading: classesLoading,
  } = useSupabaseTable<ClassItem>(["todays_classes", "classes"], {
    fallbackData: [],
    orderBy: { column: "time", ascending: true },
  });

  const {
    data: upcomingEvents,
    loading: eventsLoading,
  } = useSupabaseTable<EventItem>(["upcoming_events", "events"], {
    fallbackData: [],
    orderBy: { column: "date", ascending: true },
    limit: 4,
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Welcome back, Arjun! 👋</h1>
        <p className="text-muted-foreground">Here's what's happening with your academics today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} to={stat.link}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-semibold text-foreground">{stat.value}</h3>
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Today's Classes</h2>
            </div>
            <Link to="/timetable" className="text-sm text-primary hover:underline">
              View Full Schedule
            </Link>
          </div>
          <div className="space-y-3">
            {classesLoading && (
              <p className="text-sm text-muted-foreground">Loading classes from Supabase...</p>
            )}
            {todaysClasses.map((cls, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <div className="flex flex-col items-center min-w-[80px]">
                  <span className="text-xs text-muted-foreground">Time</span>
                  <span className="text-sm font-medium">{cls.time}</span>
                </div>
                <div className="h-10 w-px bg-border" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{cls.subject}</p>
                  <p className="text-sm text-muted-foreground">{cls.room}</p>
                </div>
                <div>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    cls.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    cls.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {cls.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
          </div>
          <div className="space-y-3">
            {eventsLoading && (
              <p className="text-sm text-muted-foreground">Loading events from Supabase...</p>
            )}
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center min-w-[50px] p-2 bg-secondary rounded-lg">
                  <span className="text-xs text-secondary-foreground font-medium">{event.date.split(' ')[0]}</span>
                  <span className="text-xs text-muted-foreground">{event.date.split(' ')[1]}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                    event.type === 'exam' ? 'bg-red-100 text-red-700' :
                    event.type === 'deadline' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {event.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Notices */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Recent Notices</h2>
          </div>
          <Link to="/notices" className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>
        <div className="space-y-3">
          {noticesLoading && (
            <p className="text-sm text-muted-foreground">Loading notices from Supabase...</p>
          )}
          {recentNotices.map((notice) => (
            <div key={notice.id} className="flex items-start justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  {notice.urgent && (
                    <span className="mt-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">{notice.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(notice.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
              <span className="text-xs px-3 py-1 bg-secondary text-secondary-foreground rounded-full">
                {notice.category}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}