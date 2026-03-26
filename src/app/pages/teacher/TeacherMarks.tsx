import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Trash2 } from "lucide-react";
import { BackButton } from "../../components/BackButton";
import { supabase } from "../../lib/supabase";

type ClassRow = {
  id: number;
  name: string;
  subject: string;
};

type StudentRow = {
  id: number;
  name: string;
  email: string;
};

type MarkRow = {
  id: number;
  subject: string;
  semester: number;
  internals: number;
  ca1: number;
  mid_sem: number;
  ca2: number;
  assignment: number;
  end_sem: number;
  total: number;
  max_marks: number;
  grade: string;
  cgpa: number | null;
  student_user_id: number;
};

const percentageToCGPA = (percentage: number): string => {
  // Convert percentage to CGPA (0-10 scale)
  const cgpa = (percentage / 100) * 10;
  return cgpa.toFixed(1);
};

// Fixed component max marks
const COMPONENT_MAX_MARKS = {
  internals: 5,
  ca1: 10,
  mid_sem: 20,
  ca2: 10,
  assignment: 5,
  end_sem: 50,
};

const TOTAL_MAX_MARKS = 100;

const deriveGrade = (internalsVal: number, ca1Val: number, midSemVal: number, ca2Val: number, assignmentVal: number, endSemVal: number) => {
  // Clamp each component to its max
  const clampedInternals = Math.min(internalsVal, COMPONENT_MAX_MARKS.internals);
  const clampedCa1 = Math.min(ca1Val, COMPONENT_MAX_MARKS.ca1);
  const clampedMidSem = Math.min(midSemVal, COMPONENT_MAX_MARKS.mid_sem);
  const clampedCa2 = Math.min(ca2Val, COMPONENT_MAX_MARKS.ca2);
  const clampedAssignment = Math.min(assignmentVal, COMPONENT_MAX_MARKS.assignment);
  const clampedEndSem = Math.min(endSemVal, COMPONENT_MAX_MARKS.end_sem);
  
  const total = clampedInternals + clampedCa1 + clampedMidSem + clampedCa2 + clampedAssignment + clampedEndSem;
  const percentage = (total / TOTAL_MAX_MARKS) * 100;
  return percentageToCGPA(percentage);
};

