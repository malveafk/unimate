"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveApartmentListing } from "@/utils/housing";
import AuthModal from "../../components/AuthModal";

const CITIES = [
  "Amsterdam", "Barcelona", "Berlin", "Bologna", "Brussels",
  "Copenhagen", "Delft", "Groningen", "Leuven", "Lisbon", "Lyon",
  "Maastricht", "Madrid", "Milan", "Munich", "Paris",
  "Porto", "Rotterdam", "Stockholm", "Vienna", "Zurich",
];

const TOTAL_STEPS = 3;
const STEP_LABELS = ["Photo", "The place", "Availability"];

type FormData = {
  // Step 0 – Photo
  photoFileName: string;
  photoPreviewUrl: string;
  // Step 1 – The place
  title: string;
  city: string;
  price: string;
  rooms: string;
  furnished: boolean;
  // Step 2 – Availability
  availableFrom: string;
  description: string;
};

const EMPTY: FormData = {
  photoFileName: "", photoPreviewUrl: "",
  title: "", city: "", price: "", rooms: "", furnished: false,
  availableFrom: "", description: "",
};

// ── Reusable bits (same style language as the roommate profile form) ──────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 18 : 6, height: 6, borderRadius: 3,
          background: i === current ? "var(--text-1)" : i < current ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)",
          transition: "all 0.3s ease",
        }} />
      ))}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{children}</label>;
}

function Input({ label, placeholder, value, onChange, type = "text" }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        style={{ padding: "13px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-1)", fontSize: 15, outline: "none", fontFamily: "inherit", transition: "border-color 0.15s", width: "100%", boxSizing: "border-box" }}
        onFocus={e => (e.target.style.borderColor = "var(--border-strong)")}
        onBlur={e => (e.target.style.borderColor = "var(--border)")}
      />
    </div>
  );
}

