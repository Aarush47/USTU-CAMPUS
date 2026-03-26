import { useEffect, useMemo, useState } from "react";
import { Calendar, Check, X, Clock } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import { BackButton } from "../../components/BackButton";

type ClassItem = {
  id: number;
  name: string;
  subject: string;
};

type AttendanceStatus = "present" | "absent" | "late" | null;

type AttendanceRecordRow = {
  studentId: number;
  name: string;
  email: string;
  status: AttendanceStatus;
};

export function TeacherAttendance() {
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [records, setRecords] = useState<AttendanceRecordRow[]>([]);
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedClassId = useMemo(() => Number(selectedClass), [selectedClass]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!user?.id) return;

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

      const { data: classRows, error: classesError } = await supabase
        .from("classes")
        .select("id, name, subject")
        .eq("teacher_id", teacher.id)
        .order("created_at", { ascending: false });

      if (classesError) {
        setError(classesError.message);
        setLoading(false);
        return;
      }

      setClasses((classRows ?? []) as ClassItem[]);
      setLoading(false);
    };

    void bootstrap();
  }, [user?.id]);

  useEffect(() => {
    const fetchClassAttendance = async () => {
      if (!selectedClassId || !selectedDate) {
        setRecords([]);
        return;
      }

      setError("");
      setSuccess("");

      const { data: enrolledRows, error: enrollError } = await supabase
        .from("class_enrollments")
        .select("student_user_id, users!inner(id, name, email)")
        .eq("class_id", selectedClassId);

      if (enrollError) {
        setError(enrollError.message);
        setRecords([]);
        return;
      }

      const students = (enrolledRows ?? []).map((row: any) => ({
        studentId: row.student_user_id,
        name: row.users?.name || row.users?.email || "Student",
        email: row.users?.email || "",
      }));

      const { data: attendanceRows, error: attendanceError } = await supabase
        .from("attendance_records")
        .select("student_user_id, status")
        .eq("class_id", selectedClassId)
        .eq("date", selectedDate);

      if (attendanceError) {
        setError(attendanceError.message);
        setRecords(students.map((student) => ({ ...student, status: null })));
        return;
      }

      const statusByStudent = new Map<number, AttendanceStatus>();
      (attendanceRows ?? []).forEach((row: any) => {
        const normalized = String(row.status || "").toLowerCase();
        if (normalized === "present" || normalized === "absent" || normalized === "late") {
          statusByStudent.set(row.student_user_id, normalized);
        }
      });

      setRecords(
        students.map((student) => ({
          ...student,
          status: statusByStudent.get(student.studentId) ?? null,
        }))
      );
    };

    void fetchClassAttendance();
  }, [selectedClassId, selectedDate]);

  const updateAttendance = (
    studentId: number,
    status: "present" | "absent" | "late"
  ) => {
    setRecords(
      records.map((record) =>
        record.studentId === studentId ? { ...record, status } : record
      )
    );
  };

  const markAll = (status: "present" | "absent" | "late") => {
    setRecords(records.map((record) => ({ ...record, status })));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!teacherId) {
      setError("Teacher profile missing.");
      return;
    }

    if (!selectedClassId) {
      setError("Please select a class first.");
      return;
    }

    const payload = records
      .filter((record) => record.status)
      .map((record) => ({
        class_id: selectedClassId,
        student_user_id: record.studentId,
        marked_by_teacher_id: teacherId,
        date: selectedDate,
        status:
          record.status === "present"
            ? "Present"
            : record.status === "absent"
              ? "Absent"
              : "Late",
      }));

    if (payload.length === 0) {
      setError("Please mark attendance for at least one student.");
      return;
    }

    setSaving(true);

    const { error: upsertError } = await supabase
      .from("attendance_records")
      .upsert(payload, { onConflict: "class_id,student_user_id,date" });

    setSaving(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    setSuccess("Attendance saved successfully.");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-4">
        <BackButton fallbackPath="/teacher" />
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Mark Attendance</h1>
        <p className="text-muted-foreground">
          Record attendance for your students
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Date
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">Choose a class...</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Quick Actions
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => markAll("present")}
                disabled={records.length === 0}
                className="flex-1 px-3 py-2 bg-green-500/20 text-green-600 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium"
              >
                Mark All Present
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && <p className="text-sm text-muted-foreground mb-4">Loading classes...</p>}
      {error && <p className="text-sm text-destructive mb-4">{error}</p>}
      {success && <p className="text-sm text-green-600 mb-4">{success}</p>}

      {/* Attendance Table */}
      {records.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {selectedClass ? "No enrolled students found for this class" : "Select a class to mark attendance"}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                    Present
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                    Absent
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                    Late
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.studentId}
                    className="border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-3 text-foreground">
                      <p className="font-medium">{record.name}</p>
                      <p className="text-xs text-muted-foreground">{record.email}</p>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => updateAttendance(record.studentId, "present")}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                          record.status === "present"
                            ? "bg-green-500 text-white"
                            : "bg-accent text-muted-foreground hover:bg-green-500/20"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => updateAttendance(record.studentId, "absent")}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                          record.status === "absent"
                            ? "bg-red-500 text-white"
                            : "bg-accent text-muted-foreground hover:bg-red-500/20"
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => updateAttendance(record.studentId, "late")}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                          record.status === "late"
                            ? "bg-yellow-500 text-white"
                            : "bg-accent text-muted-foreground hover:bg-yellow-500/20"
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Save Button */}
      {records.length > 0 && (
        <div className="flex justify-end gap-3">
          <button className="px-6 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      )}
    </div>
  );
}
