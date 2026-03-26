import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import { BackButton } from "../../components/BackButton";

type Assignment = {
  id: number;
  title: string;
  className: string;
  dueDate: string;
  submissions: number;
  total: number;
  classId: number;
};

type ClassItem = {
  id: number;
  name: string;
  subject: string;
};

export function TeacherAssignments() {
  const { user } = useUser();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    classId: "",
    description: "",
    dueDate: "",
  });
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAssignments = async (resolvedTeacherId: number, resolvedClasses: ClassItem[]) => {
    const { data: rows, error: assignmentError } = await supabase
      .from("assignments")
      .select("id, title, class_id, due_date")
      .eq("created_by_teacher_id", resolvedTeacherId)
      .order("created_at", { ascending: false });

    if (assignmentError) {
      setError(assignmentError.message);
      setAssignments([]);
      return;
    }

    const classIds = resolvedClasses.map((item) => item.id);
    const enrollmentCountByClass = new Map<number, number>();

    if (classIds.length > 0) {
      const { data: enrollments } = await supabase
        .from("class_enrollments")
        .select("class_id")
        .in("class_id", classIds);

      (enrollments ?? []).forEach((row: any) => {
        const current = enrollmentCountByClass.get(row.class_id) ?? 0;
        enrollmentCountByClass.set(row.class_id, current + 1);
      });
    }

    const mapped: Assignment[] = (rows ?? []).map((row: any) => ({
      id: row.id,
      title: row.title,
      classId: row.class_id,
      className:
        resolvedClasses.find((classRow) => classRow.id === row.class_id)?.name ||
        "Unknown Class",
      dueDate: row.due_date,
      submissions: 0,
      total: enrollmentCountByClass.get(row.class_id) ?? 0,
    }));

    setAssignments(mapped);
  };

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

      const { data: classRows, error: classError } = await supabase
        .from("classes")
        .select("id, name, subject")
        .eq("teacher_id", teacher.id)
        .order("created_at", { ascending: false });

      if (classError) {
        setError(classError.message);
        setLoading(false);
        return;
      }

      const normalizedClasses = (classRows ?? []) as ClassItem[];
      setClasses(normalizedClasses);
      await fetchAssignments(teacher.id, normalizedClasses);
      setLoading(false);
    };

    void bootstrap();
  }, [user?.id]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!teacherId) {
      setError("Teacher profile missing.");
      return;
    }

    setSaving(true);

    const { error: createError } = await supabase.from("assignments").insert({
      title: formData.title.trim(),
      class_id: Number(formData.classId),
      description: formData.description.trim() || null,
      due_date: formData.dueDate,
      created_by_teacher_id: teacherId,
    });

    setSaving(false);

    if (createError) {
      setError(createError.message);
      return;
    }

    await fetchAssignments(teacherId, classes);
    setFormData({ title: "", classId: "", description: "", dueDate: "" });
    setShowCreateForm(false);
    setSuccess("Assignment created successfully.");
  };

  const handleDeleteAssignment = async (assignmentId: number) => {
    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase
      .from("assignments")
      .delete()
      .eq("id", assignmentId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (teacherId) {
      await fetchAssignments(teacherId, classes);
    }
    setSuccess("Assignment deleted.");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-4">
        <BackButton fallbackPath="/teacher" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Assignments</h1>
          <p className="text-muted-foreground">
            Create and manage assignments for your classes
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Assignment
        </button>
      </div>

      {/* Create Assignment Form */}
      {showCreateForm && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Create New Assignment</h2>
          <form onSubmit={handleCreateAssignment}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Assignment title"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Class
                </label>
                <select
                  value={formData.classId}
                  onChange={(e) =>
                    setFormData({ ...formData, classId: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  required
                >
                  <option value="">Choose a class...</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - {cls.subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Assignment details and instructions"
                rows={4}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {saving ? "Creating..." : "Create Assignment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <p className="text-sm text-muted-foreground mb-4">Loading assignments...</p>}
      {error && <p className="text-sm text-destructive mb-4">{error}</p>}
      {success && <p className="text-sm text-green-600 mb-4">{success}</p>}

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No assignments created yet
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create First Assignment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {assignment.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {assignment.className} • Due: {new Date(assignment.dueDate).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {assignment.submissions}/{assignment.total} submitted
                  </p>
                  <div className="w-32 h-2 bg-accent rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${(assignment.submissions / assignment.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors text-sm">
                  <Eye className="w-4 h-4" />
                  View Submissions
                </button>
                <button
                  disabled
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-foreground/50 transition-colors text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAssignment(assignment.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
