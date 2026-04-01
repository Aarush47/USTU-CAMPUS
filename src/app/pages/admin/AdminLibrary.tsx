import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import { BackButton } from "../../components/BackButton";
import { Upload, Trash2 } from "lucide-react";

type LibraryBook = {
  id: number;
  title: string;
  author: string;
  category: string;
  pdf_url: string;
  uploaded_by_name: string;
  created_at: string;
};

export function AdminLibrary() {
  const { user } = useUser();
  const [adminId, setAdminId] = useState<number | null>(null);
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "General",
    description: "",
  });

  const fetchBooks = async () => {
    const { data, error: fetchError } = await supabase
      .from("library_books")
      .select("id, title, author, category, pdf_url, uploaded_by_name, created_at")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setBooks([]);
      return;
    }

    setBooks((data ?? []) as LibraryBook[]);
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data: admin, error: adminError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", user.id)
        .maybeSingle();

      if (adminError || !admin?.id) {
        setError("Could not load admin profile.");
        setLoading(false);
        return;
      }

      setAdminId(admin.id);
      await fetchBooks();
      setLoading(false);
    };

    void bootstrap();
  }, [user?.id]);

  const handleUploadBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!adminId) {
      setError("Admin profile not found.");
      return;
    }

    if (!selectedFile) {
      setError("Please choose a PDF file.");
      return;
    }

    setSaving(true);

    const safeTitle = form.title.trim().replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
    const filePath = `admin-${adminId}/${Date.now()}-${safeTitle}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("library-books")
      .upload(filePath, selectedFile, { upsert: false, contentType: "application/pdf" });

    if (uploadError) {
      setSaving(false);
      setError("PDF upload failed. Ensure storage bucket 'library-books' exists and is public.");
      return;
    }

    const { data: publicData } = supabase.storage.from("library-books").getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("library_books").insert({
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category,
      description: form.description.trim() || null,
      pdf_url: publicData.publicUrl,
      uploaded_by_user_id: adminId,
      uploaded_by_role: "admin",
      uploaded_by_name: user?.fullName || "Admin",
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    await fetchBooks();
    setSuccess("Book PDF uploaded successfully.");
    setForm({ title: "", author: "", category: "General", description: "" });
    setSelectedFile(null);
  };

  const handleDeleteBook = async (id: number) => {
    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase.from("library_books").delete().eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await fetchBooks();
    setSuccess("Book removed from library.");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-4">
        <BackButton fallbackPath="/admin" />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Campus Library PDFs</h1>
        <p className="text-muted-foreground">Upload and manage digital books for students</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Upload Book PDF</h2>
        <form onSubmit={handleUploadBook} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Book title"
            className="px-4 py-2 bg-background border border-border rounded-lg"
            required
          />
          <input
            type="text"
            value={form.author}
            onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
            placeholder="Author"
            className="px-4 py-2 bg-background border border-border rounded-lg"
            required
          />
          <select
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            className="px-4 py-2 bg-background border border-border rounded-lg"
          >
            <option value="General">General</option>
            <option value="Science">Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Engineering">Engineering</option>
            <option value="Literature">Literature</option>
          </select>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="px-4 py-2 bg-background border border-border rounded-lg"
            required
          />
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Short description"
            className="md:col-span-2 px-4 py-2 bg-background border border-border rounded-lg resize-none"
          />
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Upload className="w-4 h-4" />
            {saving ? "Uploading..." : "Upload PDF"}
          </button>
        </form>
      </div>

      {loading && <p className="text-sm text-muted-foreground mb-4">Loading books...</p>}
      {error && <p className="text-sm text-destructive mb-4">{error}</p>}
      {success && <p className="text-sm text-green-600 mb-4">{success}</p>}

      <div className="space-y-3">
        {books.map((book) => (
          <div key={book.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-foreground">{book.title}</p>
              <p className="text-sm text-muted-foreground">
                {book.author} • {book.category} • Uploaded by {book.uploaded_by_name}
              </p>
              <a href={book.pdf_url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                Read PDF
              </a>
            </div>
            <button
              type="button"
              onClick={() => handleDeleteBook(book.id)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
