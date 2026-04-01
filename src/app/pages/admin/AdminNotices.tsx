import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import { BackButton } from "../../components/BackButton";
import { Plus, Trash2 } from "lucide-react";

type NoticeRow = {
  id: number;
  title: string;
  content: string;
  category: string;
  date: string;
  author: string;
  pinned: boolean;
  urgent: boolean;
};

export function AdminNotices() {
  const { user } = useUser();
  const [adminName, setAdminName] = useState("Admin");
  const [adminUserId, setAdminUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notices, setNotices] = useState<NoticeRow[]>([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "Administrative",
    pinned: true,
    urgent: false,
  });

  const fetchNotices = async () => {
    const { data, error: fetchError } = await supabase
      .from("notices")
      .select("id, title, content, category, date, author, pinned, urgent")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setNotices([]);
      return;
    }

    setNotices((data ?? []) as NoticeRow[]);
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      const normalizedEmail = (user.primaryEmailAddress?.emailAddress || "").trim().toLowerCase();

      const { data: actor, error: actorError } = await supabase
        .from("users")
        .select("id, name")
        .or(`clerk_user_id.eq.${user.id},email.ilike.${normalizedEmail}`)
        .limit(1)
        .maybeSingle();

      if (actorError || !actor?.id) {
        setError("Could not resolve your admin account.");
        setLoading(false);
        return;
      }

      setAdminUserId(actor.id);
      setAdminName(actor.name || user.fullName || "Admin");

      await fetchNotices();
      setLoading(false);
    };

    void bootstrap();
  }, [user?.id]);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!adminUserId) {
      setError("Admin profile not found.");
      return;
    }

    setSaving(true);

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category,
      date: new Date().toISOString().slice(0, 10),
      author: adminName,
      pinned: form.pinned,
      urgent: form.urgent,
      posted_by_user_id: adminUserId,
      posted_by_role: "admin",
      posted_by_name: adminName,
    };

    const { error: insertError } = await supabase.from("notices").insert(payload);

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    await fetchNotices();
    setSuccess("Notice posted successfully.");
    setForm({ title: "", content: "", category: "Administrative", pinned: true, urgent: false });
  };

  const handleDeleteNotice = async (id: number) => {
    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase.from("notices").delete().eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await fetchNotices();
    setSuccess("Notice deleted.");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-4">
        <BackButton fallbackPath="/admin" />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Campus Notices</h1>
        <p className="text-muted-foreground">Publish official updates visible to all students</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Create Notice</h2>
        <form onSubmit={handleCreateNotice} className="space-y-4">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Notice title"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
            required
          />
          <textarea
            rows={4}
            value={form.content}
            onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
            placeholder="Write your notice"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground resize-none"
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              className="px-4 py-2 bg-background border border-border rounded-lg text-foreground"
            >
              <option value="Administrative">Administrative</option>
              <option value="Academics">Academics</option>
              <option value="Events">Events</option>
              <option value="Examinations">Examinations</option>
              <option value="Facilities">Facilities</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(e) => setForm((prev) => ({ ...prev, pinned: e.target.checked }))}
              />
              Pin this notice
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.urgent}
                onChange={(e) => setForm((prev) => ({ ...prev, urgent: e.target.checked }))}
              />
              Mark as urgent
            </label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            {saving ? "Posting..." : "Post Notice"}
          </button>
        </form>
      </div>

      {loading && <p className="text-sm text-muted-foreground mb-4">Loading notices...</p>}
      {error && <p className="text-sm text-destructive mb-4">{error}</p>}
      {success && <p className="text-sm text-green-600 mb-4">{success}</p>}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-accent border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {notices.map((notice) => (
              <tr key={notice.id} className="border-b border-border">
                <td className="px-6 py-3 text-sm text-foreground">
                  <div className="font-medium">{notice.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{notice.content}</div>
                </td>
                <td className="px-6 py-3 text-sm text-foreground">{notice.category}</td>
                <td className="px-6 py-3 text-sm text-foreground">{new Date(notice.date).toLocaleDateString("en-IN")}</td>
                <td className="px-6 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleDeleteNotice(notice.id)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
