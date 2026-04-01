import { Plus, Upload, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import { BackButton } from "../../components/BackButton";

type Resource = {
  id: number;
  title: string;
  className: string;
  type: string;
  uploadedAt: string;
  url?: string;
};

type ClassItem = {
  id: number;
  name: string;
  subject: string;
};

export function TeacherResources() {
  const { user } = useUser();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    classId: "",
    type: "link",
    url: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchResources = async (resolvedTeacherId: number, classRows: ClassItem[]) => {
    const { data: rows, error: resourcesError } = await supabase
      .from("learning_resources")
      .select("id, title, class_id, resource_type, url, created_at")
      .eq("uploaded_by_teacher_id", resolvedTeacherId)
      .order("created_at", { ascending: false });

    if (resourcesError) {
      setError(resourcesError.message);
      setResources([]);
      return;
    }

    const mapped: Resource[] = (rows ?? []).map((row: any) => ({
      id: row.id,
      title: row.title,
      className:
        classRows.find((classRow) => classRow.id === row.class_id)?.name || "Unknown Class",
      type: row.resource_type,
      uploadedAt: row.created_at,
      url: row.url,
    }));

    setResources(mapped);
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

      const normalized = (classRows ?? []) as ClassItem[];
      setClasses(normalized);
      await fetchResources(teacher.id, normalized);
      setLoading(false);
    };

    void bootstrap();
  }, [user?.id]);

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!teacherId) {
      setError("Teacher profile missing.");
      return;
    }

    const requiresFile = ["pdf", "ppt", "document"].includes(formData.type);
    const requiresUrl = ["link", "video", "slide"].includes(formData.type);

    if (requiresFile && !selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    if (requiresUrl && !formData.url.trim()) {
      setError("Resource URL is required for links, videos, and slide decks.");
      return;
    }

    setSaving(true);

    let resolvedUrl = formData.url.trim() || null;

    if (requiresFile && selectedFile) {
      const fileExt = selectedFile.name.split(".").pop() || "file";
      const safeTitle = formData.title.trim().replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
      const filePath = `teacher-${teacherId}/${Date.now()}-${safeTitle}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("learning-resources")
        .upload(filePath, selectedFile, { upsert: false });

      if (uploadError) {
        setSaving(false);
        setError("File upload failed. Ensure Supabase storage bucket 'learning-resources' exists and is public.");
        return;
      }

      const { data: publicData } = supabase.storage
        .from("learning-resources")
        .getPublicUrl(filePath);

      resolvedUrl = publicData.publicUrl;
    }

    const { error: createError } = await supabase.from("learning_resources").insert({
      class_id: Number(formData.classId),
      uploaded_by_teacher_id: teacherId,
      title: formData.title.trim(),
      resource_type: formData.type,
      url: resolvedUrl,
      description: formData.description.trim() || null,
    });

    setSaving(false);

    if (createError) {
      setError(createError.message);
      return;
    }

    await fetchResources(teacherId, classes);
    setSuccess("Resource uploaded successfully.");
    setFormData({ title: "", classId: "", type: "link", url: "", description: "" });
    setSelectedFile(null);
    setShowUploadForm(false);
  };

  const handleDeleteResource = async (resourceId: number) => {
    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase
      .from("learning_resources")
      .delete()
      .eq("id", resourceId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (teacherId) {
      await fetchResources(teacherId, classes);
    }
    setSuccess("Resource deleted.");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-4">
        <BackButton fallbackPath="/teacher" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Resources</h1>
          <p className="text-muted-foreground">
            Share study materials with your students
          </p>
        </div>
        <button
          onClick={() => setShowUploadForm(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Upload Resource
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Upload Resource</h2>
          <form onSubmit={handleCreateResource}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Resource title"
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
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Resource Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="link">Link</option>
                  <option value="notes">Notes</option>
                  <option value="slide">Slide Deck</option>
                  <option value="video">Video</option>
                  <option value="pdf">PDF Document</option>
                  <option value="ppt">PPT Presentation</option>
                  <option value="document">Document (DOC/DOCX)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Resource URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  disabled={["pdf", "ppt", "document"].includes(formData.type)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {["pdf", "ppt", "document"].includes(formData.type) && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Upload File
                </label>
                <input
                  type="file"
                  accept={
                    formData.type === "pdf"
                      ? ".pdf"
                      : formData.type === "ppt"
                        ? ".ppt,.pptx"
                        : ".doc,.docx,.txt"
                  }
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add context for students"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {saving ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <p className="text-sm text-muted-foreground mb-4">Loading resources...</p>}
      {error && <p className="text-sm text-destructive mb-4">{error}</p>}
      {success && <p className="text-sm text-green-600 mb-4">{success}</p>}

      {/* Resources List */}
      {resources.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground mb-4">
            No resources uploaded yet
          </p>
          <button
            onClick={() => setShowUploadForm(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Upload First Resource
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {resource.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {resource.className} • {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)} • {new Date(resource.uploadedAt).toLocaleDateString("en-IN")}
                </p>
                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Open Resource
                  </a>
                )}
              </div>
              <button
                onClick={() => handleDeleteResource(resource.id)}
                className="p-2 rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
