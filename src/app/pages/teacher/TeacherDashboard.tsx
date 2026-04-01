import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Users, BookOpen, Calendar, ClipboardList, Bell, Clock } from "lucide-react";
import { BackButton } from "../../components/BackButton";
import { Card } from "../../components/ui/card";
import { supabase } from "../../lib/supabase";

type AssignmentItem = {
  id: number;
  title: string;
  due_date: string;
};

type TimetableItem = {
  id: number;
  class_id: number;
  subject: string;
  start_time: string;
  end_time: string;
  room: string;
};

type NoticeItem = {
  id: number;
  title: string;
  created_at?: string;
  date?: string;
};

export function TeacherDashboard() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [classesCount, setClassesCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [pendingAssignmentsCount, setPendingAssignmentsCount] = useState(0);
  const [todaysClassesCount, setTodaysClassesCount] = useState(0);

  const [upcomingAssignments, setUpcomingAssignments] = useState<AssignmentItem[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<TimetableItem[]>([]);
  const [latestNotices, setLatestNotices] = useState<NoticeItem[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data: teacher, error: teacherError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", user.id)
        .maybeSingle();

      if (teacherError || !teacher?.id) {
        setError("Could not load teacher profile.");
        setLoading(false);
        return;
      }

      const teacherId = teacher.id;

      const { data: classRows, error: classError } = await supabase
        .from("classes")
        .select("id")
        .eq("teacher_id", teacherId);

      if (classError) {
        setError(classError.message);
        setLoading(false);
        return;
      }

      const classIds = (classRows ?? []).map((row: any) => row.id);
      setClassesCount(classIds.length);

      const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
      const todayDate = new Date().toISOString().slice(0, 10);

      const [enrollmentsRes, assignmentsRes, todayScheduleRes, noticesRes] = await Promise.all([
        classIds.length > 0
          ? supabase.from("class_enrollments").select("id", { count: "exact", head: true }).in("class_id", classIds)
          : Promise.resolve({ count: 0, error: null } as any),
        supabase
          .from("assignments")
          .select("id, title, due_date")
          .eq("created_by_teacher_id", teacherId)
          .gte("due_date", todayDate)
          .order("due_date", { ascending: true })
          .limit(5),
        classIds.length > 0
          ? supabase
              .from("class_timetables")
              .select("id, class_id, subject, start_time, end_time, room")
              .in("class_id", classIds)
              .eq("day_of_week", today)
              .order("start_time", { ascending: true })
          : Promise.resolve({ data: [], error: null } as any),
        supabase
          .from("notices")
          .select("id, title, date, created_at")
          .eq("posted_by_user_id", teacherId)
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

      if (enrollmentsRes.error || assignmentsRes.error || todayScheduleRes.error || noticesRes.error) {
        setError(
          enrollmentsRes.error?.message ||
            assignmentsRes.error?.message ||
            todayScheduleRes.error?.message ||
            noticesRes.error?.message ||
            "Could not load dashboard data."
        );
        setLoading(false);
        return;
      }

      setStudentsCount(enrollmentsRes.count || 0);
      setUpcomingAssignments((assignmentsRes.data ?? []) as AssignmentItem[]);
      setPendingAssignmentsCount((assignmentsRes.data ?? []).length);
      setTodaySchedule((todayScheduleRes.data ?? []) as TimetableItem[]);
      setTodaysClassesCount((todayScheduleRes.data ?? []).length);
      setLatestNotices((noticesRes.data ?? []) as NoticeItem[]);

      setLoading(false);
    };

    void fetchDashboard();
  }, [user?.id]);

  const stats = [
    { label: "My Classes", value: String(classesCount), icon: Users, color: "bg-blue-500" },
    { label: "Total Students", value: String(studentsCount), icon: BookOpen, color: "bg-green-500" },
    {
      label: "Pending Assignments",
      value: String(pendingAssignmentsCount),
      icon: ClipboardList,
      color: "bg-orange-500",
    },
    { label: "Today's Classes", value: String(todaysClassesCount), icon: Calendar, color: "bg-purple-500" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-4">
        <BackButton fallbackPath="/student" />
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Welcome back, {user?.firstName || "Teacher"}! 👋</h1>
        <p className="text-muted-foreground">Here is your live classroom summary.</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6 hover:border-primary transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{loading ? "--" : stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Today&apos;s Schedule</h2>
          </div>
          <div className="space-y-3">
            {loading && <p className="text-sm text-muted-foreground">Loading schedule...</p>}
            {!loading && todaySchedule.length === 0 && (
              <p className="text-sm text-muted-foreground">No classes scheduled for today.</p>
            )}
            {todaySchedule.map((item) => (
              <div key={item.id} className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-foreground">{item.subject}</p>
                <p className="text-sm text-muted-foreground">
                  {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)} • {item.room}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Upcoming Assignment Deadlines</h2>
          </div>
          <div className="space-y-3">
            {loading && <p className="text-sm text-muted-foreground">Loading assignments...</p>}
            {!loading && upcomingAssignments.length === 0 && (
              <p className="text-sm text-muted-foreground">No upcoming assignment deadlines.</p>
            )}
            {upcomingAssignments.map((item) => (
              <div key={item.id} className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  Due: {new Date(item.due_date).toLocaleDateString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Your Latest Notices</h2>
        </div>
        <div className="space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Loading notices...</p>}
          {!loading && latestNotices.length === 0 && (
            <p className="text-sm text-muted-foreground">You have not posted notices yet.</p>
          )}
          {latestNotices.map((notice) => (
            <div key={notice.id} className="p-3 bg-muted rounded-lg">
              <p className="font-medium text-foreground">{notice.title}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(notice.date || notice.created_at || Date.now()).toLocaleDateString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
