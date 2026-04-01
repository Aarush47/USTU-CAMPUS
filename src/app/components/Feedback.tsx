import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { MessageSquare, Star, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useUser } from "@clerk/clerk-react";

type SubjectItem = {
  id: number;
  name: string;
  subject: string;
  teacher_name: string;
  submitted?: boolean;
};

const FEEDBACK_CATEGORIES = [
  "Course Content",
  "Teaching Quality",
  "Pace & Difficulty",
  "Course Materials",
  "Overall Experience",
];

export function Feedback() {
  const { user } = useUser();
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [comment, setComment] = useState("");
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [submittedFeedback, setSubmittedFeedback] = useState<number[]>([]);

  useEffect(() => {
    const loadSubjects = async () => {
      if (!isSupabaseConfigured || !user?.id) {
        setSubjectsLoading(false);
        return;
      }

      try {
        // Get student's enrolled classes with teacher names
        const { data: enrolledClasses, error } = await supabase
          .from("class_enrollments")
          .select("class_id, classes(id, name, subject, teacher_id, users(id, name))")
          .eq("student_user_id", (await supabase.auth.getUser()).data.user?.id);

        if (error) throw error;

        const classesWithTeachers = enrolledClasses?.map((enrollment: any) => ({
          id: enrollment.classes.id,
          name: enrollment.classes.name,
          subject: enrollment.classes.subject,
          teacher_name: enrollment.classes.users?.name || "Unknown",
        })) || [];

        setSubjects(classesWithTeachers);

        // Load previously submitted feedback
        const { data: submitted } = await supabase
          .from("feedback_submissions")
          .select("class_id")
          .eq("student_user_id", (await supabase.auth.getUser()).data.user?.id);

        setSubmittedFeedback(submitted?.map((f: any) => f.class_id) || []);
      } catch {
        console.error("Failed to load subjects");
      } finally {
        setSubjectsLoading(false);
      }
    };

    loadSubjects();
  }, [user]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) ?? subjects[0];

  const handleRating = (category: string, rating: number) => {
    setRatings({ ...ratings, [category]: rating });
  };

  const handleSubmit = async () => {
    if (!selectedSubject) {
      toast.error("No subject selected");
      return;
    }

    // Check if all categories are rated
    const allRated = FEEDBACK_CATEGORIES.every((cat) => ratings[cat] !== undefined);

    if (!allRated) {
      toast.error("Please rate all categories before submitting");
      return;
    }

    if (!isSupabaseConfigured) {
      toast.error("Supabase is not configured");
      return;
    }

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        toast.error("Not authenticated");
        return;
      }

      const { error } = await supabase.from("feedback_submissions").insert({
        class_id: selectedSubject.id,
        student_user_id: authUser.id,
        ratings: JSON.stringify(ratings),
        comment,
        created_at: new Date().toISOString(),
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("You have already submitted feedback for this course");
        } else {
          toast.error("Failed to submit feedback");
        }
        return;
      }

      toast.success("Feedback submitted successfully!");
      setRatings({});
      setComment("");
      setSubmittedFeedback([...submittedFeedback, selectedSubject.id]);
    } catch {
      toast.error("Failed to submit feedback");
    }
  };

  const averageRating =
    Object.values(ratings).length > 0
      ? Object.values(ratings).reduce((sum, val) => sum + val, 0) / Object.values(ratings).length
      : 0;

  const submittedCount = submittedFeedback.length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Course Feedback</h1>
        <p className="text-muted-foreground mt-1">Share your feedback to help improve the learning experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Subjects</p>
              <h3 className="text-2xl font-semibold text-foreground mt-2">{subjects.length}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Feedback Submitted</p>
              <h3 className="text-2xl font-semibold text-foreground mt-2">{submittedCount}</h3>
            </div>
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Feedback</p>
              <h3 className="text-2xl font-semibold text-foreground mt-2">{Math.max(subjects.length - submittedCount, 0)}</h3>
            </div>
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 border border-border lg:col-span-1">
          <h2 className="text-lg font-semibold text-foreground mb-4">Select Subject</h2>
          {subjectsLoading && <p className="text-sm text-muted-foreground mb-3">Loading your courses...</p>}
          <div className="space-y-2">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                disabled={submittedFeedback.includes(subject.id)}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  selectedSubject?.id === subject.id
                    ? "border-primary bg-accent"
                    : "border-border bg-card hover:border-primary hover:bg-secondary"
                } ${submittedFeedback.includes(subject.id) ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{subject.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{subject.teacher_name}</p>
                  </div>
                  {submittedFeedback.includes(subject.id) && (
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 ml-2" />
                  )}
                </div>
              </button>
            ))}
            {subjects.length === 0 && !subjectsLoading && (
              <p className="text-sm text-muted-foreground">No enrolled courses found.</p>
            )}
          </div>
        </Card>

        <Card className="p-6 border border-border lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">{selectedSubject?.name ?? "Select a course"}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Course: {selectedSubject?.subject ?? "-"} | Teacher: {selectedSubject?.teacher_name ?? "-"}
            </p>
          </div>

          {selectedSubject && !submittedFeedback.includes(selectedSubject.id) ? (
            <div className="space-y-6">
              {FEEDBACK_CATEGORIES.map((category) => (
                <div key={category}>
                  <label className="block text-sm font-medium text-foreground mb-3">{category}</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleRating(category, rating)}
                        className={`flex-1 p-3 rounded-lg border transition-all ${
                          ratings[category] === rating
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card hover:border-primary hover:bg-secondary"
                        }`}
                      >
                        <Star
                          className={`w-6 h-6 mx-auto ${ratings[category] === rating ? "fill-current" : ""}`}
                        />
                        <span className="text-xs mt-1 block">{rating}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {averageRating > 0 && (
                <div className="p-4 bg-accent rounded-lg border border-primary">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary fill-current" />
                    <span className="font-medium text-foreground">Average Rating: {averageRating.toFixed(1)} / 5</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Additional Comments (Optional)</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about the course, teaching style, or suggestions for improvement..."
                  className="min-h-32 bg-background border-border"
                />
              </div>

              <Button onClick={handleSubmit} className="w-full" size="lg">
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </Button>
            </div>
          ) : submittedFeedback.includes(selectedSubject?.id || 0) ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Feedback Submitted</h3>
              <p className="text-muted-foreground mt-2">Thank you for your feedback on this course.</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No course selected.</p>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6 border border-border bg-accent/30">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Why Your Feedback Matters</h3>
            <p className="text-sm text-muted-foreground">
              Your honest feedback helps us improve the quality of education. It enables professors to understand
              student perspectives and improve course delivery. Feedback is stored in the database and can be audited.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
