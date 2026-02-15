import { useState } from "react";
import { Card } from "./ui/card";
import { Calendar } from "./ui/calendar";
import { Badge } from "./ui/badge";
import { Calendar as CalendarIcon, Clock, MapPin, Users, Bell } from "lucide-react";

const events = [
  {
    id: 1,
    title: "Mid-Semester Examination",
    date: new Date(2026, 2, 1),
    time: "9:00 AM - 12:00 PM",
    location: "Examination Hall A",
    type: "exam",
    description: "Data Structures Mid-Sem Exam",
  },
  {
    id: 2,
    title: "Machine Learning Workshop",
    date: new Date(2026, 1, 20),
    time: "2:00 PM - 5:00 PM",
    location: "Seminar Hall",
    type: "event",
    description: "Advanced ML techniques workshop",
  },
  {
    id: 3,
    title: "Project Presentation",
    date: new Date(2026, 1, 22),
    time: "10:00 AM - 1:00 PM",
    location: "Lab 3",
    type: "assignment",
    description: "Mini Project final presentation",
  },
  {
    id: 4,
    title: "Sports Day",
    date: new Date(2026, 1, 25),
    time: "9:00 AM - 5:00 PM",
    location: "Sports Ground",
    type: "event",
    description: "Annual college sports event",
  },
  {
    id: 5,
    title: "Project Submission Deadline",
    date: new Date(2026, 1, 28),
    time: "11:59 PM",
    location: "Online Portal",
    type: "assignment",
    description: "Final year project report submission",
  },
  {
    id: 6,
    title: "Guest Lecture - Cloud Computing",
    date: new Date(2026, 1, 22),
    time: "3:00 PM - 4:30 PM",
    location: "Auditorium A",
    type: "event",
    description: "Industry expert talk on cloud technologies",
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case "exam":
      return "bg-red-500 text-white";
    case "event":
      return "bg-blue-500 text-white";
    case "assignment":
      return "bg-amber-500 text-white";
    case "holiday":
      return "bg-emerald-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

export function CalendarView() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const selectedDateEvents = events.filter(
    (event) =>
      date &&
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
  );

  const upcomingEvents = events
    .filter((event) => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const eventDates = events.map((event) => event.date);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Academic Calendar</h1>
        <p className="text-muted-foreground mt-1">View your schedule, exams, and important events</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Events</p>
              <h3 className="text-2xl font-semibold text-foreground mt-2">{events.length}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Upcoming Exams</p>
              <h3 className="text-2xl font-semibold text-foreground mt-2">
                {events.filter((e) => e.type === "exam" && e.date >= new Date()).length}
              </h3>
            </div>
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Assignments Due</p>
              <h3 className="text-2xl font-semibold text-foreground mt-2">
                {events.filter((e) => e.type === "assignment" && e.date >= new Date()).length}
              </h3>
            </div>
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Events This Month</p>
              <h3 className="text-2xl font-semibold text-foreground mt-2">
                {
                  events.filter(
                    (e) => e.date.getMonth() === new Date().getMonth() && e.type === "event"
                  ).length
                }
              </h3>
            </div>
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="p-6 border border-border lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground mb-4">Calendar</h2>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-lg border border-border"
              modifiers={{
                event: eventDates,
              }}
              modifiersStyles={{
                event: {
                  fontWeight: "bold",
                  color: "#2563EB",
                },
              }}
            />
          </div>

          {/* Selected Date Events */}
          {selectedDateEvents.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-foreground">
                Events on {date?.toLocaleDateString("en-IN", { month: "long", day: "numeric" })}
              </h3>
              {selectedDateEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 bg-secondary rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{event.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getTypeColor(event.type)}>{event.type}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Events */}
        <Card className="p-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {upcomingEvents.map((event) => {
              const daysUntil = Math.ceil(
                (event.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={event.id}
                  className="p-4 bg-secondary rounded-lg border border-border hover:border-primary transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-xs text-primary font-medium">
                        {event.date.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-lg font-semibold text-primary">
                        {event.date.getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground line-clamp-1">{event.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`${getTypeColor(event.type)} text-xs`}>{event.type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {daysUntil === 0 ? "Today" : `in ${daysUntil} day${daysUntil > 1 ? "s" : ""}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Legend */}
      <Card className="p-4 border border-border">
        <p className="text-sm font-medium text-foreground mb-3">Event Types:</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-sm text-muted-foreground">Examinations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-sm text-muted-foreground">Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span className="text-sm text-muted-foreground">Assignments</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-sm text-muted-foreground">Holidays</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
