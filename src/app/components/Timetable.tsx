import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Card } from "./ui/card";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { supabase } from "../lib/supabase";

type TimetableRow = {
  id: number;
  class_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject: string;
  room: string;
  teacher_name: string;
  session_type: string;
};

type ClassItem = {
  id: number;
  name: string;
  subject: string;
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "Lecture":
      return "bg-blue-500";
    case "Lab":
      return "bg-purple-500";
    case "Tutorial":
      return "bg-emerald-500";
    case "Project":
      return "bg-amber-500";
    case "Seminar":
      return "bg-pink-500";
    default:
      return "bg-primary";
  }
};

const weekOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function Timetable() {
  const { user } = useUser();
  const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState<TimetableRow[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const classMap = useMemo(() => {
    const map = new Map<number, ClassItem>();
    classes.forEach((item) => map.set(item.id, item));
    return map;
  }, [classes]);

  const days = useMemo(
    () => weekOrder.filter((day) => slots.some((slot) => slot.day_of_week === day)),
    [slots]
  );

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data: studentRow, error: studentError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", user.id)
        .maybeSingle();

      if (studentError || !studentRow?.id) {
        setError("Could not load your student profile.");
        setLoading(false);
        return;
      }

      const { data: enrollments, error: enrollmentError } = await supabase
        .from("class_enrollments")
        .select("class_id")
        .eq("student_user_id", studentRow.id);

      if (enrollmentError) {
        setError(enrollmentError.message);
        setLoading(false);
        return;
      }

      const classIds = (enrollments ?? []).map((row: any) => row.class_id);

      if (classIds.length === 0) {
        setSlots([]);
        setClasses([]);
        setLoading(false);
        return;
      }

      const { data: classRows } = await supabase
        .from("classes")
        .select("id, name, subject")
        .in("id", classIds);

      setClasses((classRows ?? []) as ClassItem[]);

      const { data: timetableRows, error: timetableError } = await supabase
        .from("class_timetables")
        .select("id, class_id, day_of_week, start_time, end_time, subject, room, teacher_name, session_type")
        .in("class_id", classIds)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (timetableError) {
        setError(timetableError.message);
        setSlots([]);
        setLoading(false);
        return;
      }

      setSlots((timetableRows ?? []) as TimetableRow[]);
      setLoading(false);
    };

    void fetchTimetable();
  }, [user?.id]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Class Timetable</h1>
        <p className="text-muted-foreground mt-1">Weekly class schedule set by your teachers</p>
      </div>

      <Card className="p-4 border border-border">
        <p className="text-sm font-medium text-foreground mb-3">Class Types:</p>
        <div className="flex flex-wrap gap-3">
          {["Lecture", "Lab", "Tutorial", "Project", "Seminar"].map((type) => (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${getTypeColor(type)}`} />
              <span className="text-sm text-muted-foreground">{type}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Loading timetable...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {days.length === 0 && !loading && !error && (
          <Card className="p-6 border border-border">
            <p className="text-sm text-muted-foreground">No timetable available for your enrolled classes yet.</p>
          </Card>
        )}
        {days.map((day) => (
          <Card
            key={day}
            className={`p-6 border transition-all ${day === currentDay ? "border-primary bg-accent/30" : "border-border"}`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">{day}</h2>
              {day === currentDay && (
                <span className="ml-auto px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm">Today</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {slots
                .filter((slot) => slot.day_of_week === day)
                .map((slot) => (
                  <div key={slot.id} className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-start gap-3">
                      <div className={`w-1 h-full rounded ${getTypeColor(slot.session_type)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">
                          {classMap.get(slot.class_id)?.name || "Class"} - {classMap.get(slot.class_id)?.subject || "Subject"}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                          </span>
                        </div>
                        <h4 className="font-medium text-foreground mb-2">{slot.subject}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{slot.room}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-3.5 h-3.5" />
                          <span>{slot.teacher_name || "Teacher"}</span>
                        </div>
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs text-white ${getTypeColor(slot.session_type)}`}>
                          {slot.session_type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
