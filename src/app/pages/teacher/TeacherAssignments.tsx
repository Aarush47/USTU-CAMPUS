import { useEffect, useState } from "react";
import { Calendar, Edit2, Eye, Plus, Trash2 } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import { BackButton } from "../../components/BackButton";

type Assignment = {
  id: number;
  title: string;
  description: string | null;
  className: string;
  dueDate: string;
  submissions: number;
  total: number;
  classId: number;
};

type SubmissionItem = {
  student_user_id: number;
  name: string;
  email: string;
  submitted_at: string;
  submission_text: string | null;
  submission_url: string | null;
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
  const [savingEdit, setSavingEdit] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [activeSubmissionAssignmentId, setActiveSubmissionAssignmentId] = useState<number | null>(null);
  const [submissionRows, setSubmissionRows] = useState<SubmissionItem[]>([]);
  const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAssignments = async (resolvedTeacherId: number, resolvedClasses: ClassItem[]) => {
    const { data: rows, error: assignmentError } = await supabase
      .from("assignments")
      .select("id, title, description, class_id, due_date")
      .eq("created_by_teacher_id", resolvedTeacherId)
      .order("created_at", { ascending: false });

    if (assignmentError) {
      setError(assignmentError.message);
      setAssignments([]);
      return;
    }

    const classIds = resolvedClasses.map((item) => item.id);
    const enrollmentCountByClass = new Map<number, number>();
    const submissionCountByAssignment = new Map<number, number>();

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

    const assignmentIds = (rows ?? []).map((row: any) => row.id);
    if (assignmentIds.length > 0) {
      const { data: submissionRowsData } = await supabase
        .from("assignment_submissions")
        .select("assignment_id")
        .in("assignment_id", assignmentIds);

      (submissionRowsData ?? []).forEach((row: any) => {
        const current = submissionCountByAssignment.get(row.assignment_id) ?? 0;
        submissionCountByAssignment.set(row.assignment_id, current + 1);
      });
    }

    const mapped: Assignment[] = (rows ?? []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      classId: row.class_id,
      className:
        resolvedClasses.find((classRow) => classRow.id === row.class_id)?.name ||
        "Unknown Class",
      dueDate: row.due_date,
      submissions: submissionCountByAssignment.get(row.id) ?? 0,
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

  const handleOpenSubmissions = async (assignment: Assignment) => {
    if (activeSubmissionAssignmentId === assignment.id) {
      setActiveSubmissionAssignmentId(null);
      setSubmissionRows([]);
      return;
    }

    setSubmissionsLoading(true);
    setError("");
    setActiveSubmissionAssignmentId(assignment.id);

    const { data, error: submissionError } = await supabase
      .from("assignment_submissions")
      .select("student_user_id, submission_text, submission_url, submitted_at, users!inner(name, email)")
      .eq("assignment_id", assignment.id)
      .order("submitted_at", { ascending: false });

    setSubmissionsLoading(false);

    if (submissionError) {
      setError("Could not load submissions. Apply latest migration for assignment submissions.");
      setSubmissionRows([]);
      return;
    }

    const mappedRows: SubmissionItem[] = (data ?? []).map((row: any) => ({
      student_user_id: row.student_user_id,
      name: row.users?.name || row.users?.email || "Student",
      email: row.users?.email || "",
      submitted_at: row.submitted_at,
      submission_text: row.submission_text,
      submission_url: row.submission_url,
    }));

    setSubmissionRows(mappedRows);
  };

  const handleStartEdit = (assignment: Assignment) => {
    setEditingAssignmentId(assignment.id);
    setEditDescription(assignment.description || "");
    setEditDueDate(assignment.dueDate);
    setError("");
    setSuccess("");
  };

  const handleSaveEdit = async (assignmentId: number) => {
    setError("");
    setSuccess("");

    if (!editDueDate) {
      setError("Due date is required.");
      return;
    }

    setSavingEdit(true);
    const { error: updateError } = await supabase
      .from("assignments")
      .update({
        description: editDescription.trim() || null,
        due_date: editDueDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", assignmentId);

    setSavingEdit(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    if (teacherId) {
      await fetchAssignments(teacherId, classes);
    }
    setEditingAssignmentId(null);
    setSuccess("Assignment updated.");
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
                  {assignment.description && (
                    <p className="text-sm text-foreground/80 mt-1">{assignment.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {assignment.submissions}/{assignment.total} submitted
                  </p>
                  <div className="w-32 h-2 bg-accent rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${assignment.total > 0 ? (assignment.submissions / assignment.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenSubmissions(assignment)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors text-sm"
                >
                  <Eye className="w-4 h-4" />
                  {activeSubmissionAssignmentId === assignment.id ? "Hide Submissions" : "View Submissions"}
                </button>
                <button
                  onClick={() => handleStartEdit(assignment)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors text-sm"
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

              {editingAssignmentId === assignment.id && (
                <div className="mt-4 p-4 bg-accent/40 border border-border rounded-lg space-y-3">
                  <h4 className="font-medium text-foreground">Edit Assignment</h4>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Due Date</label>
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingAssignmentId(null)}
                      className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-accent"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={savingEdit}
                      onClick={() => handleSaveEdit(assignment.id)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {savingEdit ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {activeSubmissionAssignmentId === assignment.id && (
                <div className="mt-4 p-4 bg-accent/20 border border-border rounded-lg">
                  <h4 className="font-medium text-foreground mb-3">Submitted Students</h4>
                  {submissionsLoading ? (
                    <p className="text-sm text-muted-foreground">Loading submissions...</p>
                  ) : submissionRows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No submissions yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {submissionRows.map((submission) => (
                        <div
                          key={`${submission.student_user_id}-${submission.submitted_at}`}
                          className="p-3 bg-card border border-border rounded-lg"
                        >
                          <p className="text-sm font-medium text-foreground">{submission.name} ({submission.email})</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            Submitted: {new Date(submission.submitted_at).toLocaleString("en-IN")}
                          </p>
                          {submission.submission_text && (
                            <p className="text-sm text-foreground mt-2">{submission.submission_text}</p>
                          )}
                          {submission.submission_url && (
                            <a
                              href={submission.submission_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-primary hover:underline mt-2 inline-block"
                            >
                              Open Submission Link
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
