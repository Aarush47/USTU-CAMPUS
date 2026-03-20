import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Bell, Search, Pin, Calendar, User, FileText } from "lucide-react";
import { Badge } from "./ui/badge";
import { useSupabaseTable } from "../hooks/useSupabaseTable";

type Notice = {
  id: number;
  title: string;
  content: string;
  date: string;
  category: string;
  author: string;
  pinned: boolean;
  urgent: boolean;
};

const categories = ["All", "Examinations", "Events", "Academics", "Facilities", "Administrative"];

export function NoticeBoard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { data: notices, loading } = useSupabaseTable<Notice>(["notices", "notice_board"], {
    fallbackData: [],
    orderBy: { column: "date", ascending: false },
  });

  const filteredNotices = notices
    .filter((notice) => {
      const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           notice.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || notice.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Notice Board</h1>
        <p className="text-muted-foreground mt-1">Stay updated with the latest announcements and notices</p>
      </div>

      {/* Search and Filter */}
      <Card className="p-4 border border-border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search notices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Notices List */}
      <div className="space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Loading notices from Supabase...</p>}
        {filteredNotices.length === 0 ? (
          <Card className="p-12 text-center border border-border">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No notices found</p>
          </Card>
        ) : (
          filteredNotices.map((notice) => (
            <Card
              key={notice.id}
              className={`p-6 border transition-all hover:shadow-md ${
                notice.pinned ? "border-primary bg-accent/30" : "border-border"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                  notice.urgent ? "bg-red-500" : "bg-primary"
                }`}>
                  <Bell className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {notice.pinned && (
                          <Pin className="w-4 h-4 text-primary" />
                        )}
                        <h3 className="text-lg font-semibold text-foreground">{notice.title}</h3>
                      </div>
                      <p className="text-muted-foreground mt-2">{notice.content}</p>
                    </div>
                    {notice.urgent && (
                      <Badge variant="destructive" className="flex-shrink-0">
                        Urgent
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(notice.date).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>{notice.author}</span>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                      {notice.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
