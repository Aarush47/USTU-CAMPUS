import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { ClipboardList, Calendar } from "lucide-react";
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

export function StudentAssignments() {
  const { user } = useUser();
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setLoading(false);
    };

    void fetchAssignments();
  }, [user?.id]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Assignments</h1>
        <p className="text-muted-foreground mt-1">Track your class assignments and deadlines</p>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading assignments...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

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
          </Card>
        ))}
      </div>
    </div>
  );
}
