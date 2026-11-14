"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import AuthModal from "../components/AuthModal";
import AccountIcon from "../components/AccountIcon";

// ── Types (only the columns this page needs) ───────────────────────────────

type MyProfile = {
  id: string;
  first_name: string;
  city: string;
  university: string | null;
  budget_min: number | null;
  budget_max: number | null;
  move_in_month: number | null;
  move_in_year: number | null;
  id_file_path: string | null;
  verified: boolean;
  is_active: boolean;
};

type MyListing = {
  id: string;
  title: string;
  city: string;
  price: number;
  available_from: string | null;
  description: string | null;
  link: string | null;
  photo_path: string | null;
  id_file_path: string | null;
  is_active: boolean;
  // Only present once supabase/housing_listing_review.sql has been run.
  status?: "pending" | "approved" | "rejected";
  created_at: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LISTING_COLS = "id, title, city, price, available_from, description, link, photo_path, id_file_path, is_active, created_at";

// ── Small UI pieces ─────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18,
  padding: "26px 28px", display: "flex", flexDirection: "column", gap: 16,
};

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.3px" }}>{title}</h2>
      {subtitle && <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-3)", lineHeight: 1.6 }}>{subtitle}</p>}
    </div>
  );
}

function Pill({ label, rgb }: { label: string; rgb: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
      background: `rgba(${rgb},0.12)`, border: `1px solid rgba(${rgb},0.3)`, color: `rgb(${rgb})`,
      whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function Button({ children, onClick, tone = "default", disabled, type = "button" }: {
  children: React.ReactNode; onClick?: () => void; tone?: "default" | "primary" | "danger"; disabled?: boolean; type?: "button" | "submit";
}) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background: "transparent", border: "1px solid var(--border-strong)", color: "var(--text-1)" },
    primary: { background: "var(--text-1)", border: "1px solid var(--text-1)", color: "var(--bg)" },
    danger: { background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.35)", color: "#f87171" },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[tone], padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
        cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1, fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 13px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface-2)",
  color: "var(--text-1)", fontSize: 14, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box",
};

function listingStatus(l: MyListing): { label: string; rgb: string; note: string } {
  if (l.status === "pending") return { label: "Waiting for review", rgb: "251,191,36", note: "We check every listing before it goes on the map. This usually takes a day or two." };
  if (l.status === "rejected") return { label: "Not approved", rgb: "248,113,113", note: "This listing wasn't approved. Email us if you'd like to know why." };
  if (!l.is_active) return { label: "Hidden", rgb: "150,150,150", note: "Only you can see it. Show it again whenever you like." };
  return { label: "Live on the map", rgb: "52,211,153", note: "Students can see this listing." };
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loadError, setLoadError] = useState("");

  // ── Data ──
  const load = useCallback(async (uid: string) => {
    const { data: p, error: pErr } = await supabase
      .from("housing_profiles")
      .select("id, first_name, city, university, budget_min, budget_max, move_in_month, move_in_year, id_file_path, verified, is_active")
      .eq("user_id", uid)
      .maybeSingle();
    setLoadError(pErr ? "Couldn't load your profile. Please refresh the page." : "");
    setProfile((p as MyProfile) ?? null);

    // `status` only exists after the listing-review SQL has been run, so ask
    // for it first and fall back to the older columns if the database says no.
    const fetchListings = (cols: string) => supabase.from("housing_listings").select(cols)
      .eq("created_by", uid).order("created_at", { ascending: false });
    let res = await fetchListings(`${LISTING_COLS}, status`);
    if (res.error) res = await fetchListings(LISTING_COLS);
    if (res.error) setLoadError("Couldn't load your listings. Please refresh the page.");
    setListings((res.data as unknown as MyListing[]) ?? []);
  }, [supabase]);


  // ── Auth ──
  useEffect(() => {
    supabase.auth.getUser()
      .then(({ data }) => {
        setUser(data.user);
        if (data.user) load(data.user.id);
      })
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      // Signing in from this page (via the modal) should load their data too.
      if (event === "SIGNED_IN" && session?.user) load(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, [supabase, load]);


  // ── Signed-out / loading states ──
  if (checking) {
    return <div style={{ maxWidth: 820, margin: "0 auto", padding: "80px 24px", color: "var(--text-3)", fontSize: 14 }}>Loading your account…</div>;
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "100px 24px", textAlign: "center" }}>
        <div style={{ color: "var(--text-1)", display: "flex", justifyContent: "center", marginBottom: 20 }}><AccountIcon size={56} /></div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-1)", margin: "0 0 10px", letterSpacing: "-0.6px" }}>Your account</h1>
        <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, margin: "0 0 24px" }}>
          Sign in to manage your roommate profile, your apartment listings and your account settings.
        </p>
        <Button tone="primary" onClick={() => setAuthOpen(true)}>Sign in</Button>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      </div>
    );
  }

  const provider = (user.app_metadata?.provider as string | undefined) ?? "email";

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "56px 24px 96px", display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 6 }}>
        <div style={{ color: "var(--text-1)", flexShrink: 0 }}><AccountIcon size={52} /></div>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.7px" }}>My account</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</p>
        </div>
      </div>

      {loadError && <p style={{ margin: 0, fontSize: 13, color: "#f87171" }}>{loadError}</p>}

      <AccountSection user={user} provider={provider} onSignOut={async () => { await supabase.auth.signOut(); router.push("/"); }} />
      <ProfileSection profile={profile} listings={listings} onChanged={() => load(user.id)} />
      <ListingsSection listings={listings} onChanged={() => load(user.id)} />
      <DeleteSection onDeleted={async () => { await supabase.auth.signOut(); router.push("/"); }} />
    </div>
  );
}

