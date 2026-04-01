import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { ClipboardList, Calendar, Link2 } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../lib/supabase";

type AssignmentRow = {
  id: number;
  title: string;
  description: string | null;
  due_date: string;
  classes?: {
    name?: string;
    subject?: string;
  } | null;
};

type SubmissionRow = {
  assignment_id: number;
  submission_text: string | null;
  submission_url: string | null;
  submitted_at: string;
};

export function StudentAssignments() {
  const { user } = useUser();
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [studentUserId, setStudentUserId] = useState<number | null>(null);
  const [submissionsByAssignment, setSubmissionsByAssignment] = useState<Map<number, SubmissionRow>>(new Map());
  const [openSubmissionAssignmentId, setOpenSubmissionAssignmentId] = useState<number | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user?.id) return;

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

      setStudentUserId(studentRow.id);

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
        setAssignments([]);
        setLoading(false);
        return;
      }

      const { data: assignmentRows, error: assignmentsError } = await supabase
        .from("assignments")
        .select("id, title, description, due_date, classes(name, subject)")
        .in("class_id", classIds)
        .order("due_date", { ascending: true });

      if (assignmentsError) {
        setError(assignmentsError.message);
        setLoading(false);
        return;
      }

      setAssignments((assignmentRows ?? []) as AssignmentRow[]);

      const assignmentIds = (assignmentRows ?? []).map((row: any) => row.id);
      if (assignmentIds.length > 0) {
        const { data: submissionRows, error: submissionsError } = await supabase
          .from("assignment_submissions")
          .select("assignment_id, submission_text, submission_url, submitted_at")
          .eq("student_user_id", studentRow.id)
          .in("assignment_id", assignmentIds);

        if (!submissionsError) {
          const mapped = new Map<number, SubmissionRow>();
          (submissionRows ?? []).forEach((submission: any) => {
            mapped.set(submission.assignment_id, submission as SubmissionRow);
          });
          setSubmissionsByAssignment(mapped);
        }
      }

      setLoading(false);
    };

    void fetchAssignments();
  }, [user?.id]);

  const openSubmissionForm = (assignmentId: number) => {
    const existing = submissionsByAssignment.get(assignmentId);
    setOpenSubmissionAssignmentId(assignmentId);
    setSubmissionText(existing?.submission_text || "");
    setSubmissionUrl(existing?.submission_url || "");
    setError("");
    setSuccess("");
  };

  const handleSubmitAssignment = async (assignmentId: number) => {
    setError("");
    setSuccess("");

    if (!studentUserId) {
      setError("Student profile missing.");
      return;
    }

    if (!submissionText.trim() && !submissionUrl.trim()) {
      setError("Add either submission notes or a submission URL.");
      return;
    }

    setSubmitting(true);

    const { data, error: submitError } = await supabase
      .from("assignment_submissions")
      .upsert(
        {
          assignment_id: assignmentId,
          student_user_id: studentUserId,
          submission_text: submissionText.trim() || null,
          submission_url: submissionUrl.trim() || null,
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "assignment_id,student_user_id" }
      )
      .select("assignment_id, submission_text, submission_url, submitted_at")
      .maybeSingle();

    setSubmitting(false);

    if (submitError) {
      setError("Could not submit assignment. Ensure latest backend migration is applied.");
      return;
    }

    if (data) {
      setSubmissionsByAssignment((prev) => {
        const next = new Map(prev);
        next.set(assignmentId, data as SubmissionRow);
        return next;
      });
    }

    setSuccess("Assignment submitted successfully.");
    setOpenSubmissionAssignmentId(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Assignments</h1>
        <p className="text-muted-foreground mt-1">Track your class assignments and deadlines</p>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading assignments...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      {!loading && !error && assignments.length === 0 && (
        <Card className="p-10 text-center">
          <ClipboardList className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-60" />
          <p className="text-muted-foreground">No assignments available for your enrolled classes.</p>
        </Card>
      )}

      <div className="space-y-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id} className="p-5 border border-border">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{assignment.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {(assignment.classes?.name || "Class") + " - " + (assignment.classes?.subject || "Subject")}
                </p>
                {assignment.description && (
                  <p className="text-sm text-foreground mt-2">{assignment.description}</p>
                )}
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Due: {new Date(assignment.due_date).toLocaleDateString("en-IN")}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-muted-foreground">
                  {submissionsByAssignment.has(assignment.id)
                    ? `Submitted on ${new Date(submissionsByAssignment.get(assignment.id)!.submitted_at).toLocaleString("en-IN")}`
                    : "Not submitted yet"}
                </p>
                <button
                  type="button"
                  onClick={() => openSubmissionForm(assignment.id)}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                >
                  {submissionsByAssignment.has(assignment.id) ? "Update Submission" : "Submit Assignment"}
                </button>
              </div>

              {openSubmissionAssignmentId === assignment.id && (
                <div className="mt-3 p-3 bg-accent/30 border border-border rounded-lg space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Submission Notes
                    </label>
                    <textarea
                      rows={3}
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      placeholder="Write your summary or answer here"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Submission URL (optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-muted-foreground" />
                      <input
                        type="url"
                        value={submissionUrl}
                        onChange={(e) => setSubmissionUrl(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setOpenSubmissionAssignmentId(null)}
                      className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-accent"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleSubmitAssignment(assignment.id)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
