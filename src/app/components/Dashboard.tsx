import { Link } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  BookOpen,
  UserCheck,
  Award,
  Bell,
  Calendar,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card } from "./ui/card";
import { supabase } from "../lib/supabase";

type NoticeItem = {
  id: number;
  title: string;
  date?: string;
  created_at?: string;
  category: string;
  urgent?: boolean;
};

type TodayClassItem = {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject: string;
  room: string;
};

type EventItem = {
  id: number;
  title: string;
  due_date: string;
};

export function Dashboard() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [displayName, setDisplayName] = useState("Student");

  const [recentNotices, setRecentNotices] = useState<NoticeItem[]>([]);
  const [todaysClasses, setTodaysClasses] = useState<TodayClassItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);

  const [attendanceAvg, setAttendanceAvg] = useState<number | null>(null);
  const [marksAvg, setMarksAvg] = useState<number | null>(null);
  const [libraryCount, setLibraryCount] = useState(0);

  const currentTime = new Date().toTimeString().slice(0, 5);

  const todaysClassesWithStatus = useMemo(
    () =>
      todaysClasses.map((cls) => {
        let status: "completed" | "ongoing" | "upcoming" = "upcoming";
        if (currentTime >= cls.end_time.slice(0, 5)) {
          status = "completed";
        } else if (currentTime >= cls.start_time.slice(0, 5) && currentTime < cls.end_time.slice(0, 5)) {
          status = "ongoing";
        }

        return {
          ...cls,
          time: `${cls.start_time.slice(0, 5)} - ${cls.end_time.slice(0, 5)}`,
          status,
        };
      }),
    [todaysClasses, currentTime]
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const normalizedEmail = (user.primaryEmailAddress?.emailAddress || "").trim().toLowerCase();

      const { data: studentRow, error: studentError } = await supabase
        .from("users")
        .select("id, name")
        .or(`clerk_user_id.eq.${user.id},email.ilike.${normalizedEmail}`)
        .limit(1)
        .maybeSingle();

      if (studentError || !studentRow?.id) {
        setError("Could not load student profile.");
        setLoading(false);
        return;
      }

      setDisplayName(studentRow.name || user.firstName || normalizedEmail.split("@")[0] || "Student");

      const studentId = studentRow.id;

      const { data: enrollments } = await supabase
        .from("class_enrollments")
        .select("class_id")
        .eq("student_user_id", studentId);

      const classIds = (enrollments ?? []).map((row: any) => row.class_id);

      const dayOfWeek = new Date().toLocaleDateString("en-US", { weekday: "long" });

      const [
        noticesRes,
        timetableRes,
        assignmentsRes,
        attendanceRes,
        marksRes,
        libraryRes,
      ] = await Promise.all([
        supabase
          .from("notices")
          .select("id, title, date, created_at, category, urgent")
          .order("date", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(4),
        classIds.length > 0
          ? supabase
              .from("class_timetables")
              .select("id, day_of_week, start_time, end_time, subject, room")
              .in("class_id", classIds)
              .eq("day_of_week", dayOfWeek)
              .order("start_time", { ascending: true })
          : Promise.resolve({ data: [], error: null } as any),
        classIds.length > 0
          ? supabase
              .from("assignments")
              .select("id, title, due_date")
              .in("class_id", classIds)
              .gte("due_date", new Date().toISOString().slice(0, 10))
              .order("due_date", { ascending: true })
              .limit(4)
          : Promise.resolve({ data: [], error: null } as any),
        supabase
          .from("attendance_records")
          .select("status")
          .eq("student_user_id", studentId),
        supabase
          .from("student_marks")
          .select("total, max_marks")
          .eq("student_user_id", studentId),
        supabase.from("library_books").select("id", { count: "exact", head: true }),
      ]);

      if (noticesRes.error) {
        setError(noticesRes.error.message);
      }

      setRecentNotices((noticesRes.data ?? []) as NoticeItem[]);
      setTodaysClasses((timetableRes.data ?? []) as TodayClassItem[]);
      setUpcomingEvents((assignmentsRes.data ?? []) as EventItem[]);

      const attendanceRows = attendanceRes.data ?? [];
      if (attendanceRows.length > 0) {
        const presentLike = attendanceRows.filter(
          (row: any) => row.status === "Present" || row.status === "Late"
        ).length;
        setAttendanceAvg(Math.round((presentLike / attendanceRows.length) * 100));
      } else {
        setAttendanceAvg(null);
      }

      const marksRows = marksRes.data ?? [];
      if (marksRows.length > 0) {
        const pct =
          marksRows.reduce((sum: number, row: any) => {
            const maxMarks = Number(row.max_marks || 0);
            const total = Number(row.total || 0);
            if (!maxMarks) return sum;
            return sum + (total / maxMarks) * 100;
          }, 0) / marksRows.length;
        setMarksAvg(Number(pct.toFixed(1)));
      } else {
        setMarksAvg(null);
      }

      setLibraryCount(libraryRes.count || 0);

      setLoading(false);
    };

    void fetchDashboardData();
  }, [user?.id]);

  const stats = [
    {
      icon: UserCheck,
      label: "Attendance",
      value: attendanceAvg !== null ? `${attendanceAvg}%` : "--",
      change: attendanceAvg !== null ? "Live" : "No data",
      color: "bg-emerald-500",
      link: "/student/attendance",
    },
    {
      icon: Award,
      label: "Average Marks",
      value: marksAvg !== null ? `${marksAvg}%` : "--",
      change: marksAvg !== null ? "Live" : "No data",
      color: "bg-primary",
      link: "/student/marks",
    },
    {
      icon: BookOpen,
      label: "Library PDFs",
      value: String(libraryCount),
      change: libraryCount > 0 ? "Available" : "No books",
      color: "bg-purple-500",
      link: "/student/library",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Welcome back, {displayName}! 👋</h1>
        <p className="text-muted-foreground">Here is what is happening with your academics today.</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

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
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Today&apos;s Classes</h2>
            </div>
            <Link to="/student/timetable" className="text-sm text-primary hover:underline">
              View Full Schedule
            </Link>
          </div>
          <div className="space-y-3">
            {loading && <p className="text-sm text-muted-foreground">Loading classes from Supabase...</p>}
            {todaysClassesWithStatus.map((cls) => (
              <div key={cls.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <div className="flex flex-col items-center min-w-[100px]">
                  <span className="text-xs text-muted-foreground">Time</span>
                  <span className="text-sm font-medium">{cls.time}</span>
                </div>
                <div className="h-10 w-px bg-border" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{cls.subject}</p>
                  <p className="text-sm text-muted-foreground">{cls.room}</p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    cls.status === "completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : cls.status === "ongoing"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {cls.status}
                </span>
              </div>
            ))}
            {!loading && todaysClassesWithStatus.length === 0 && (
              <p className="text-sm text-muted-foreground">No classes scheduled today.</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Upcoming Deadlines</h2>
          </div>
          <div className="space-y-3">
            {loading && <p className="text-sm text-muted-foreground">Loading events from Supabase...</p>}
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex gap-3">
                <div className="min-w-[88px] p-2 bg-secondary rounded-lg text-center">
                  <span className="text-xs text-secondary-foreground font-medium">
                    {new Date(event.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full inline-block mt-1 bg-amber-100 text-amber-700">
                    Assignment
                  </span>
                </div>
              </div>
            ))}
            {!loading && upcomingEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Recent Notices</h2>
          </div>
          <Link to="/student/notices" className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>
        <div className="space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Loading notices from Supabase...</p>}
          {recentNotices.map((notice) => (
            <div
              key={notice.id}
              className="flex items-start justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  {notice.urgent && <span className="mt-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                  <div>
                    <p className="font-medium text-foreground">{notice.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(notice.date || notice.created_at || Date.now()).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <span className="text-xs px-3 py-1 bg-secondary text-secondary-foreground rounded-full">
                {notice.category}
              </span>
            </div>
          ))}
          {!loading && recentNotices.length === 0 && (
            <p className="text-sm text-muted-foreground">No notices available right now.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