export default function PostListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  // The actual File selected in step 0; uploaded to Supabase Storage on submit.
  const photoFileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof FormData, value: any) => setForm(f => ({ ...f, [key]: value }));

  function handleFileSelect(file: File | null) {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { alert("Please upload a JPG, PNG or WEBP photo."); return; }
    if (file.size > 10 * 1024 * 1024) { alert("File must be under 10 MB."); return; }
    photoFileRef.current = file;
    set("photoFileName", file.name);
    set("photoPreviewUrl", URL.createObjectURL(file));
  }

  const canNext: Record<number, boolean> = {
    0: !!form.photoFileName,
    1: !!form.title && !!form.city && !!form.price,
    2: form.description.length >= 20,
  };

  async function handleSubmit() {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await saveApartmentListing(form, photoFileRef.current);
      setSubmitted(true);
    } catch (e) {
      if (e instanceof Error && e.message === "not-signed-in") {
        // Listings belong to an account: ask to sign in, then the user
        // resubmits (the form state is untouched).
        setAuthOpen(true);
      } else {
        console.error("Failed to save listing:", e);
        setSaveError("Something went wrong while saving. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  // ── Success screen ──
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", margin: "0 auto 24px",
            background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgb(52,211,153)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.8px", marginBottom: 16 }}>Listing posted!</h1>
          <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 32 }}>
            Your apartment is now live on the housing map. Students searching in {form.city || "your city"} will be able to find it and reach out.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => router.push("/housing")} style={{ padding: "13px 28px", borderRadius: 12, background: "var(--text-1)", color: "var(--bg)", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Back to housing →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 24px 100px" }}>

      {/* Header / progress */}
      <div style={{ width: "100%", maxWidth: 600, marginBottom: 40 }}>
        <button
          onClick={() => step === 0 ? router.push("/housing") : setStep(s => s - 1)}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 13, fontWeight: 600, fontFamily: "inherit", marginBottom: 32, padding: 0, transition: "color 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          {step === 0 ? "Back to housing" : "Previous step"}
        </button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Step {step + 1} of {TOTAL_STEPS} — {STEP_LABELS[step]}
          </span>
          <StepDots current={step} total={TOTAL_STEPS} />
        </div>
        <div style={{ height: 2, background: "var(--border)", borderRadius: 1, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${((step + 1) / TOTAL_STEPS) * 100}%`, background: "var(--text-1)", borderRadius: 1, transition: "width 0.4s ease" }} />
        </div>
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 600, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "40px 40px 36px", display: "flex", flexDirection: "column", gap: 28 }}>

        {/* ── Step 0: Photo ── */}
        {step === 0 && (
          <>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "rgb(96,165,250)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.4px", margin: "0 0 6px" }}>
                  Show the place
                </h2>
                <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0, lineHeight: 1.6 }}>
                  A real photo of the room or apartment. Listings with a photo get far more replies.
                </p>
              </div>
            </div>

            {!form.photoFileName ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0] ?? null); }}
                style={{
                  border: `2px dashed ${dragOver ? "rgba(96,165,250,0.6)" : "var(--border)"}`,
                  borderRadius: 16, padding: "44px 32px", textAlign: "center", cursor: "pointer",
                  background: dragOver ? "rgba(96,165,250,0.06)" : "transparent",
                  transition: "all 0.2s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
                }}
                onMouseEnter={e => { if (!dragOver) (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.25)"; }}
                onMouseLeave={e => { if (!dragOver) (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", marginBottom: 5 }}>
                    Drop a photo here
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-3)" }}>
                    or <span style={{ color: "rgb(96,165,250)", fontWeight: 600 }}>click to browse</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 8 }}>JPG, PNG or WEBP · Max 10 MB</div>
                </div>
                <input
                  ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={e => handleFileSelect(e.target.files?.[0] ?? null)}
                />
              </div>
            ) : (
              <div style={{ borderRadius: 14, border: "1px solid rgba(52,211,153,0.35)", background: "rgba(52,211,153,0.06)", padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
                {form.photoPreviewUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={form.photoPreviewUrl} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "rgb(52,211,153)", marginBottom: 3 }}>Photo added</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{form.photoFileName}</div>
                </div>
                <button
                  onClick={() => { set("photoFileName", ""); set("photoPreviewUrl", ""); photoFileRef.current = null; }}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 4, transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Step 1: The place ── */}
        {step === 1 && (
          <>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px", margin: "0 0 6px" }}>The place</h2>
              <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>The basics students will see first</p>
            </div>
            <Input label="Title" placeholder="e.g. Sunny room near campus, 2-bed flat" value={form.title} onChange={v => set("title", v)} />
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <FieldLabel>City</FieldLabel>
              <select value={form.city} onChange={e => set("city", e.target.value)} style={{ padding: "13px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: form.city ? "var(--text-1)" : "var(--text-3)", fontSize: 15, outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
                <option value="">Select a city…</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Input label="Price / month (€)" placeholder="e.g. 650" value={form.price} onChange={v => set("price", v)} type="number" />
              <Input label="Rooms" placeholder="e.g. 2" value={form.rooms} onChange={v => set("rooms", v)} type="number" />
            </div>
            <div
              onClick={() => set("furnished", !form.furnished)}
              style={{ padding: "14px 16px", borderRadius: 10, cursor: "pointer", border: form.furnished ? "1px solid rgba(52,211,153,0.5)" : "1px solid var(--border)", background: form.furnished ? "rgba(52,211,153,0.08)" : "var(--surface)", display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s" }}
            >
              <span style={{ fontSize: 20 }}>🛋️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>Furnished</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{form.furnished ? "Yes" : "No"}</div>
              </div>
            </div>
          </>
        )}

        {/* ── Step 2: Availability ── */}
        {step === 2 && (
          <>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px", margin: "0 0 6px" }}>Availability & description</h2>
              <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>When it's free, and what makes it worth a look</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <FieldLabel>Available from</FieldLabel>
              <input
                type="date" value={form.availableFrom} onChange={e => set("availableFrom", e.target.value)}
                style={{ padding: "13px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: form.availableFrom ? "var(--text-1)" : "var(--text-3)", fontSize: 15, outline: "none", fontFamily: "inherit", colorScheme: "dark" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <FieldLabel>Description ({form.description.length}/500)</FieldLabel>
              <textarea
                placeholder="What's the neighbourhood like? How far to campus? Anything students should know before reaching out?"
                value={form.description} maxLength={500} onChange={e => set("description", e.target.value)} rows={5}
                style={{ padding: "13px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-1)", fontSize: 14, outline: "none", fontFamily: "inherit", resize: "vertical", lineHeight: 1.6, transition: "border-color 0.15s" }}
                onFocus={e => (e.target.style.borderColor = "var(--border-strong)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
          </>
        )}

        {/* Nav button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext[step]}
              style={{ padding: "13px 32px", borderRadius: 12, background: canNext[step] ? "var(--text-1)" : "var(--border)", color: canNext[step] ? "var(--bg)" : "var(--text-3)", border: "none", fontSize: 14, fontWeight: 700, cursor: canNext[step] ? "pointer" : "default", fontFamily: "inherit", transition: "opacity 0.15s" }}
              onMouseEnter={e => { if (canNext[step]) e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canNext[2] || saving}
              style={{ padding: "13px 32px", borderRadius: 12, background: canNext[2] && !saving ? "var(--text-1)" : "var(--border)", color: canNext[2] && !saving ? "var(--bg)" : "var(--text-3)", border: "none", fontSize: 14, fontWeight: 700, cursor: canNext[2] && !saving ? "pointer" : "default", fontFamily: "inherit", transition: "opacity 0.15s" }}
              onMouseEnter={e => { if (canNext[2] && !saving) e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              {saving ? "Saving…" : "Post listing →"}
            </button>
          )}
        </div>

        {saveError && (
          <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", fontSize: 13 }}>
            {saveError}
          </div>
        )}
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  );
}
