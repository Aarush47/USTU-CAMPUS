import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { BookOpen, Search, ExternalLink } from "lucide-react";
import { supabase } from "../lib/supabase";

type LibraryBook = {
  id: number;
  title: string;
  author: string;
  category: string;
  description: string | null;
  pdf_url: string;
  uploaded_by_name: string;
  created_at: string;
};

export function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("library_books")
        .select("id, title, author, category, description, pdf_url, uploaded_by_name, created_at")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setBooks([]);
        setLoading(false);
        return;
      }

      const normalized = (data ?? []) as LibraryBook[];
      setBooks(normalized);
      setSelectedBook(normalized[0] ?? null);
      setLoading(false);
    };

    void fetchBooks();
  }, []);

  const filteredBooks = useMemo(
    () =>
      books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.category.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [books, searchQuery]
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Digital Library</h1>
        <p className="text-muted-foreground mt-1">Read book PDFs uploaded by teachers and administration</p>
      </div>

      <Card className="p-4 border border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, or category"
            className="pl-10"
          />
        </div>
      </Card>

      {loading && <p className="text-sm text-muted-foreground">Loading library books...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && filteredBooks.length === 0 && (
        <Card className="p-10 text-center border border-border">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No library books found.</p>
        </Card>
      )}

      {!loading && !error && filteredBooks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {filteredBooks.map((book) => (
              <button
                key={book.id}
                type="button"
                onClick={() => setSelectedBook(book)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedBook?.id === book.id
                    ? "border-primary bg-accent/30"
                    : "border-border bg-card hover:border-primary"
                }`}
              >
                <p className="font-semibold text-foreground">{book.title}</p>
                <p className="text-sm text-muted-foreground">{book.author}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {book.category} • {new Date(book.created_at).toLocaleDateString("en-IN")}
                </p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selectedBook && (
              <Card className="p-4 border border-border">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{selectedBook.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedBook.author} • {selectedBook.category} • Uploaded by {selectedBook.uploaded_by_name}
                    </p>
                    {selectedBook.description && (
                      <p className="text-sm text-foreground mt-2">{selectedBook.description}</p>
                    )}
                  </div>
                  <a
                    href={selectedBook.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in new tab
                  </a>
                </div>
                <iframe
                  title={selectedBook.title}
                  src={selectedBook.pdf_url}
                  className="w-full h-[70vh] rounded-lg border border-border"
                />
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
