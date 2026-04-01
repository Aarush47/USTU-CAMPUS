import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import { BackButton } from "../../components/BackButton";
import { Plus, Trash2 } from "lucide-react";

type ClassItem = {
  id: number;
  name: string;
  subject: string;
};

type TimetableRow = {
  id: number;
  class_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject: string;
  room: string;
  session_type: string;
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function TeacherTimetable() {
  const { user } = useUser();
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [rows, setRows] = useState<TimetableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    classId: "",
    dayOfWeek: "Monday",
    startTime: "09:00",
    endTime: "10:00",
    subject: "",
    room: "",
    sessionType: "Lecture",
  });

  const classMap = useMemo(() => {
    const map = new Map<number, ClassItem>();
    classes.forEach((cls) => map.set(cls.id, cls));
    return map;
  }, [classes]);

  const fetchTimetable = async (classIds: number[]) => {
    if (classIds.length === 0) {
      setRows([]);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("class_timetables")
      .select("id, class_id, day_of_week, start_time, end_time, subject, room, session_type")
      .in("class_id", classIds)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setRows([]);
      return;
    }

    setRows((data ?? []) as TimetableRow[]);
  };

  useEffect(() => {
    const bootstrap = async () => {
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

      setTeacherId(teacher.id);

      const { data: classRows, error: classError } = await supabase
        .from("classes")
        .select("id, name, subject")
        .eq("teacher_id", teacher.id)
        .order("name", { ascending: true });

      if (classError) {
        setError(classError.message);
        setLoading(false);
        return;
      }

      const normalized = (classRows ?? []) as ClassItem[];
      setClasses(normalized);
      await fetchTimetable(normalized.map((item) => item.id));
      setLoading(false);
    };

    void bootstrap();
  }, [user?.id]);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!teacherId) {
      setError("Teacher profile missing.");
      return;
    }

    if (!form.classId) {
      setError("Please select a class.");
      return;
    }

    if (form.startTime >= form.endTime) {
      setError("Start time must be earlier than end time.");
      return;
    }

    const { data: potentialConflicts, error: conflictError } = await supabase
      .from("class_timetables")
      .select("id, class_id, day_of_week, start_time, end_time, subject")
      .eq("day_of_week", form.dayOfWeek)
      .or(`class_id.eq.${Number(form.classId)},created_by_user_id.eq.${teacherId}`);

    if (conflictError) {
      setError(conflictError.message);
      return;
    }

    const hasOverlap = (potentialConflicts ?? []).some((slot: any) => {
      const existingStart = String(slot.start_time).slice(0, 5);
      const existingEnd = String(slot.end_time).slice(0, 5);
      return form.startTime < existingEnd && form.endTime > existingStart;
    });

    if (hasOverlap) {
      setError("Timetable conflict detected. This slot overlaps with an existing class or another class you teach.");
      return;
    }

    setSaving(true);

    const { error: insertError } = await supabase.from("class_timetables").insert({
      class_id: Number(form.classId),
      day_of_week: form.dayOfWeek,
      start_time: form.startTime,
      end_time: form.endTime,
      subject: form.subject.trim(),
      room: form.room.trim() || "TBA",
      session_type: form.sessionType,
      created_by_user_id: teacherId,
      teacher_name: user?.fullName || "Teacher",
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    await fetchTimetable(classes.map((item) => item.id));
    setSuccess("Timetable slot added.");
    setForm((prev) => ({ ...prev, subject: "", room: "" }));
  };

  const handleDeleteSlot = async (id: number) => {
    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase.from("class_timetables").delete().eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await fetchTimetable(classes.map((item) => item.id));
    setSuccess("Timetable slot deleted.");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-4">
        <BackButton fallbackPath="/teacher" />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Class Timetable</h1>
        <p className="text-muted-foreground">Create weekly class timetable for the whole semester</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Add Time Slot</h2>
        <form onSubmit={handleCreateSlot} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            required
            value={form.classId}
            onChange={(e) => setForm((prev) => ({ ...prev, classId: e.target.value }))}
            className="px-4 py-2 bg-background border border-border rounded-lg"
          >
            <option value="">Choose class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} - {cls.subject}
              </option>
            ))}
          </select>
          <select
            value={form.dayOfWeek}
            onChange={(e) => setForm((prev) => ({ ...prev, dayOfWeek: e.target.value }))}
            className="px-4 py-2 bg-background border border-border rounded-lg"
          >
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
          <input
            type="time"
            value={form.startTime}
            onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
            className="px-4 py-2 bg-background border border-border rounded-lg"
            required
          />
          <input
            type="time"
            value={form.endTime}
            onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
            className="px-4 py-2 bg-background border border-border rounded-lg"
            required
          />
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
            placeholder="Subject"
            className="px-4 py-2 bg-background border border-border rounded-lg"
            required
          />
          <input
            type="text"
            value={form.room}
            onChange={(e) => setForm((prev) => ({ ...prev, room: e.target.value }))}
            placeholder="Room"
            className="px-4 py-2 bg-background border border-border rounded-lg"
          />
          <select
            value={form.sessionType}
            onChange={(e) => setForm((prev) => ({ ...prev, sessionType: e.target.value }))}
            className="px-4 py-2 bg-background border border-border rounded-lg"
          >
            <option value="Lecture">Lecture</option>
            <option value="Lab">Lab</option>
            <option value="Tutorial">Tutorial</option>
            <option value="Project">Project</option>
            <option value="Seminar">Seminar</option>
          </select>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            {saving ? "Saving..." : "Add Slot"}
          </button>
        </form>
      </div>

      {loading && <p className="text-sm text-muted-foreground mb-4">Loading timetable...</p>}
      {error && <p className="text-sm text-destructive mb-4">{error}</p>}
      {success && <p className="text-sm text-green-600 mb-4">{success}</p>}

      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {classMap.get(row.class_id)?.name || "Class"} • {row.day_of_week}
              </p>
              <p className="text-lg font-semibold text-foreground">{row.subject}</p>
              <p className="text-sm text-muted-foreground">
                {row.start_time.slice(0, 5)} - {row.end_time.slice(0, 5)} • {row.room} • {row.session_type}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDeleteSlot(row.id)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
