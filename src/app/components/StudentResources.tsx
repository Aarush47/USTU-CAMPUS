import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Link2, FolderOpen } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../lib/supabase";

type ResourceRow = {
  id: number;
  title: string;
  description: string | null;
  resource_type: string;
  url: string | null;
  created_at: string;
  classes?: {
    name?: string;
    subject?: string;
  } | null;
};

export function StudentResources() {
  const { user } = useUser();
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResources = async () => {
      if (!user?.id) return;

      setLoading(true);
      setError("");

      const { data: studentRow, error: studentError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", user.id)
        .maybeSingle();

      if (studentError || !studentRow?.id) {
        setError("Could not load your student profile.");
        setLoading(false);
        return;
      }

      const { data: enrollments, error: enrollmentError } = await supabase
        .from("class_enrollments")
        .select("class_id")
        .eq("student_user_id", studentRow.id);

      if (enrollmentError) {
        setError(enrollmentError.message);
        setLoading(false);
        return;
      }

      const classIds = (enrollments ?? []).map((row: any) => row.class_id);

      if (classIds.length === 0) {
        setResources([]);
        setLoading(false);
        return;
      }

      const { data: resourceRows, error: resourcesError } = await supabase
        .from("learning_resources")
        .select("id, title, description, resource_type, url, created_at, classes(name, subject)")
        .in("class_id", classIds)
        .order("created_at", { ascending: false });

      if (resourcesError) {
        setError(resourcesError.message);
        setLoading(false);
        return;
      }

      setResources((resourceRows ?? []) as ResourceRow[]);
      setLoading(false);
    };

    void fetchResources();
  }, [user?.id]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Class Resources</h1>
        <p className="text-muted-foreground mt-1">Study materials shared by your teachers</p>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading resources...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && resources.length === 0 && (
        <Card className="p-10 text-center">
          <FolderOpen className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-60" />
          <p className="text-muted-foreground">No resources available for your enrolled classes.</p>
        </Card>
      )}

      <div className="space-y-4">
        {resources.map((resource) => (
          <Card key={resource.id} className="p-5 border border-border">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{resource.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {(resource.classes?.name || "Class") + " - " + (resource.classes?.subject || "Subject")}
                </p>
                {resource.description && (
                  <p className="text-sm text-foreground mt-2">{resource.description}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {resource.resource_type} • {new Date(resource.created_at).toLocaleDateString("en-IN")}
                </p>
                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-2"
                  >
                    <Link2 className="w-4 h-4" />
                    Open Resource
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
