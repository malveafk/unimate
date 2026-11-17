import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { isAdminEmail } from "@/utils/adminEmails";
import { approveListing, rejectListing, actionReport, dismissReport, verifyIdCheck, rejectIdCheck } from "./actions";
import { REPORT_REASONS } from "@/utils/reportReasons";

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
};

// A person waiting for their ID to be checked (supabase/housing_id_checks.sql),
// with what they told us about themselves, to compare against the document.
type QueueIdCheck = {
  user_id: string;
  submitted_at: string;
  docUrl: string | null;
  isPdf: boolean;
  profile: {
    first_name: string;
    age: number | null;
    nationality: string | null;
    university: string | null;
    city: string;
  } | null;
  listingCount: number;
};

type DecidedIdCheck = {
  user_id: string;
  status: string;
  reviewed_at: string | null;
};

// An open report, with enough of its target resolved that the admin can judge
// it without opening another tab.
type OpenReport = {
  id: string;
  created_at: string;
  reason: string;
  details: string | null;
  reporterEmail: string;
  // Exactly one of these two is set (enforced by a check constraint).
  listing: { id: string; title: string; city: string; price: number; status: string } | null;
  profile: { userId: string; name: string | null; email: string | null } | null;
};

type DecidedListing = {
  id: string;
  title: string;
  city: string;
  price: number;
  status: string;
  // When the admin decided (supabase/housing_listing_review.sql). Not
  // updated_at: that moves on every later write, such as the owner hiding the
  // flat or the ID-check trigger turning on the badge.
  reviewed_at: string | null;
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
    .select("id, created_at, title, city, price, rooms, furnished, available_from, description, link, photo_path, verified, created_by")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const migrationMissing = queueResult.error?.code === "42703";

  // Only listings a student posted: the partner feeds carry created_by = null
  // and are imported already approved, so they are not decisions anyone made.
  const decidedResult = migrationMissing
    ? { data: null }
    : await admin
        .from("housing_listings")
        .select("id, title, city, price, status, reviewed_at, created_by")
        .in("status", ["approved", "rejected"])
        .not("created_by", "is", null)
        .order("reviewed_at", { ascending: false, nullsFirst: false })
        .limit(8);

  const emailOf = new Map((profiles ?? []).map(p => [p.id as string, p.email as string]));

  // ── Reports ────────────────────────────────────────────────────────────────
  // Same tolerance as the queue above: if supabase/housing_reports_blocks.sql
  // has not been run here, 42P01 (undefined table) comes back and the section
  // says so instead of taking the whole admin page down.
  const reportsResult = await admin
    .from("housing_reports")
    .select("id, created_at, reporter_id, target_type, listing_id, profile_user_id, reason, details")
    .eq("status", "open")
    .order("created_at", { ascending: true });

  const reportsMissing = reportsResult.error?.code === "42P01";
  const reportRows = (reportsResult.data ?? []) as Record<string, unknown>[];

  // Two lookups for the whole batch rather than one per report.
  const reportedListingIds = reportRows.map(r => r.listing_id as string | null).filter(Boolean) as string[];
  const reportedUserIds = reportRows.map(r => r.profile_user_id as string | null).filter(Boolean) as string[];

  const { data: reportedListings } = reportedListingIds.length
    ? await admin.from("housing_listings").select("id, title, city, price, status").in("id", reportedListingIds)
    : { data: [] };
  const { data: reportedProfiles } = reportedUserIds.length
    ? await admin.from("housing_profiles").select("user_id, first_name").in("user_id", reportedUserIds)
    : { data: [] };

  const listingById = new Map((reportedListings ?? []).map(l => [l.id as string, l]));
  const profileNameOf = new Map((reportedProfiles ?? []).map(p => [p.user_id as string, p.first_name as string]));

  const reports: OpenReport[] = reportRows.map(row => {
    const listingId = row.listing_id as string | null;
    const profileUserId = row.profile_user_id as string | null;
    const listing = listingId ? listingById.get(listingId) : null;
    return {
      id: row.id as string,
      created_at: row.created_at as string,
      reason: row.reason as string,
      details: (row.details as string | null) ?? null,
      reporterEmail: emailOf.get(row.reporter_id as string) ?? "unknown account",
      listing: listing
        ? {
            id: listing.id as string,
            title: listing.title as string,
            city: listing.city as string,
            price: listing.price as number,
            status: (listing.status as string) ?? "approved",
          }
        : null,
      profile: profileUserId
        ? {
            userId: profileUserId,
            name: profileNameOf.get(profileUserId) ?? null,
            email: emailOf.get(profileUserId) ?? null,
          }
        : null,
    };
  });

  const reasonLabel = (value: string) =>
    REPORT_REASONS.find(r => r.value === value)?.label ?? value;

  // Photo is in a public bucket, so a plain URL is enough. The ID document is
  // reviewed in the Identity checks section, once per person.
  const queue: QueueListing[] = await Promise.all(
    ((queueResult.data ?? []) as Record<string, unknown>[]).map(async (row) => {
      const photoPath = row.photo_path as string | null;
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
      };
    })
  );

  const decided = (decidedResult.data ?? []) as DecidedListing[];

  // ── The ID check queue ─────────────────────────────────────────────────────
  // housing_id_checks arrives with supabase/housing_id_checks.sql. Until that
  // file is run the select fails and the section says so, like the listing
  // queue above.
  const idQueueResult = await admin
    .from("housing_id_checks")
    .select("user_id, file_path, submitted_at")
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });
  const idChecksMissing = Boolean(idQueueResult.error);
  const idRows = (idQueueResult.data ?? []) as { user_id: string; file_path: string | null; submitted_at: string }[];
  const idUserIds = idRows.map(r => r.user_id);

  const [idProfilesResult, idListingsResult, idDecidedResult] = idChecksMissing
    ? [{ data: null }, { data: null }, { data: null }]
    : await Promise.all([
        idUserIds.length
          ? admin.from("housing_profiles").select("user_id, first_name, age, nationality, university, city").in("user_id", idUserIds)
          : Promise.resolve({ data: [] }),
        idUserIds.length
          ? admin.from("housing_listings").select("created_by").in("created_by", idUserIds)
          : Promise.resolve({ data: [] }),
        admin.from("housing_id_checks").select("user_id, status, reviewed_at")
          .in("status", ["verified", "rejected"])
          .order("reviewed_at", { ascending: false })
          .limit(8),
      ]);

  const idProfileOf = new Map(
    ((idProfilesResult.data ?? []) as (NonNullable<QueueIdCheck["profile"]> & { user_id: string })[])
      .map(p => [p.user_id, p])
  );
  const listingCountOf = new Map<string, number>();
  for (const l of (idListingsResult.data ?? []) as { created_by: string }[]) {
    listingCountOf.set(l.created_by, (listingCountOf.get(l.created_by) ?? 0) + 1);
  }

  // The document sits in a private bucket on purpose, so it gets a link that
  // expires in 10 minutes and is generated per page load, never stored.
  const idQueue: QueueIdCheck[] = await Promise.all(idRows.map(async (r) => {
    const signed = r.file_path
      ? await admin.storage.from("housing-ids").createSignedUrl(r.file_path, 600)
      : null;
    const profile = idProfileOf.get(r.user_id);
    return {
      user_id: r.user_id,
      submitted_at: r.submitted_at,
      docUrl: signed?.data?.signedUrl ?? null,
      isPdf: (r.file_path ?? "").toLowerCase().endsWith(".pdf"),
      profile: profile
        ? { first_name: profile.first_name, age: profile.age, nationality: profile.nationality, university: profile.university, city: profile.city }
        : null,
      listingCount: listingCountOf.get(r.user_id) ?? 0,
    };
  }));
  const idDecided = (idDecidedResult.data ?? []) as DecidedIdCheck[];

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
        <Stat label="IDs to check" value={idQueue.length} highlight={idQueue.length > 0} />
        <Stat label="Awaiting review" value={queue.length} highlight={queue.length > 0} />
        <Stat label="Open reports" value={reports.length} highlight={reports.length > 0} />
        {Object.entries(counts).map(([action, count]) => (
          <Stat key={action} label={action} value={count} />
        ))}
      </div>

      {/* ── Reports ───────────────────────────────────────────────────────── */}
      {/* Above the review queue on purpose: a pending listing is nobody's
          problem yet, while a report is about something already live. */}
      <SectionTitle count={reports.length}>Reports</SectionTitle>
      <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 16, lineHeight: 1.6 }}>
        Students reported these. A report is one person&apos;s account of what
        happened, not a verdict — read it, then decide. <strong>Take down</strong>{" "}
        unpublishes the listing (the same state as rejecting one in the queue, so
        it can be approved again later). <strong>Dismiss</strong> leaves everything
        as it is. Either way the report stops appearing here.
      </p>

      {reportsMissing ? (
        <div style={{ ...card, padding: 18, marginBottom: 44, borderColor: "var(--accent)" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)", marginBottom: 6 }}>
            Reporting is not set up on this database
          </div>
          <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
            Run <code>supabase/housing_reports_blocks.sql</code> in the Supabase SQL
            Editor. Until then the report and block buttons on the site will fail.
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div style={{ ...card, padding: 24, marginBottom: 44, textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "var(--text-2)" }}>No open reports.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 44 }}>
          {reports.map(r => (
            <div key={r.id} style={{ ...card, padding: 16, display: "flex", gap: 16, flexWrap: "wrap", borderColor: "rgba(248,113,113,0.3)" }}>
              <div style={{ flex: "1 1 360px", minWidth: 0 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
                    color: "#f87171", background: "rgba(248,113,113,0.1)",
                    border: "1px solid rgba(248,113,113,0.3)", borderRadius: 999, padding: "2px 9px",
                  }}>
                    {reasonLabel(r.reason)}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                </div>

                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>
                  {r.listing
                    ? r.listing.title
                    : `Profile: ${r.profile?.name ?? r.profile?.email ?? "unknown account"}`}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 8 }}>
                  {r.listing
                    ? <>{r.listing.city} · €{r.listing.price}/month · currently <strong>{r.listing.status}</strong></>
                    : <>{r.profile?.email ?? "email not available"}</>}
                </div>

                {r.details && (
                  <div style={{
                    fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, whiteSpace: "pre-wrap",
                    borderLeft: "2px solid var(--border-strong)", paddingLeft: 12, marginBottom: 8,
                  }}>
                    {r.details}
                  </div>
                )}

                <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                  reported by {r.reporterEmail}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
                {/* A profile report has nothing to unpublish, so it gets the
                    "agreed" button without a listing id attached. */}
                <form action={actionReport}>
                  <input type="hidden" name="id" value={r.id} />
                  {r.listing && <input type="hidden" name="listingId" value={r.listing.id} />}
                  <button type="submit" style={{
                    padding: "10px 22px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: "#f87171", color: "var(--bg)", fontSize: 13, fontWeight: 700,
                    fontFamily: "inherit", width: "100%",
                  }}>
                    {r.listing ? "Take down" : "Mark actioned"}
                  </button>
                </form>
                <form action={dismissReport}>
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" style={{
                    padding: "10px 22px", borderRadius: 10, cursor: "pointer",
                    background: "transparent", color: "var(--text-2)", border: "1px solid var(--border-strong)",
                    fontSize: 13, fontWeight: 700, fontFamily: "inherit", width: "100%",
                  }}>
                    Dismiss
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Identity checks ───────────────────────────────────────────────── */}
      <SectionTitle count={idQueue.length}>Identity checks</SectionTitle>
      <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 16, lineHeight: 1.6 }}>
        One check per person, covering their roommate profile and every listing.
        Compare the document with what they told us: name, age, nationality, and
        that it is a real, valid passport, national ID card or driving licence.
        Their roommate profile stays off the map until you verify them. Either
        decision deletes the document straight away.
      </p>

      {idChecksMissing ? (
        <div style={{ ...card, padding: 18, marginBottom: 44, borderColor: "var(--accent)" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)", marginBottom: 6 }}>
            ID checks are not set up on this database
          </div>
          <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
            Run <code>supabase/housing_id_checks.sql</code> in the Supabase SQL Editor.
          </div>
        </div>
      ) : idQueue.length === 0 ? (
        <div style={{ ...card, padding: 24, marginBottom: 44, textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "var(--text-2)" }}>No IDs waiting. All caught up.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 44 }}>
          {idQueue.map(c => (
            <div key={c.user_id} style={{ ...card, padding: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 320px", minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>
                  {c.profile ? c.profile.first_name : (emailOf.get(c.user_id) ?? "Unknown account")}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 8, lineHeight: 1.6 }}>
                  {c.profile ? (
                    <>
                      {c.profile.age ? `${c.profile.age} years old` : "age not given"}
                      {c.profile.nationality ? ` · ${c.profile.nationality}` : ""}
                      {c.profile.university ? ` · ${c.profile.university}` : ""}
                      {` · ${c.profile.city}`}
                    </>
                  ) : (
                    "No roommate profile: uploaded the ID to post an apartment."
                  )}
                  {c.listingCount > 0 ? ` · ${c.listingCount} listing${c.listingCount === 1 ? "" : "s"}` : ""}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-3)", display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <span>{emailOf.get(c.user_id) ?? "unknown email"}</span>
                  <span>submitted {new Date(c.submitted_at).toLocaleString()}</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  {c.docUrl ? (
                    <a href={c.docUrl} target="_blank" rel="noopener noreferrer"
                       style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
                      Open ID document{c.isPdf ? " (PDF)" : ""} ↗ <span style={{ fontWeight: 400, color: "var(--text-3)" }}>link expires in 10 min, reload for a new one</span>
                    </a>
                  ) : (
                    <span style={{ fontSize: 13, color: "#f87171" }}>
                      The document is missing from storage. Reject, and the student is asked to upload it again.
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
                <form action={verifyIdCheck}>
                  <input type="hidden" name="userId" value={c.user_id} />
                  <button type="submit" style={{
                    padding: "10px 22px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: "var(--green)", color: "var(--bg)", fontSize: 13, fontWeight: 700,
                    fontFamily: "inherit", width: "100%",
                  }}>
                    Verify
                  </button>
                </form>
                <form action={rejectIdCheck}>
                  <input type="hidden" name="userId" value={c.user_id} />
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

      {idDecided.length > 0 && (
        <>
          <SectionTitle>Recently checked IDs</SectionTitle>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 44, fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-strong)" }}>
                <th style={th}>Person</th>
                <th style={th}>Outcome</th>
                <th style={th}>Checked</th>
              </tr>
            </thead>
            <tbody>
              {idDecided.map(d => (
                <tr key={d.user_id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px 12px", color: "var(--text-1)" }}>{emailOf.get(d.user_id) ?? "—"}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
                      color: d.status === "verified" ? "var(--green)" : "#f87171",
                    }}>
                      {d.status}
                    </span>
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--text-2)" }}>
                    {d.reviewed_at ? new Date(d.reviewed_at).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

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
                    {l.verified ? "poster's ID verified" : "poster's ID not verified yet (see Identity checks)"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8 }}>
                  {l.link && (
                    <a href={l.link} target="_blank" rel="noopener noreferrer"
                       style={{ fontSize: 12, color: "var(--accent)" }}>
                      original listing ↗
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
                    {d.reviewed_at ? new Date(d.reviewed_at).toLocaleString() : "—"}
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
