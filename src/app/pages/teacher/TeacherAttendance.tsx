import { useState } from "react";
import { Calendar, Check, X, Clock } from "lucide-react";

type AttendanceRecord = {
  studentId: number;
  name: string;
  status: "present" | "absent" | "late" | null;
};

export function TeacherAttendance() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedClass, setSelectedClass] = useState("");
  const [records, setRecords] = useState<AttendanceRecord[]>([
    // Placeholder
  ]);

  const updateAttendance = (
    studentId: number,
    status: "present" | "absent" | "late"
  ) => {
    setRecords(
      records.map((record) =>
        record.studentId === studentId ? { ...record, status } : record
      )
    );
  };

  const markAll = (status: "present" | "absent" | "late") => {
    setRecords(records.map((record) => ({ ...record, status })));
  };

  const handleSave = async () => {
    // TODO: Save to Supabase
    console.log("Saving attendance:", records);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Mark Attendance</h1>
        <p className="text-muted-foreground">
          Record attendance for your students
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Date
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">Choose a class...</option>
              {/* Classes will be populated from DB */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Quick Actions
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => markAll("present")}
                className="flex-1 px-3 py-2 bg-green-500/20 text-green-600 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium"
              >
                Mark All Present
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      {records.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Select a class to mark attendance
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                    Present
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                    Absent
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                    Late
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.studentId}
                    className="border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-3 text-foreground">{record.name}</td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => updateAttendance(record.studentId, "present")}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                          record.status === "present"
                            ? "bg-green-500 text-white"
                            : "bg-accent text-muted-foreground hover:bg-green-500/20"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => updateAttendance(record.studentId, "absent")}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                          record.status === "absent"
                            ? "bg-red-500 text-white"
                            : "bg-accent text-muted-foreground hover:bg-red-500/20"
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => updateAttendance(record.studentId, "late")}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                          record.status === "late"
                            ? "bg-yellow-500 text-white"
                            : "bg-accent text-muted-foreground hover:bg-yellow-500/20"
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Save Button */}
      {records.length > 0 && (
        <div className="flex justify-end gap-3">
          <button className="px-6 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Save Attendance
          </button>
        </div>
      )}
    </div>
  );
}
