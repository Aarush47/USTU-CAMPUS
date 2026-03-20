import { Card } from "./ui/card";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { useSupabaseTable } from "../hooks/useSupabaseTable";

type TimetableSlot = {
  id?: number;
  day: string;
  time: string;
  subject: string;
  room: string;
  professor: string;
  type: string;
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "Lecture": return "bg-blue-500";
    case "Lab": return "bg-purple-500";
    case "Tutorial": return "bg-emerald-500";
    case "Break": return "bg-gray-400";
    case "Project": return "bg-amber-500";
    case "Seminar": return "bg-pink-500";
    case "Activity": return "bg-cyan-500";
    default: return "bg-primary";
  }
};

export function Timetable() {
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const { data: slots, loading } = useSupabaseTable<TimetableSlot>(["timetable", "classes"], {
    fallbackData: [],
    orderBy: { column: "time", ascending: true },
  });
  const days = Array.from(new Set(slots.map((slot) => slot.day))).filter(Boolean);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Class Timetable</h1>
        <p className="text-muted-foreground mt-1">Your weekly schedule for Semester 6 - Computer Science</p>
      </div>

      {/* Legend */}
      <Card className="p-4 border border-border">
        <p className="text-sm font-medium text-foreground mb-3">Class Types:</p>
        <div className="flex flex-wrap gap-3">
          {["Lecture", "Lab", "Tutorial", "Project", "Seminar", "Activity"].map((type) => (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${getTypeColor(type)}`} />
              <span className="text-sm text-muted-foreground">{type}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Timetable */}
      <div className="space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Loading timetable from Supabase...</p>}
        {days.length === 0 && !loading && (
          <Card className="p-6 border border-border">
            <p className="text-sm text-muted-foreground">No timetable records found in database.</p>
          </Card>
        )}
        {days.map((day) => (
          <Card 
            key={day} 
            className={`p-6 border transition-all ${
              day === currentDay 
                ? "border-primary bg-accent/30" 
                : "border-border"
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">{day}</h2>
              {day === currentDay && (
                <span className="ml-auto px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm">
                  Today
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {slots.filter((slot) => slot.day === day).map((slot, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border border-border ${
                    slot.type === "Break" 
                      ? "bg-muted/50" 
                      : "bg-card hover:border-primary transition-colors"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-1 h-full rounded ${getTypeColor(slot.type)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{slot.time}</span>
                      </div>
                      <h4 className="font-medium text-foreground mb-2">{slot.subject}</h4>
                      {slot.type !== "Break" && (
                        <>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{slot.room}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{slot.professor}</span>
                          </div>
                        </>
                      )}
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs text-white ${getTypeColor(slot.type)}`}>
                        {slot.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