// ── Account details + password ──────────────────────────────────────────────

function AccountSection({ user, provider, onSignOut }: { user: User; provider: string; onSignOut: () => void }) {
  const supabase = createClient();
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (pw.length < 8) return setMsg({ ok: false, text: "Password must be at least 8 characters." });
    if (pw !== pw2) return setMsg({ ok: false, text: "Passwords don't match." });
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSaving(false);
    if (error) setMsg({ ok: false, text: error.message });
    else { setMsg({ ok: true, text: "Password updated." }); setPw(""); setPw2(""); setShowPw(false); }
  }

  const joined = new Date(user.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <section style={card}>
      <SectionTitle title="Account" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {[
          { label: "Email", value: user.email ?? "—" },
          { label: "Signs in with", value: provider === "google" ? "Google" : "Email and password" },
          { label: "Member since", value: joined },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 14, color: "var(--text-1)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Button onClick={() => { setShowPw(v => !v); setMsg(null); }}>
          {provider === "google" ? "Set a password" : "Change password"}
        </Button>
        <Link href="/messages" style={{ textDecoration: "none" }}><Button>My messages</Button></Link>
        <Button onClick={onSignOut}>Sign out</Button>
      </div>

      {showPw && (
        <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 360 }}>
          {provider === "google" && (
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-3)", lineHeight: 1.6 }}>
              Optional: lets you sign in with your email as well as with Google.
            </p>
          )}
          <input type="password" placeholder="New password (8+ characters)" value={pw} onChange={e => setPw(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Confirm new password" value={pw2} onChange={e => setPw2(e.target.value)} style={inputStyle} />
          <div><Button type="submit" tone="primary" disabled={saving}>{saving ? "Saving…" : "Save password"}</Button></div>
        </form>
      )}
      {msg && <p style={{ margin: 0, fontSize: 13, color: msg.ok ? "var(--green)" : "#f87171" }}>{msg.text}</p>}
    </section>
  );
}

// ── Roommate profile ────────────────────────────────────────────────────────

