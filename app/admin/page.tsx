import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { isAdminEmail } from "@/utils/adminEmails";
import { approveListing, rejectListing } from "./actions";

// A listing waiting in the review queue, plus the two links an admin needs in
// order to decide: the photo of the place and the poster's ID document.
type QueueListing = {
  id: string;
  created_at: string;
  title: string;
  city: string;
  price: number;
  rooms: number | null;
  furnished: boolean;
  available_from: string | null;
  description: string | null;
  link: string | null;
  verified: boolean;
  created_by: string | null;
  photoUrl: string | null;
  idDocUrl: string | null;
};

type DecidedListing = {
  id: string;
  title: string;
  city: string;
  price: number;
  status: string;
  updated_at: string | null;
  created_by: string | null;
};

const card = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
} as const;

const th = {
  textAlign: "left" as const,
  padding: "8px 12px",
  color: "var(--text-2)",
  fontWeight: 500,
};

function SectionTitle({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
      {children}
      {count !== undefined && count > 0 && (
        <span style={{
          fontSize: 12, fontWeight: 700, color: "var(--bg)", background: "var(--green)",
          borderRadius: 999, padding: "2px 9px",
        }}>
          {count}
        </span>
      )}
    </h2>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div style={{
      ...card,
      padding: "14px 18px",
      minWidth: 120,
      borderColor: highlight ? "var(--green)" : "var(--border)",
    }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: highlight ? "var(--green)" : "var(--text-1)" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </div>
    </div>
  );
}

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
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

  // ── The review queue ───────────────────────────────────────────────────────
  // `status` arrives with supabase/housing_listing_review.sql. If that file has
  // not been run on this database the select fails with 42703 (undefined
  // column); the page says so rather than crashing, the same way
  // fetchApartmentPins() tolerates unapplied migrations.
  const queueResult = await admin
    .from("housing_listings")
    .select("id, created_at, title, city, price, rooms, furnished, available_from, description, link, photo_path, id_file_path, verified, created_by")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const migrationMissing = queueResult.error?.code === "42703";

  // Only listings a student posted: the partner feeds carry created_by = null
  // and are imported already approved, so they are not decisions anyone made.
  const decidedResult = migrationMissing
    ? { data: null }
    : await admin
        .from("housing_listings")
        .select("id, title, city, price, status, updated_at, created_by")
        .in("status", ["approved", "rejected"])
        .not("created_by", "is", null)
        .order("updated_at", { ascending: false })
        .limit(8);

  const emailOf = new Map((profiles ?? []).map(p => [p.id as string, p.email as string]));

  // Photo is in a public bucket, so a plain URL is enough. The ID document is
  // in a private one on purpose, so it gets a link that expires in 10 minutes
  // and is generated per page load rather than stored anywhere.
  const queue: QueueListing[] = await Promise.all(
    ((queueResult.data ?? []) as Record<string, unknown>[]).map(async (row) => {
      const photoPath = row.photo_path as string | null;
      const idPath = row.id_file_path as string | null;
      const idDoc = idPath
        ? await admin.storage.from("housing-ids").createSignedUrl(idPath, 600)
        : null;
      return {
        id: row.id as string,
        created_at: row.created_at as string,
        title: row.title as string,
        city: row.city as string,
        price: row.price as number,
        rooms: (row.rooms as number | null) ?? null,
        furnished: Boolean(row.furnished),
        available_from: (row.available_from as string | null) ?? null,
        description: (row.description as string | null) ?? null,
        link: (row.link as string | null) ?? null,
        verified: Boolean(row.verified),
        created_by: (row.created_by as string | null) ?? null,
        photoUrl: photoPath
          ? admin.storage.from("housing-photos").getPublicUrl(photoPath).data.publicUrl
          : null,
        idDocUrl: idDoc?.data?.signedUrl ?? null,
      };
    })
  );

  const decided = (decidedResult.data ?? []) as DecidedListing[];

  const counts = (logs ?? []).reduce<Record<string, number>>((acc, log) => {
    acc[log.action] = (acc[log.action] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text-1)", marginBottom: 8 }}>
        Admin
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 32 }}>
        Signed in as {user.email}
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 44, flexWrap: "wrap" }}>
        <Stat label="Users" value={profiles?.length ?? 0} />
        <Stat label="Awaiting review" value={queue.length} highlight={queue.length > 0} />
        {Object.entries(counts).map(([action, count]) => (
          <Stat key={action} label={action} value={count} />
        ))}
      </div>

      {/* ── Housing requests ──────────────────────────────────────────────── */}
      <SectionTitle count={queue.length}>Housing requests</SectionTitle>
      <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 16, lineHeight: 1.6 }}>
        A student has asked to publish these. They are not on the map yet — only
        the person who posted one can see it. Approving puts it in front of
        everyone; rejecting keeps the record without publishing it, and can be
        undone by approving later.
      </p>

      {migrationMissing ? (
        <div style={{ ...card, padding: 18, marginBottom: 44, borderColor: "var(--accent)" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)", marginBottom: 6 }}>
            The review queue is not set up on this database
          </div>
          <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
            Run <code>supabase/housing_listing_review.sql</code> in the Supabase SQL
            Editor. Until then every new listing publishes itself immediately.
          </div>
        </div>
      ) : queue.length === 0 ? (
        <div style={{ ...card, padding: 24, marginBottom: 44, textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "var(--text-2)" }}>Nothing waiting. All caught up.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 44 }}>
          {queue.map(l => (
            <div key={l.id} style={{ ...card, padding: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
              {l.photoUrl ? (
                <img
                  src={l.photoUrl}
                  alt=""
                  style={{ width: 160, height: 120, objectFit: "cover", borderRadius: 8, flexShrink: 0, background: "var(--surface-2)" }}
                />
              ) : (
                <div style={{
                  width: 160, height: 120, borderRadius: 8, flexShrink: 0,
                  background: "var(--surface-2)", border: "1px dashed var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, color: "var(--text-3)",
                }}>
                  no photo
                </div>
              )}

              <div style={{ flex: "1 1 320px", minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>
                  {l.title}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 8 }}>
                  {l.city} · €{l.price}/month
                  {l.rooms ? ` · ${l.rooms} rooms` : ""}
                  {l.furnished ? " · furnished" : ""}
                  {l.available_from ? ` · from ${new Date(l.available_from).toLocaleDateString()}` : ""}
                </div>

                {l.description && (
                  <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 8, whiteSpace: "pre-wrap" }}>
                    {l.description}
                  </div>
                )}

                <div style={{ fontSize: 12, color: "var(--text-3)", display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <span>
                    posted by {(l.created_by && emailOf.get(l.created_by)) || "unknown account"}
                  </span>
                  <span>{new Date(l.created_at).toLocaleString()}</span>
                  <span style={{ color: l.verified ? "var(--green)" : "var(--text-3)" }}>
                    {l.verified ? "ID verified" : "ID not verified"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8 }}>
                  {l.link && (
                    <a href={l.link} target="_blank" rel="noopener noreferrer"
                       style={{ fontSize: 12, color: "var(--accent)" }}>
                      original listing ↗
                    </a>
                  )}
                  {l.idDocUrl && (
                    <a href={l.idDocUrl} target="_blank" rel="noopener noreferrer"
                       style={{ fontSize: 12, color: "var(--accent)" }}>
                      ID document ↗ (link expires in 10 min)
                    </a>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
                <form action={approveListing}>
                  <input type="hidden" name="id" value={l.id} />
                  <button type="submit" style={{
                    padding: "10px 22px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: "var(--green)", color: "var(--bg)", fontSize: 13, fontWeight: 700,
                    fontFamily: "inherit", width: "100%",
                  }}>
                    Approve
                  </button>
                </form>
                <form action={rejectListing}>
                  <input type="hidden" name="id" value={l.id} />
                  <button type="submit" style={{
                    padding: "10px 22px", borderRadius: 10, cursor: "pointer",
                    background: "transparent", color: "#f87171", border: "1px solid #f87171",
                    fontSize: 13, fontWeight: 700, fontFamily: "inherit", width: "100%",
                  }}>
                    Reject
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Recent decisions ──────────────────────────────────────────────── */}
      {decided.length > 0 && (
        <>
          <SectionTitle>Recently decided</SectionTitle>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 44, fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-strong)" }}>
                <th style={th}>Listing</th>
                <th style={th}>Posted by</th>
                <th style={th}>Status</th>
                <th style={th}>Decided</th>
              </tr>
            </thead>
            <tbody>
              {decided.map(d => (
                <tr key={d.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px 12px", color: "var(--text-1)" }}>
                    {d.title} <span style={{ color: "var(--text-3)" }}>· {d.city} · €{d.price}</span>
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--text-2)" }}>
                    {(d.created_by && emailOf.get(d.created_by)) || "—"}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
                      color: d.status === "approved" ? "var(--green)" : "#f87171",
                    }}>
                      {d.status}
                    </span>
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--text-2)" }}>
                    {d.updated_at ? new Date(d.updated_at).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ── Users ─────────────────────────────────────────────────────────── */}
      <SectionTitle>Users</SectionTitle>
      <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 12 }}>
        {profiles?.length ?? 0} registered
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 44, fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-strong)" }}>
            <th style={th}>Email</th>
            <th style={th}>Signed up</th>
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

      {/* ── Recent activity ───────────────────────────────────────────────── */}
      <SectionTitle>Recent activity</SectionTitle>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-strong)" }}>
            <th style={th}>Action</th>
            <th style={th}>IP</th>
            <th style={th}>When</th>
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
