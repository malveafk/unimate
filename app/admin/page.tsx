import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  if (!user || !adminEmails.includes((user.email ?? "").toLowerCase())) {
    redirect("/");
  }

  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email, created_at")
    .order("created_at", { ascending: false });

  const { data: logs } = await admin
    .from("logs")
    .select("action, ip, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const counts = (logs ?? []).reduce<Record<string, number>>((acc, log) => {
    acc[log.action] = (acc[log.action] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text-1)", marginBottom: 8 }}>
        Admin
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 40 }}>
        {profiles?.length ?? 0} registered users
      </p>

      {/* Log counts summary */}
      <div style={{ display: "flex", gap: 12, marginBottom: 40, flexWrap: "wrap" }}>
        {Object.entries(counts).map(([action, count]) => (
          <div
            key={action}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "14px 18px",
              minWidth: 120,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-1)" }}>{count}</div>
            <div style={{ fontSize: 12, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {action}
            </div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)", marginBottom: 12 }}>
        Users
      </h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 40, fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-strong)" }}>
            <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-2)", fontWeight: 500 }}>Email</th>
            <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-2)", fontWeight: 500 }}>Signed up</th>
          </tr>
        </thead>
        <tbody>
          {(profiles ?? []).map(p => (
            <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "8px 12px", color: "var(--text-1)" }}>{p.email}</td>
              <td style={{ padding: "8px 12px", color: "var(--text-2)" }}>
                {new Date(p.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Recent activity */}
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)", marginBottom: 12 }}>
        Recent activity
      </h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-strong)" }}>
            <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-2)", fontWeight: 500 }}>Action</th>
            <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-2)", fontWeight: 500 }}>IP</th>
            <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-2)", fontWeight: 500 }}>When</th>
          </tr>
        </thead>
        <tbody>
          {(logs ?? []).map((log, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "8px 12px", color: "var(--text-1)" }}>{log.action}</td>
              <td style={{ padding: "8px 12px", color: "var(--text-2)" }}>{log.ip}</td>
              <td style={{ padding: "8px 12px", color: "var(--text-2)" }}>
                {new Date(log.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