function ProfileSection({ profile, listings, onChanged }: { profile: MyProfile | null; listings: MyListing[]; onChanged: () => void }) {
  const supabase = createClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!profile) {
    return (
      <section style={card}>
        <SectionTitle title="Roommate profile" subtitle="You don't have a roommate profile yet. Create one so other students looking for a flatmate can find you." />
        <div><Link href="/housing/create-profile" style={{ textDecoration: "none" }}><Button tone="primary">Create roommate profile</Button></Link></div>
      </section>
    );
  }

  async function toggleVisible() {
    if (!profile) return;
    setBusy(true); setError("");
    const { error } = await supabase.from("housing_profiles").update({ is_active: !profile.is_active }).eq("id", profile.id);
    setBusy(false);
    if (error) setError("Couldn't update your profile. Please try again.");
    else onChanged();
  }

  async function deleteProfile() {
    if (!profile) return;
    if (!window.confirm("Delete your roommate profile? It will disappear from the map. Your messages stay in your inbox.")) return;
    setBusy(true); setError("");
    const { error } = await supabase.from("housing_profiles").delete().eq("id", profile.id);
    if (!error && profile.id_file_path && !listings.some(l => l.id_file_path === profile.id_file_path)) {
      // The ID document is only kept while something still relies on it.
      await supabase.storage.from("housing-ids").remove([profile.id_file_path]);
    }
    setBusy(false);
    if (error) setError("Couldn't delete your profile. Please try again.");
    else onChanged();
  }

  const budget = profile.budget_min || profile.budget_max ? `€${profile.budget_min ?? "?"}–€${profile.budget_max ?? "?"}/month` : "—";
  const moveIn = profile.move_in_month ? `${MONTHS[profile.move_in_month - 1]} ${profile.move_in_year ?? ""}` : "—";

  return (
    <section style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <SectionTitle title="Roommate profile" subtitle={profile.is_active ? "Visible to other students on the housing map." : "Hidden: only you can see it."} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Pill label={profile.is_active ? "Visible" : "Hidden"} rgb={profile.is_active ? "52,211,153" : "150,150,150"} />
          {profile.verified
            ? <Pill label="✓ ID verified" rgb="52,211,153" />
            : profile.id_file_path ? <Pill label="ID under review" rgb="251,191,36" /> : <Pill label="No ID uploaded" rgb="248,113,113" />}
        </div>
      </div>

      <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.8 }}>
        <strong style={{ color: "var(--text-1)" }}>{profile.first_name}</strong> · {profile.city}
        {profile.university ? ` · ${profile.university}` : ""}<br />
        Budget {budget} · Moving in {moveIn}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/housing/create-profile" style={{ textDecoration: "none" }}><Button>Edit profile</Button></Link>
        <Button onClick={toggleVisible} disabled={busy}>{profile.is_active ? "Hide from map" : "Show on map"}</Button>
        <Button tone="danger" onClick={deleteProfile} disabled={busy}>Delete profile</Button>
      </div>
      {error && <p style={{ margin: 0, fontSize: 13, color: "#f87171" }}>{error}</p>}
    </section>
  );
}

// ── Apartment listings ──────────────────────────────────────────────────────

function ListingsSection({ listings, onChanged }: { listings: MyListing[]; onChanged: () => void }) {
  return (
    <section style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <SectionTitle
          title="My apartment listings"
          subtitle={listings.length === 0 ? "You haven't posted an apartment yet." : `${listings.length} listing${listings.length === 1 ? "" : "s"}`}
        />
        <Link href="/housing/post-listing" style={{ textDecoration: "none" }}><Button tone="primary">Post an apartment</Button></Link>
      </div>
      {listings.map(l => <ListingRow key={l.id} listing={l} onChanged={onChanged} />)}
    </section>
  );
}

function normalizeLink(raw: string): string | null {
  const v = raw.trim();
  if (!v) return "";
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const url = new URL(withScheme);
    return url.hostname.includes(".") ? url.toString() : null;
  } catch {
    return null;
  }
}

