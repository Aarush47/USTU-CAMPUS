import { useMemo, useState } from "react";
import { useSupabaseTable } from "../../hooks/useSupabaseTable";
import { BackButton } from "../../components/BackButton";

type AuditLogRow = {
  id: number;
  action: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
  actor_user_id: number;
  target_user_id: number | null;
};

type UserRow = {
  id: number;
  email: string;
  name: string | null;
};

const prettyAction = (action: string) =>
  action
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export function AdminAuditLogs() {
  const [searchText, setSearchText] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const { data: logs = [], loading: logsLoading } = useSupabaseTable<AuditLogRow>("admin_audit_logs", {
    fallbackData: [],
    orderBy: { column: "created_at", ascending: false },
    limit: 200,
  });

  const { data: users = [] } = useSupabaseTable<UserRow>("users", {
    fallbackData: [],
  });

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const actions = useMemo(
    () => Array.from(new Set(logs.map((log) => log.action))).sort(),
    [logs]
  );

  const filteredLogs = useMemo(() => {
    const needle = searchText.trim().toLowerCase();

    return logs.filter((log) => {
      if (actionFilter !== "all" && log.action !== actionFilter) {
        return false;
      }

      if (!needle) {
        return true;
      }

      const actor = userMap.get(log.actor_user_id);
      const target = log.target_user_id ? userMap.get(log.target_user_id) : null;

      const haystack = [
        log.action,
        actor?.email || "",
        actor?.name || "",
        target?.email || "",
        target?.name || "",
        JSON.stringify(log.metadata ?? {}),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [actionFilter, logs, searchText, userMap]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-4">
        <BackButton fallbackPath="/admin" />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Audit Logs</h1>
        <p className="text-muted-foreground">Track admin operations for role and account changes.</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search actor, target, action, metadata"
          className="px-4 py-2 bg-background border border-border rounded-lg text-foreground"
        />
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2 bg-background border border-border rounded-lg text-foreground"
        >
          <option value="all">All actions</option>
          {actions.map((action) => (
            <option key={action} value={action}>
              {prettyAction(action)}
            </option>
          ))}
        </select>
        <div className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground flex items-center">
          Showing {filteredLogs.length} / {logs.length} records
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        {logsLoading ? (
          <p className="text-sm text-muted-foreground">Loading audit logs...</p>
        ) : filteredLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No audit records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-sm font-semibold text-muted-foreground">When</th>
                  <th className="text-left py-3 text-sm font-semibold text-muted-foreground">Action</th>
                  <th className="text-left py-3 text-sm font-semibold text-muted-foreground">Actor</th>
                  <th className="text-left py-3 text-sm font-semibold text-muted-foreground">Target</th>
                  <th className="text-left py-3 text-sm font-semibold text-muted-foreground">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const actor = userMap.get(log.actor_user_id);
                  const target = log.target_user_id ? userMap.get(log.target_user_id) : null;
                  return (
                    <tr key={log.id} className="border-b border-border align-top">
                      <td className="py-3 text-sm text-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 text-sm text-foreground">{prettyAction(log.action)}</td>
                      <td className="py-3 text-sm text-foreground">{actor?.email || `ID ${log.actor_user_id}`}</td>
                      <td className="py-3 text-sm text-foreground">
                        {target?.email || (log.target_user_id ? `ID ${log.target_user_id}` : "-")}
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(log.metadata ?? {}, null, 2)}</pre>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
