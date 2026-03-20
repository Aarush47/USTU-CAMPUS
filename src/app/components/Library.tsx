import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { BookOpen, Search, Calendar, User, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useSupabaseTable } from "../hooks/useSupabaseTable";

type IssuedBook = {
  id: number;
  title: string;
  author: string;
  isbn: string;
  issueDate: string;
  dueDate: string;
  status: string;
  fine: number;
};

type AvailableBook = {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  copies: number;
  shelf: string;
};

export function Library() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: issuedBooks } = useSupabaseTable<IssuedBook>(["issued_books", "books_issued"], {
    fallbackData: [],
  });

  const { data: availableBooks } = useSupabaseTable<AvailableBook>(["available_books", "books"], {
    fallbackData: [],
  });

  const filteredBooks = availableBooks.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalFine = issuedBooks.reduce((sum, book) => sum + book.fine, 0);
  const overdueBooks = issuedBooks.filter((book) => book.status === "Overdue").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Library Management</h1>
        <p className="text-muted-foreground mt-1">Manage your issued books and browse the catalog</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Books Issued</p>
              <h3 className="text-2xl font-semibold text-foreground mt-2">{issuedBooks.length}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue Books</p>
              <h3 className="text-2xl font-semibold text-foreground mt-2">{overdueBooks}</h3>
            </div>
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Fine</p>
              <h3 className="text-2xl font-semibold text-foreground mt-2">₹{totalFine}</h3>
            </div>
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Books Limit</p>
              <h3 className="text-2xl font-semibold text-foreground mt-2">3 / 5</h3>
            </div>
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Issued Books */}
      <Card className="p-6 border border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">My Issued Books</h2>
        <div className="space-y-3">
          {issuedBooks.map((book) => {
            const daysLeft = Math.ceil(
              (new Date(book.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            
            return (
              <div
                key={book.id}
                className={`p-4 rounded-lg border ${
                  book.status === "Overdue"
                    ? "border-red-500 bg-red-50"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-16 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground">{book.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">by {book.author}</p>
                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>Issued: {new Date(book.issueDate).toLocaleDateString('en-IN')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>Due: {new Date(book.dueDate).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={book.status === "Overdue" ? "destructive" : "default"}
                      className={book.status === "Active" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                    >
                      {book.status}
                    </Badge>
                    {book.status === "Overdue" ? (
                      <span className="text-sm text-red-600 font-medium">Fine: ₹{book.fine}</span>
                    ) : (
                      <span className={`text-sm ${daysLeft <= 3 ? "text-amber-600" : "text-muted-foreground"}`}>
                        {daysLeft} days left
                      </span>
                    )}
                    <Button size="sm" variant="outline" className="mt-2">
                      Renew
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Available Books */}
      <Card className="p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Browse Available Books</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="p-4 border border-border hover:border-primary transition-colors">
              <div className="flex gap-4">
                <div className="w-12 h-16 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground line-clamp-2">{book.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">by {book.author}</p>
                  <div className="flex items-center justify-between mt-3">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-xs">
                      {book.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {book.copies} available
                    </span>
                  </div>
                  <Button size="sm" className="w-full mt-3">
                    Request Issue
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
