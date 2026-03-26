import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Users, BookOpen } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { createClient } from "@supabase/supabase-js";
import { BackButton } from "../../components/BackButton";

type Class = {
  id: number;
  teacher_id: number;
  name: string;
  subject: string;
  students: number;
};

export function TeacherClasses() {
  const { user } = useUser();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", subject: "" });
  const [classes, setClasses] = useState<Class[]>([]);
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const fetchClasses = async (resolvedTeacherId: number) => {
    const { data, error: fetchError } = await supabase
      .from("classes")
      .select("id, teacher_id, name, subject")
      .eq("teacher_id", resolvedTeacherId)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setClasses([]);
      return;
    }

    const normalized: Class[] = (data || []).map((item) => ({
      ...item,
      students: 0,
    }));

    setClasses(normalized);
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data: teacherRow, error: teacherError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", user.id)
        .maybeSingle();

      if (teacherError || !teacherRow?.id) {
        setError("Could not load teacher profile");
        setLoading(false);
        return;
      }

      setTeacherId(teacherRow.id);
      await fetchClasses(teacherRow.id);
      setLoading(false);
    };

    void bootstrap();
  }, [user?.id]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!teacherId) {
      setError("Teacher profile not found");
      return;
    }

    setIsSaving(true);

    const { error: createError } = await supabase.from("classes").insert({
      teacher_id: teacherId,
      name: formData.name.trim(),
      subject: formData.subject.trim(),
    });

    setIsSaving(false);

    if (createError) {
      setError(createError.message);
      return;
    }

    await fetchClasses(teacherId);
    setSuccess("Class created successfully");
    setFormData({ name: "", subject: "" });
    setShowCreateForm(false);
  };

  const handleDeleteClass = async (id: number) => {
    if (!teacherId) return;
    if (!window.confirm("Delete this class?")) return;

    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase.from("classes").delete().eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await fetchClasses(teacherId);
    setSuccess("Class deleted successfully");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-4">
        <BackButton fallbackPath="/teacher" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">My Classes</h1>
          <p className="text-muted-foreground">
            Manage all your teaching classes here
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Class
        </button>
      </div>

      {/* Create Class Form */}
      {showCreateForm && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Create New Class</h2>
          <form onSubmit={handleCreateClass}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Class Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Grade 10 A"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="e.g., Mathematics"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>
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
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {isSaving ? "Creating..." : "Create Class"}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}
      {success && <p className="text-sm text-green-600 mb-4">{success}</p>}

      {/* Classes Grid */}
      {loading ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">Loading classes...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No classes yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first class to get started
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create First Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {cls.name}
              </h3>
              <p className="text-muted-foreground mb-4">{cls.subject}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Users className="w-4 h-4" />
                {cls.students || 0} students
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors text-sm">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClass(cls.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-colors text-sm"
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
