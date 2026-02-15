import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Bell, Search, Pin, Calendar, User, FileText } from "lucide-react";
import { Badge } from "./ui/badge";

const notices = [
  {
    id: 1,
    title: "Mid-Semester Examination Schedule Released",
    content: "The mid-semester examination schedule for all courses has been released. Please check your timetable and prepare accordingly. Exams will begin from March 1st, 2026.",
    date: "2026-02-14",
    category: "Examinations",
    author: "Examination Cell",
    pinned: true,
    urgent: true,
  },
  {
    id: 2,
    title: "Workshop on Machine Learning - Registration Open",
    content: "A 3-day workshop on Advanced Machine Learning techniques will be conducted from Feb 20-22. Interested students can register through the student portal. Limited seats available.",
    date: "2026-02-13",
    category: "Events",
    author: "CSE Department",
    pinned: true,
    urgent: false,
  },
  {
    id: 3,
    title: "Library Timing Extended During Exams",
    content: "The central library will remain open till 11:00 PM during the examination period. Students can avail this facility for their preparation.",
    date: "2026-02-12",
    category: "Facilities",
    author: "Library Administration",
    pinned: false,
    urgent: false,
  },
  {
    id: 4,
    title: "Final Year Project Submission Deadline",
    content: "All final year students must submit their project reports by February 28th, 2026. Late submissions will not be accepted without prior approval.",
    date: "2026-02-10",
    category: "Academics",
    author: "Academic Section",
    pinned: false,
    urgent: true,
  },
  {
    id: 5,
    title: "Annual Sports Day - February 25th",
    content: "The annual sports day will be held on February 25th, 2026. Students interested in participating should register with the sports coordinator by February 18th.",
    date: "2026-02-09",
    category: "Events",
    author: "Sports Committee",
    pinned: false,
    urgent: false,
  },
  {
    id: 6,
    title: "Hostel Fee Payment Reminder",
    content: "Students residing in hostels are reminded to clear their pending dues by February 20th to avoid late fees.",
    date: "2026-02-08",
    category: "Administrative",
    author: "Hostel Administration",
    pinned: false,
    urgent: false,
  },
  {
    id: 7,
    title: "Guest Lecture on Cloud Computing",
    content: "A guest lecture by industry expert Mr. Rahul Mehta on 'Future of Cloud Computing' will be conducted on February 22nd at 3:00 PM in Auditorium A.",
    date: "2026-02-07",
    category: "Events",
    author: "CSE Department",
    pinned: false,
    urgent: false,
  },
  {
    id: 8,
    title: "Scholarship Application Deadline",
    content: "Last date to apply for merit-based scholarships for the next semester is February 28th. Apply through the scholarship portal.",
    date: "2026-02-06",
    category: "Academics",
    author: "Scholarship Cell",
    pinned: false,
    urgent: true,
  },
];

const categories = ["All", "Examinations", "Events", "Academics", "Facilities", "Administrative"];

export function NoticeBoard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

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
