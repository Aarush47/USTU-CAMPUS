import { Card } from "./ui/card";
import { Calendar, Clock, MapPin, User } from "lucide-react";

const timetableData = {
  Monday: [
    { time: "9:00 - 10:00", subject: "Data Structures", room: "Room 301", professor: "Dr. Rajesh Kumar", type: "Lecture" },
    { time: "10:15 - 11:15", subject: "Database Management", room: "Lab 2", professor: "Prof. Priya Singh", type: "Lab" },
    { time: "11:30 - 12:30", subject: "Computer Networks", room: "Room 205", professor: "Dr. Amit Verma", type: "Lecture" },
    { time: "12:30 - 1:30", subject: "Lunch Break", room: "-", professor: "-", type: "Break" },
    { time: "1:30 - 2:30", subject: "Software Engineering", room: "Room 401", professor: "Prof. Sneha Patel", type: "Lecture" },
    { time: "2:45 - 3:45", subject: "Web Technologies", room: "Lab 3", professor: "Dr. Karan Shah", type: "Lab" },
  ],
  Tuesday: [
    { time: "9:00 - 10:00", subject: "Operating Systems", room: "Room 302", professor: "Dr. Meera Nair", type: "Lecture" },
    { time: "10:15 - 11:15", subject: "Computer Networks", room: "Lab 1", professor: "Dr. Amit Verma", type: "Lab" },
    { time: "11:30 - 12:30", subject: "Data Structures", room: "Room 301", professor: "Dr. Rajesh Kumar", type: "Tutorial" },
    { time: "12:30 - 1:30", subject: "Lunch Break", room: "-", professor: "-", type: "Break" },
    { time: "1:30 - 2:30", subject: "Database Management", room: "Room 203", professor: "Prof. Priya Singh", type: "Lecture" },
    { time: "2:45 - 3:45", subject: "Soft Skills", room: "Room 105", professor: "Ms. Anita Roy", type: "Lecture" },
  ],
  Wednesday: [
    { time: "9:00 - 10:00", subject: "Web Technologies", room: "Room 404", professor: "Dr. Karan Shah", type: "Lecture" },
    { time: "10:15 - 11:15", subject: "Software Engineering", room: "Room 401", professor: "Prof. Sneha Patel", type: "Tutorial" },
    { time: "11:30 - 12:30", subject: "Operating Systems", room: "Lab 2", professor: "Dr. Meera Nair", type: "Lab" },
    { time: "12:30 - 1:30", subject: "Lunch Break", room: "-", professor: "-", type: "Break" },
    { time: "1:30 - 2:30", subject: "Data Structures", room: "Room 301", professor: "Dr. Rajesh Kumar", type: "Lecture" },
    { time: "2:45 - 3:45", subject: "Computer Networks", room: "Room 205", professor: "Dr. Amit Verma", type: "Lecture" },
  ],
  Thursday: [
    { time: "9:00 - 10:00", subject: "Database Management", room: "Room 203", professor: "Prof. Priya Singh", type: "Lecture" },
    { time: "10:15 - 11:15", subject: "Data Structures", room: "Lab 1", professor: "Dr. Rajesh Kumar", type: "Lab" },
    { time: "11:30 - 12:30", subject: "Software Engineering", room: "Room 401", professor: "Prof. Sneha Patel", type: "Lecture" },
    { time: "12:30 - 1:30", subject: "Lunch Break", room: "-", professor: "-", type: "Break" },
    { time: "1:30 - 2:30", subject: "Web Technologies", room: "Room 404", professor: "Dr. Karan Shah", type: "Lecture" },
    { time: "2:45 - 3:45", subject: "Operating Systems", room: "Room 302", professor: "Dr. Meera Nair", type: "Tutorial" },
  ],
  Friday: [
    { time: "9:00 - 10:00", subject: "Computer Networks", room: "Room 205", professor: "Dr. Amit Verma", type: "Lecture" },
    { time: "10:15 - 11:15", subject: "Operating Systems", room: "Room 302", professor: "Dr. Meera Nair", type: "Lecture" },
    { time: "11:30 - 12:30", subject: "Database Management", room: "Lab 2", professor: "Prof. Priya Singh", type: "Lab" },
    { time: "12:30 - 1:30", subject: "Lunch Break", room: "-", professor: "-", type: "Break" },
    { time: "1:30 - 2:30", subject: "Mini Project", room: "Lab 3", professor: "All Faculty", type: "Project" },
    { time: "2:45 - 3:45", subject: "Mini Project", room: "Lab 3", professor: "All Faculty", type: "Project" },
  ],
  Saturday: [
    { time: "9:00 - 10:00", subject: "Seminar", room: "Auditorium A", professor: "Guest Speakers", type: "Seminar" },
    { time: "10:15 - 11:15", subject: "Sports/Activities", room: "Sports Ground", professor: "-", type: "Activity" },
    { time: "11:30 - 12:30", subject: "Club Activities", room: "Various Rooms", professor: "Club Coordinators", type: "Activity" },
  ],
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
              {timetableData[day as keyof typeof timetableData].map((slot, idx) => (
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