function ListingRow({ listing, onChanged }: { listing: MyListing; onChanged: () => void }) {
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: listing.title,
    price: String(listing.price),
    availableFrom: listing.available_from ?? "",
    description: listing.description ?? "",
    link: listing.link ?? "",
  });

  const status = listingStatus(listing);
  const photo = listing.photo_path
    ? supabase.storage.from("housing-photos").getPublicUrl(listing.photo_path).data.publicUrl
    : null;

  async function toggleVisible() {
    setBusy(true); setError("");
    const { error } = await supabase.from("housing_listings").update({ is_active: !listing.is_active }).eq("id", listing.id);
    setBusy(false);
    if (error) setError("Couldn't update this listing. Please try again.");
    else onChanged();
  }

  async function save() {
    setError("");
    const price = Number(form.price);
    const link = normalizeLink(form.link);
    if (!form.title.trim()) return setError("Please add a title.");
    if (!Number.isFinite(price) || price <= 0) return setError("Please enter a valid monthly rent.");
    if (form.description.trim().length < 20) return setError("The description needs at least 20 characters.");
    if (link === null) return setError("That website doesn't look like a web address.");
    setBusy(true);
    const { error } = await supabase.from("housing_listings").update({
      title: form.title.trim(),
      price: Math.round(price),
      available_from: form.availableFrom || null,
      description: form.description.trim(),
      link: link || null,
    }).eq("id", listing.id);
    setBusy(false);
    if (error) setError("Couldn't save your changes. Please try again.");
    else { setEditing(false); onChanged(); }
  }

  async function remove() {
    if (!window.confirm(`Delete "${listing.title}"? This can't be undone.`)) return;
    setBusy(true); setError("");
    const { error } = await supabase.from("housing_listings").delete().eq("id", listing.id);
    if (!error && listing.photo_path) {
      await supabase.storage.from("housing-photos").remove([listing.photo_path]);
    }
    setBusy(false);
    if (error) setError("Couldn't delete this listing. Please try again.");
    else onChanged();
  }

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 12, background: "var(--panel)" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {photo && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={photo} alt="" style={{ width: 84, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)", flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>{listing.title}</div>
            <Pill label={status.label} rgb={status.rgb} />
          </div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 3 }}>{listing.city} · €{listing.price}/month</div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6, lineHeight: 1.5 }}>{status.note}</div>
        </div>
      </div>

      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input style={inputStyle} value={form.title} maxLength={120} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input style={inputStyle} inputMode="numeric" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="Rent €/month" />
            <input style={{ ...inputStyle, colorScheme: "dark" }} type="date" value={form.availableFrom} onChange={e => setForm(f => ({ ...f, availableFrom: e.target.value }))} />
          </div>
          <textarea style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} rows={4} maxLength={500} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
          <input style={inputStyle} value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="Your website or contact page (optional)" />
          {listing.status === "approved" && (
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-3)" }}>Saving changes sends a live listing back for a quick review before it shows again.</p>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <Button tone="primary" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
            <Button onClick={() => { setEditing(false); setError(""); }} disabled={busy}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button onClick={() => setEditing(true)} disabled={busy}>Edit</Button>
          {listing.status !== "rejected" && (
            <Button onClick={toggleVisible} disabled={busy}>{listing.is_active ? "Hide" : "Show again"}</Button>
          )}
          <Button tone="danger" onClick={remove} disabled={busy}>Delete</Button>
        </div>
      )}
      {error && <p style={{ margin: 0, fontSize: 13, color: "#f87171" }}>{error}</p>}
    </div>
  );
}

// ── Delete account ──────────────────────────────────────────────────────────

function DeleteSection({ onDeleted }: { onDeleted: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function deleteAccount() {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Something went wrong.");
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <section style={{ ...card, border: "1px solid rgba(248,113,113,0.25)" }}>
      <SectionTitle
        title="Delete account"
        subtitle="Permanently deletes your account, roommate profile, apartment listings, messages, AI chats and the ID documents you uploaded. This can't be undone."
      />
      {!open ? (
        <div><Button tone="danger" onClick={() => setOpen(true)}>Delete my account</Button></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 360 }}>
          <label style={{ fontSize: 13, color: "var(--text-2)" }}>Type <strong style={{ color: "var(--text-1)" }}>DELETE</strong> to confirm</label>
          <input style={inputStyle} value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="DELETE" autoComplete="off" />
          <div style={{ display: "flex", gap: 10 }}>
            <Button tone="danger" onClick={deleteAccount} disabled={busy || confirmText !== "DELETE"}>
              {busy ? "Deleting…" : "Permanently delete"}
            </Button>
            <Button onClick={() => { setOpen(false); setConfirmText(""); setError(""); }} disabled={busy}>Cancel</Button>
          </div>
        </div>
      )}
      {error && <p style={{ margin: 0, fontSize: 13, color: "#f87171" }}>{error}</p>}
    </section>
  );
}
