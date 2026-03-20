import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { UserCheck, QrCode, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import QRCode from "qrcode";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useSupabaseTable } from "../hooks/useSupabaseTable";

type SubjectAttendance = {
  subject: string;
  present: number;
  total: number;
  percentage: number;
};

type AttendanceRecord = {
  date: string;
  subject: string;
  status: string;
  time: string;
};

type StudentProfile = {
  name?: string;
  roll_no?: string;
};

export function Attendance() {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showQR, setShowQR] = useState(false);

  const { data: profiles } = useSupabaseTable<StudentProfile>(["student_profile", "profile", "students"], {
    fallbackData: [],
  });

  const { data: attendanceData } = useSupabaseTable<SubjectAttendance>([
    "attendance_by_subject",
    "attandance",
  ], {
    fallbackData: [],
  });

  const { data: recentAttendance } = useSupabaseTable<AttendanceRecord>([
    "attendance_records",
    "attandance",
  ], {
    fallbackData: [],
    orderBy: { column: "date", ascending: false },
    limit: 20,
  });

  const overallAttendance =
    ((attendanceData.reduce((sum, item) => sum + item.present, 0) /
      Math.max(attendanceData.reduce((sum, item) => sum + item.total, 0), 1)) *
      100);

  const generateQRCode = async () => {
    const studentProfile = profiles[0];
    const studentData = {
      studentId: studentProfile?.roll_no ?? "-",
      name: studentProfile?.name ?? "-",
      timestamp: new Date().toISOString(),
      location: "Room 301",
    };

    try {
      const url = await QRCode.toDataURL(JSON.stringify(studentData), {
        width: 300,
        margin: 2,
        color: {
          dark: "#2563EB",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(url);
      setShowQR(true);

      // Auto-hide after 30 seconds
      setTimeout(() => {
        setShowQR(false);
      }, 30000);
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Present":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "Absent":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "Late":
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Absent":
        return "bg-red-50 text-red-700 border-red-200";
      case "Late":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Attendance Management</h1>
        <p className="text-muted-foreground mt-1">Track and manage your class attendance</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Overall Attendance</p>
              <h3 className="text-3xl font-semibold text-foreground mt-2">
                {overallAttendance.toFixed(2)}%
              </h3>
              <Progress value={overallAttendance} className="mt-3" />
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Classes Attended</p>
              <h3 className="text-3xl font-semibold text-foreground mt-2">
                {attendanceData.reduce((sum, item) => sum + item.present, 0)}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                of {attendanceData.reduce((sum, item) => sum + item.total, 0)} total
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-primary bg-accent">
          <div className="flex flex-col items-center justify-center h-full">
            <QrCode className="w-12 h-12 text-primary mb-3" />
            <h3 className="font-semibold text-foreground mb-2">Quick Attendance</h3>
            <Button onClick={generateQRCode} className="w-full">
              Generate QR Code
            </Button>
          </div>
        </Card>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <Card className="p-8 border-2 border-primary bg-accent">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">Scan to Mark Attendance</h3>
            <p className="text-muted-foreground mb-6">Show this QR code to your professor</p>
            <div className="inline-block p-4 bg-white rounded-lg shadow-lg">
              {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />}
            </div>
            <div className="mt-6 space-y-2">
              <p className="text-sm text-muted-foreground">Student ID: {profiles[0]?.roll_no ?? "-"}</p>
              <p className="text-sm text-muted-foreground">Valid for: 30 seconds</p>
            </div>
            <Button onClick={() => setShowQR(false)} variant="outline" className="mt-4">
              Close
            </Button>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="subject" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 bg-secondary">
          <TabsTrigger value="subject">By Subject</TabsTrigger>
          <TabsTrigger value="recent">Recent Records</TabsTrigger>
        </TabsList>

        <TabsContent value="subject" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attendanceData.map((subject) => (
              <Card key={subject.subject} className="p-6 border border-border">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{subject.subject}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {subject.present} / {subject.total} classes
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-2xl font-semibold ${
                        subject.percentage >= 75 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {subject.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={subject.percentage}
                  className={subject.percentage >= 75 ? "[&>div]:bg-emerald-500" : "[&>div]:bg-red-500"}
                />
                {subject.percentage < 75 && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Below required 75% attendance
                  </p>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <Card className="p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Attendance Records</h2>
            <div className="space-y-3">
              {recentAttendance.map((record, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(record.status)}
                    <div>
                      <h4 className="font-medium text-foreground">{record.subject}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(record.date).toLocaleDateString("en-IN")}</span>
                        </div>
                        {record.time !== "-" && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{record.time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(record.status)}`}
                  >
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
