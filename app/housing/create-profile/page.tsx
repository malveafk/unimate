"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveRoommateProfile } from "@/utils/housing";
import AuthModal from "../../components/AuthModal";

const CITIES = [
  "Amsterdam", "Barcelona", "Berlin", "Bologna", "Brussels",
  "Copenhagen", "Delft", "Groningen", "Leuven", "Lisbon", "Lyon",
  "Maastricht", "Madrid", "Milan", "Munich", "Paris",
  "Porto", "Rotterdam", "Stockholm", "Vienna", "Zurich",
];

const LIFESTYLE_TAGS = [
  { emoji: "🚭", label: "Non-smoker" },
  { emoji: "🐱", label: "Pet-friendly" },
  { emoji: "📚", label: "Study-focused" },
  { emoji: "🌙", label: "Night owl" },
  { emoji: "☀️", label: "Early riser" },
  { emoji: "🏠", label: "Homebody" },
  { emoji: "🎮", label: "Gamer" },
  { emoji: "🎵", label: "Music lover" },
  { emoji: "🏋️", label: "Gym-goer" },
  { emoji: "🌱", label: "Vegan / vegetarian" },
  { emoji: "🍳", label: "Loves cooking" },
  { emoji: "🔇", label: "Quiet environment" },
  { emoji: "🎉", label: "Social / parties ok" },
  { emoji: "🧹", label: "Very tidy" },
  { emoji: "🌍", label: "International" },
];

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian",
  "Portuguese", "Dutch", "Swedish", "Danish", "Polish",
  "Arabic", "Chinese", "Japanese", "Korean", "Hindi",
  "Turkish", "Greek", "Romanian", "Czech", "Hungarian",
];

const GENDERS = [
  { label: "He / Him",          value: "male" },
  { label: "She / Her",         value: "female" },
  { label: "They / Them",       value: "nonbinary" },
  { label: "Prefer not to say", value: "undisclosed" },
];

const STUDY_YEARS = ["1st year", "2nd year", "3rd year", "4th year", "Master's", "PhD", "Exchange"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const AVATAR_COLORS = ["167,139,250","96,165,250","52,211,153","251,191,36","248,113,113","251,146,60"];

const TOTAL_STEPS = 6;
const STEP_LABELS = ["ID Verification", "Identity", "University", "Housing", "About you", "Looking for"];

type FormData = {
  // Step 0 – ID verification
  idFileName: string;
  idVerified: boolean;
  // Step 1 – Identity
  firstName: string;
  age: string;
  gender: string;
  nationality: string;
  flag: string;
  avatarColor: string;
  // Step 2 – University
  university: string;
  programme: string;
  studyYear: string;
  // Step 3 – Housing needs
  city: string;
  budgetMin: string;
  budgetMax: string;
  moveInMonth: string;
  moveInYear: string;
  // Step 4 – About you
  bio: string;
  lifestyle: string[];
  languages: string[];
  // Step 5 – Looking for
  lookingFor: string;
  genderPreference: string;
  smokingOk: boolean;
  petsOk: boolean;
};

const EMPTY: FormData = {
  idFileName: "", idVerified: false,
  firstName: "", age: "", gender: "", nationality: "", flag: "", avatarColor: AVATAR_COLORS[0],
  university: "", programme: "", studyYear: "",
  city: "", budgetMin: "", budgetMax: "", moveInMonth: "", moveInYear: "",
  bio: "", lifestyle: [], languages: [],
  lookingFor: "", genderPreference: "no preference", smokingOk: false, petsOk: false,
};

// ── Reusable components ───────────────────────────────────────────

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

function Input({ label, placeholder, value, onChange, type = "text", maxLength }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string; maxLength?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type} placeholder={placeholder} value={value} maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
        style={{ padding: "13px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-1)", fontSize: 15, outline: "none", fontFamily: "inherit", transition: "border-color 0.15s", width: "100%", boxSizing: "border-box" }}
        onFocus={e => (e.target.style.borderColor = "var(--border-strong)")}
        onBlur={e => (e.target.style.borderColor = "var(--border)")}
      />
    </div>
  );
}