export function TeacherMarks() {
  const { user } = useUser();
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [marks, setMarks] = useState<MarkRow[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("1");
  const [internals, setInternals] = useState("0");
  const [ca1, setCa1] = useState("0");
  const [midSem, setMidSem] = useState("0");
  const [ca2, setCa2] = useState("0");
  const [assignment, setAssignment] = useState("0");
  const [endSem, setEndSem] = useState("0");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const total = useMemo(
    () => {
      const internalsVal = Number(internals || 0);
      const ca1Val = Number(ca1 || 0);
      const midSemVal = Number(midSem || 0);
      const ca2Val = Number(ca2 || 0);
      const assignmentVal = Number(assignment || 0);
      const endSemVal = Number(endSem || 0);
      
      // Clamp each to its maximum
      const clampedInternals = Math.min(internalsVal, COMPONENT_MAX_MARKS.internals);
      const clampedCa1 = Math.min(ca1Val, COMPONENT_MAX_MARKS.ca1);
      const clampedMidSem = Math.min(midSemVal, COMPONENT_MAX_MARKS.mid_sem);
      const clampedCa2 = Math.min(ca2Val, COMPONENT_MAX_MARKS.ca2);
      const clampedAssignment = Math.min(assignmentVal, COMPONENT_MAX_MARKS.assignment);
      const clampedEndSem = Math.min(endSemVal, COMPONENT_MAX_MARKS.end_sem);
      
      return clampedInternals + clampedCa1 + clampedMidSem + clampedCa2 + clampedAssignment + clampedEndSem;
    },
    [internals, ca1, midSem, ca2, assignment, endSem]
  );

  const grade = useMemo(
    () => deriveGrade(Number(internals || 0), Number(ca1 || 0), Number(midSem || 0), Number(ca2 || 0), Number(assignment || 0), Number(endSem || 0)),
    [internals, ca1, midSem, ca2, assignment, endSem]
  );

  const selectedClass = useMemo(
    () => classes.find((cls) => cls.id === Number(selectedClassId)),
    [classes, selectedClassId]
  );

  const studentById = useMemo(
    () => new Map(students.map((student) => [student.id, student])),
    [students]
  );

  const fetchMarksForClass = async (classId: number) => {
    const { data, error: marksError } = await supabase
      .from("student_marks")
      .select("id, subject, semester, internals, ca1, mid_sem, ca2, assignment, end_sem, total, max_marks, grade, cgpa, student_user_id")
      .eq("class_id", classId)
      .order("updated_at", { ascending: false });

    if (marksError) {
      setError(marksError.message);
      setMarks([]);
      return;
    }

    setMarks((data ?? []) as MarkRow[]);
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError("");

      const { data: teacherRow, error: teacherError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", user.id)
        .maybeSingle();

      if (teacherError || !teacherRow?.id) {
        setError("Could not load teacher profile.");
        setLoading(false);
        return;
      }

      setTeacherId(teacherRow.id);

      const { data: classRows, error: classError } = await supabase
        .from("classes")
        .select("id, name, subject")
        .eq("teacher_id", teacherRow.id)
        .order("created_at", { ascending: false });

      if (classError) {
        setError(classError.message);
        setLoading(false);
        return;
      }

      setClasses((classRows ?? []) as ClassRow[]);
      setLoading(false);
    };

    void bootstrap();
  }, [user?.id]);

  useEffect(() => {
    const fetchStudentsAndMarks = async () => {
      if (!selectedClassId) {
        setStudents([]);
        setMarks([]);
        return;
      }

      const classId = Number(selectedClassId);
      const { data: enrollmentRows, error: enrollmentError } = await supabase
        .from("class_enrollments")
        .select("student_user_id, users!inner(id, name, email)")
        .eq("class_id", classId);

      if (enrollmentError) {
        setError(enrollmentError.message);
        setStudents([]);
        setMarks([]);
        return;
      }

      const studentRows = (enrollmentRows ?? []).map((row: any) => ({
        id: row.student_user_id,
        name: row.users?.name || row.users?.email || "Student",
        email: row.users?.email || "",
      }));

      setStudents(studentRows);
      await fetchMarksForClass(classId);
    };

    void fetchStudentsAndMarks();
  }, [selectedClassId]);

  const handlePublishMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!teacherId) {
      setError("Teacher profile missing.");
      return;
    }

    if (!selectedClassId || !selectedStudentId || !subject.trim()) {
      setError("Class, student and subject are required.");
      return;
    }

    setSaving(true);

    const payload = {
      student_user_id: Number(selectedStudentId),
      class_id: Number(selectedClassId),
      subject: subject.trim(),
      semester: Number(semester),
      internals: Number(internals || 0),
      ca1: Number(ca1 || 0),
      mid_sem: Number(midSem || 0),
      ca2: Number(ca2 || 0),
      assignment: Number(assignment || 0),
      end_sem: Number(endSem || 0),
      total,
      max_marks: TOTAL_MAX_MARKS,
      grade,
      cgpa: Number(grade),
      created_by_teacher_id: teacherId,
    };

    const { error: upsertError } = await supabase
      .from("student_marks")
      .upsert(payload, {
        onConflict: "student_user_id,class_id,subject,semester",
      });

    setSaving(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    await fetchMarksForClass(Number(selectedClassId));
    setSelectedStudentId("");
    setInternals("0");
    setCa1("0");
    setMidSem("0");
    setCa2("0");
    setAssignment("0");
    setEndSem("0");
    setSuccess("Marks published successfully.");
  };

  const handleDeleteMark = async (markId: number) => {
    setError("");
    setSuccess("");

    const confirmed = window.confirm("Delete this marks entry?");
    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("student_marks")
      .delete()
      .eq("id", markId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (selectedClassId) {
      await fetchMarksForClass(Number(selectedClassId));
    }
    setSuccess("Marks entry deleted.");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-4">
        <BackButton fallbackPath="/teacher" />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Publish Marks</h1>
        <p className="text-muted-foreground">Create and update student marks for your classes.</p>
      </div>

      {loading && <p className="text-sm text-muted-foreground mb-4">Loading classes...</p>}
      {error && <p className="text-sm text-destructive mb-4">{error}</p>}
      {success && <p className="text-sm text-green-600 mb-4">{success}</p>}

      <form onSubmit={handlePublishMarks} className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                const classRow = classes.find((cls) => cls.id === Number(e.target.value));
                setSubject(classRow?.subject ?? "");
                setSelectedStudentId("");
              }}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
              required
            >
              <option value="">Choose class...</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
              required
            >
              <option value="">Choose student...</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={selectedClass?.subject || "e.g. Mathematics"}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Semester</label>
            <input
              type="number"
              min={1}
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Internals (Max: {COMPONENT_MAX_MARKS.internals})</label>
            <input
              type="number"
              min={0}
              max={COMPONENT_MAX_MARKS.internals}
              value={internals}
              onChange={(e) => setInternals(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">CA-1 (Max: {COMPONENT_MAX_MARKS.ca1})</label>
            <input
              type="number"
              min={0}
              max={COMPONENT_MAX_MARKS.ca1}
              step={0.5}
              value={ca1}
              onChange={(e) => setCa1(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Mid-Sem (Max: {COMPONENT_MAX_MARKS.mid_sem})</label>
            <input
              type="number"
              min={0}
              max={COMPONENT_MAX_MARKS.mid_sem}
              value={midSem}
              onChange={(e) => setMidSem(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">CA-2 (Max: {COMPONENT_MAX_MARKS.ca2})</label>
            <input
              type="number"
              min={0}
              max={COMPONENT_MAX_MARKS.ca2}
              step={0.5}
              value={ca2}
              onChange={(e) => setCa2(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Assignment (Max: {COMPONENT_MAX_MARKS.assignment})</label>
            <input
              type="number"
              min={0}
              max={COMPONENT_MAX_MARKS.assignment}
              value={assignment}
              onChange={(e) => setAssignment(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">End-Sem (Max: {COMPONENT_MAX_MARKS.end_sem})</label>
            <input
              type="number"
              min={0}
              max={COMPONENT_MAX_MARKS.end_sem}
              value={endSem}
              onChange={(e) => setEndSem(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
              required
            />
          </div>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-accent border border-border flex items-center justify-between">
          <p className="text-sm text-foreground">Total: {total} / {TOTAL_MAX_MARKS}</p>
          <p className="text-sm font-medium text-foreground">Grade: {grade}</p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Publishing..." : "Publish Marks"}
          </button>
        </div>
      </form>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Published Marks</h2>
        {marks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No marks published for selected class yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-sm text-muted-foreground">Student</th>
                  <th className="text-left py-2 text-sm text-muted-foreground">Subject</th>
                  <th className="text-left py-2 text-sm text-muted-foreground">Semester</th>
                  <th className="text-left py-2 text-sm text-muted-foreground">Total</th>
                  <th className="text-left py-2 text-sm text-muted-foreground">Grade</th>
                  <th className="text-right py-2 text-sm text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((item) => (
                  <tr key={item.id} className="border-b border-border">
                    <td className="py-2 text-sm text-foreground">
                      <p>{studentById.get(item.student_user_id)?.name || `ID ${item.student_user_id}`}</p>
                      <p className="text-xs text-muted-foreground">{studentById.get(item.student_user_id)?.email || ""}</p>
                    </td>
                    <td className="py-2 text-sm text-foreground">{item.subject}</td>
                    <td className="py-2 text-sm text-foreground">{item.semester}</td>
                    <td className="py-2 text-sm text-foreground">{item.total}/{item.max_marks}</td>
                    <td className="py-2 text-sm text-foreground">{item.grade}</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteMark(item.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border text-destructive hover:bg-destructive/10 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