function ChipSelect({ label, options, value, onChange }: {
  label: string; options: { label: string; value: string }[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {options.map(o => (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            padding: "9px 16px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
            fontSize: 13, fontWeight: 600, transition: "all 0.15s",
            border: value === o.value ? "1px solid var(--text-1)" : "1px solid var(--border)",
            background: value === o.value ? "var(--text-1)" : "transparent",
            color: value === o.value ? "var(--bg)" : "var(--text-2)",
          }}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}

function TagMultiSelect({ label, options, selected, onChange, emoji = false }: {
  label: string; options: string[] | { emoji: string; label: string }[]; selected: string[]; onChange: (v: string[]) => void; emoji?: boolean;
}) {
  const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(options as any[]).map(o => {
          const val = emoji ? o.label : o;
          const display = emoji ? `${o.emoji} ${o.label}` : o;
          const active = selected.includes(val);
          return (
            <button key={val} onClick={() => toggle(val)} style={{
              padding: "7px 13px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit",
              fontSize: 12, fontWeight: 600, transition: "all 0.15s",
              border: active ? "1px solid rgba(167,139,250,0.6)" : "1px solid var(--border)",
              background: active ? "rgba(167,139,250,0.14)" : "transparent",
              color: active ? "rgb(167,139,250)" : "var(--text-3)",
            }}>{display}</button>
          );
        })}
      </div>
    </div>
  );
}

function AvatarPreview({ form }: { form: FormData }) {
  return (
    <div style={{ width: 64, height: 64, borderRadius: "50%", background: `rgba(${form.avatarColor},0.2)`, border: `2px solid rgba(${form.avatarColor},0.5)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: `rgb(${form.avatarColor})`, flexShrink: 0 }}>
      {form.firstName ? form.firstName[0].toUpperCase() : "?"}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export default function CreateProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  // The actual File selected in step 0; uploaded to Supabase Storage on submit.
  const idFileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof FormData, value: any) => setForm(f => ({ ...f, [key]: value }));

  function handleFileSelect(file: File | null) {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) { alert("Please upload a JPG, PNG, WEBP or PDF file."); return; }
    if (file.size > 10 * 1024 * 1024) { alert("File must be under 10 MB."); return; }
    idFileRef.current = file;
    set("idFileName", file.name);
    set("idVerified", true);
  }

  const canNext: Record<number, boolean> = {
    0: form.idVerified,
    1: !!form.firstName && !!form.age && !!form.gender && !!form.nationality,
    2: !!form.university && !!form.programme && !!form.studyYear,
    3: !!form.city && !!form.budgetMin && !!form.budgetMax && !!form.moveInMonth && !!form.moveInYear,
    4: form.bio.length >= 20 && form.lifestyle.length >= 1 && form.languages.length >= 1,
    5: form.lookingFor.length >= 20,
  };

  async function handleSubmit() {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await saveRoommateProfile(form, idFileRef.current);
      setSubmitted(true);
    } catch (e) {
      if (e instanceof Error && e.message === "not-signed-in") {
        // Profiles belong to an account: ask to sign in, then the user
        // resubmits (the form state is untouched).
        setAuthOpen(true);
      } else {
        console.error("Failed to save housing profile:", e);
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
          <div style={{ fontSize: 56, marginBottom: 24 }}>🎉</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.8px", marginBottom: 16 }}>Profile created!</h1>
          <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 12 }}>
            Your roommate profile is live. Your uploaded ID is being reviewed — once confirmed you'll receive the <strong style={{ color: "rgb(52,211,153)" }}>✓ Verified</strong> badge automatically.
          </p>
          <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.6, marginBottom: 32 }}>
            This usually takes less than 24 hours.
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
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
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

        {/* ── Step 0: ID Verification ── */}
        {step === 0 && (
          <>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "rgb(96,165,250)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <circle cx="8" cy="12" r="2.5"/>
                  <path d="M14 9h4M14 12h4M14 15h2"/>
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.4px", margin: "0 0 6px" }}>
                  Identity verification
                </h2>
                <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0, lineHeight: 1.6 }}>
                  To keep the housing community safe, we require all users to verify their identity before creating a roommate profile.
                </p>
              </div>
            </div>

            {/* Accepted documents */}
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { icon: "🛂", label: "Passport" },
                { icon: "🪪", label: "National ID" },
                { icon: "🚗", label: "Driver's license" },
              ].map(({ icon, label }) => (
                <div key={label} style={{ flex: 1, borderRadius: 10, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Upload zone */}
            {!form.idVerified ? (
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
                    Drop your document here
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-3)" }}>
                    or <span style={{ color: "rgb(96,165,250)", fontWeight: 600 }}>click to browse</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 8 }}>JPG, PNG, WEBP or PDF · Max 10 MB</div>
                </div>
                <input
                  ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
                  style={{ display: "none" }}
                  onChange={e => handleFileSelect(e.target.files?.[0] ?? null)}
                />
              </div>
            ) : (
              /* Uploaded state */
              <div style={{ borderRadius: 14, border: "1px solid rgba(52,211,153,0.35)", background: "rgba(52,211,153,0.06)", padding: "20px 22px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(52,211,153)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "rgb(52,211,153)", marginBottom: 3 }}>Document uploaded</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{form.idFileName}</div>
                </div>
                <button
                  onClick={() => { set("idFileName", ""); set("idVerified", false); }}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 4, transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            )}

            {/* Privacy notice */}
            <div style={{ borderRadius: 12, border: "1px solid rgba(251,191,36,0.2)", background: "rgba(251,191,36,0.05)", padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>Your privacy is protected</div>
                <p style={{ fontSize: 12, color: "var(--text-2)", margin: 0, lineHeight: 1.6 }}>
                  Your ID is encrypted and used only to verify your identity. It is <strong>never shown to other users</strong> or shared with third parties. Once verified, only the ✓ badge is visible on your profile.
                  {" "}<span style={{ color: "var(--text-3)" }}>Powered by Stripe Identity (coming soon).</span>
                </p>
              </div>
            </div>
          </>
        )}

        {/* ── Step 1: Identity ── */}
        {step === 1 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <AvatarPreview form={form} />
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px", margin: "0 0 6px" }}>Who are you?</h2>
                <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>Basic info shown on your public profile</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <FieldLabel>Profile colour</FieldLabel>
              <div style={{ display: "flex", gap: 8 }}>
                {AVATAR_COLORS.map(c => (
                  <div key={c} onClick={() => set("avatarColor", c)} style={{ width: 28, height: 28, borderRadius: "50%", background: `rgb(${c})`, cursor: "pointer", border: form.avatarColor === c ? "3px solid var(--text-1)" : "3px solid transparent", boxShadow: form.avatarColor === c ? `0 0 0 2px var(--bg), 0 0 0 4px rgb(${c})` : "none", transition: "all 0.15s" }} />
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Input label="First name" placeholder="e.g. Sofia" value={form.firstName} onChange={v => set("firstName", v)} />
              <Input label="Age" placeholder="e.g. 21" value={form.age} onChange={v => set("age", v)} type="number" />
            </div>
            <ChipSelect label="Gender" options={GENDERS} value={form.gender} onChange={v => set("gender", v)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Input label="Nationality" placeholder="e.g. Italian" value={form.nationality} onChange={v => set("nationality", v)} />
              <Input label="Flag emoji" placeholder="e.g. 🇮🇹" value={form.flag} onChange={v => set("flag", v)} />
            </div>
          </>
        )}

        {/* ── Step 2: University ── */}
        {step === 2 && (
          <>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px", margin: "0 0 6px" }}>Your university</h2>
              <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>Shown on your profile so people know where you're studying</p>
            </div>
            <Input label="University name" placeholder="e.g. University of Amsterdam" value={form.university} onChange={v => set("university", v)} />
            <Input label="Programme / degree" placeholder="e.g. International Business" value={form.programme} onChange={v => set("programme", v)} />
            <ChipSelect label="Year of study" options={STUDY_YEARS.map(y => ({ label: y, value: y }))} value={form.studyYear} onChange={v => set("studyYear", v)} />
          </>
        )}

        {/* ── Step 3: Housing needs ── */}
        {step === 3 && (
          <>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px", margin: "0 0 6px" }}>Housing needs</h2>
              <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>Where you're looking and what your budget is</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <FieldLabel>City where you&apos;re searching</FieldLabel>
              <select value={form.city} onChange={e => set("city", e.target.value)} style={{ padding: "13px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: form.city ? "var(--text-1)" : "var(--text-3)", fontSize: 15, outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
                <option value="">Select a city…</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <FieldLabel>Monthly budget (€)</FieldLabel>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="number" placeholder="Min (e.g. 500)" value={form.budgetMin} onChange={e => set("budgetMin", e.target.value)} style={{ flex: 1, padding: "13px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-1)", fontSize: 15, outline: "none", fontFamily: "inherit", transition: "border-color 0.15s" }} onFocus={e => (e.target.style.borderColor = "var(--border-strong)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
                <span style={{ color: "var(--text-3)", fontWeight: 600 }}>–</span>
                <input type="number" placeholder="Max (e.g. 900)" value={form.budgetMax} onChange={e => set("budgetMax", e.target.value)} style={{ flex: 1, padding: "13px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-1)", fontSize: 15, outline: "none", fontFamily: "inherit", transition: "border-color 0.15s" }} onFocus={e => (e.target.style.borderColor = "var(--border-strong)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <FieldLabel>Move-in date</FieldLabel>
              <div style={{ display: "flex", gap: 12 }}>
                <select value={form.moveInMonth} onChange={e => set("moveInMonth", e.target.value)} style={{ flex: 2, padding: "13px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: form.moveInMonth ? "var(--text-1)" : "var(--text-3)", fontSize: 15, outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
                  <option value="">Month…</option>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={form.moveInYear} onChange={e => set("moveInYear", e.target.value)} style={{ flex: 1, padding: "13px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: form.moveInYear ? "var(--text-1)" : "var(--text-3)", fontSize: 15, outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
                  <option value="">Year…</option>
                  {["2025","2026","2027"].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </>
        )}

        {/* ── Step 4: About you ── */}
        {step === 4 && (
          <>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px", margin: "0 0 6px" }}>About you</h2>
              <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>Let potential flatmates know what you're like to live with</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <FieldLabel>Bio ({form.bio.length}/200)</FieldLabel>
              <textarea placeholder="Tell people what you're like. What are your routines? Are you social or prefer quiet evenings? Do you cook a lot?" value={form.bio} maxLength={200} onChange={e => set("bio", e.target.value)} rows={4} style={{ padding: "13px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-1)", fontSize: 14, outline: "none", fontFamily: "inherit", resize: "vertical", lineHeight: 1.6, transition: "border-color 0.15s" }} onFocus={e => (e.target.style.borderColor = "var(--border-strong)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
            </div>
            <TagMultiSelect label="Lifestyle (pick at least 1)" options={LIFESTYLE_TAGS} selected={form.lifestyle} onChange={v => set("lifestyle", v)} emoji />
            <TagMultiSelect label="Languages spoken (pick at least 1)" options={LANGUAGES} selected={form.languages} onChange={v => set("languages", v)} />
          </>
        )}

        {/* ── Step 5: Looking for ── */}
        {step === 5 && (
          <>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px", margin: "0 0 6px" }}>Who are you looking for?</h2>
              <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>Describe your ideal flatmate situation</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <FieldLabel>Looking for ({form.lookingFor.length}/300)</FieldLabel>
              <textarea placeholder="e.g. Looking for a fellow student to share a 2-bedroom flat in Amsterdam. Ideally someone who studies in the morning and doesn't party on weekdays…" value={form.lookingFor} maxLength={300} onChange={e => set("lookingFor", e.target.value)} rows={4} style={{ padding: "13px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-1)", fontSize: 14, outline: "none", fontFamily: "inherit", resize: "vertical", lineHeight: 1.6, transition: "border-color 0.15s" }} onFocus={e => (e.target.style.borderColor = "var(--border-strong)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
            </div>
            <ChipSelect label="Gender preference" options={[{ label: "No preference", value: "no preference" }, { label: "Male", value: "male" }, { label: "Female", value: "female" }, { label: "Non-binary", value: "nonbinary" }]} value={form.genderPreference} onChange={v => set("genderPreference", v)} />
            <div style={{ display: "flex", gap: 16 }}>
              {[
                { key: "smokingOk" as const, emoji: "🚬", label: "Smoking ok", color: "52,211,153" },
                { key: "petsOk"    as const, emoji: "🐾", label: "Pets ok",    color: "251,191,36" },
              ].map(({ key, emoji, label, color }) => (
                <div key={key} onClick={() => set(key, !form[key])} style={{ flex: 1, padding: "14px 16px", borderRadius: 10, cursor: "pointer", border: form[key] ? `1px solid rgba(${color},0.5)` : "1px solid var(--border)", background: form[key] ? `rgba(${color},0.08)` : "var(--surface)", display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s" }}>
                  <span style={{ fontSize: 20 }}>{emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>{label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>{form[key] ? "Yes" : "No"}</div>
                  </div>
                </div>
              ))}
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
              disabled={!canNext[5] || saving}
              style={{ padding: "13px 32px", borderRadius: 12, background: canNext[5] && !saving ? "var(--text-1)" : "var(--border)", color: canNext[5] && !saving ? "var(--bg)" : "var(--text-3)", border: "none", fontSize: 14, fontWeight: 700, cursor: canNext[5] && !saving ? "pointer" : "default", fontFamily: "inherit", transition: "opacity 0.15s" }}
              onMouseEnter={e => { if (canNext[5] && !saving) e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              {saving ? "Saving…" : "Create profile 🎉"}
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
