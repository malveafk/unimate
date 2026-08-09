import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — 4UNI",
  description: "How 4UNI collects, uses and protects your personal data.",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: "var(--text-1)",
  marginTop: 36,
  marginBottom: 10,
};

const body: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.7,
  color: "var(--text-2)",
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px 96px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-1)", marginBottom: 6 }}>
        Privacy Policy
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 32 }}>
        Last updated: 18 July 2026
      </p>

      <p style={body}>
        4UNI (&quot;we&quot;, &quot;us&quot;) helps students find universities and housing
        abroad. This policy explains what personal data we collect, why, and the rights you have
        under the EU General Data Protection Regulation (GDPR).
      </p>

      <h2 style={sectionTitle}>1. Data we collect</h2>
      <p style={body}>
        <strong>Account data.</strong> When you sign up we store your email address and, if you use
        Google sign-in, the basic profile information Google shares (name and email).
        <br />
        <strong>Housing profile.</strong> If you create a housing profile, we store the details you
        choose to provide (name, age, university, city, budget, preferences, photo) so other
        students can find you as a roommate.
        <br />
        <strong>Identity verification document.</strong> To keep the housing community safe, we
        ask you to upload a photo ID (passport, national ID card, or driver&apos;s licence) before
        your roommate profile goes live. This document is stored securely, is never shown to other
        users, and is used only to confirm your identity and issue the ✓ Verified badge. Once we
        add a third-party verification provider, that provider will be named here and will act as
        an additional processor of this document under its own data processing agreement with us.
        <br />
        <strong>Messages.</strong> Conversations you have with other users through 4UNI are
        stored so we can deliver them.
        <br />
        <strong>AI chat.</strong> Messages you send to the 4UNI assistant are processed by
        Anthropic (our AI provider) to generate a reply. Do not include sensitive personal data in
        the chat.
        <br />
        <strong>Technical data.</strong> We log IP addresses and basic usage events to prevent
        abuse (rate limiting, daily message caps) and to understand how the product is used.
      </p>

      <h2 style={sectionTitle}>2. Minimum age and verification for minors</h2>
      <p style={body}>
        4UNI is available to students aged 16 and over. If you are under 18 and are not able to
        provide your own photo ID for housing verification, we will instead accept a photo ID from
        a parent or legal guardian, together with their confirmation that they consent to your use
        of the housing features. This is in addition to, not instead of, the standard identity
        check described above.
      </p>

      <h2 style={sectionTitle}>3. Why we process it</h2>
      <p style={body}>
        We process your data to provide the service (contract, art. 6.1.b GDPR), to keep the
        platform secure and prevent abuse (legitimate interest, art. 6.1.f), and to comply with
        legal obligations (art. 6.1.c). We do not sell your data and we do not use it for
        advertising.
      </p>

      <h2 style={sectionTitle}>4. Where your data lives</h2>
      <p style={body}>
        Data is stored with Supabase (our database and authentication provider). AI chat messages
        are processed by Anthropic. Both act as processors on our behalf under their respective
        data processing agreements. Identity verification documents are currently reviewed by our
        team directly; we plan to introduce a specialised third-party verification provider, which
        will be named here once selected.
      </p>

      <h2 style={sectionTitle}>5. Cookies</h2>
      <p style={body}>
        4UNI only uses cookies that are strictly necessary to keep you signed in
        (authentication session cookies). We do not use tracking or advertising cookies, which is
        why you do not see a cookie banner.
      </p>

      <h2 style={sectionTitle}>6. Retention</h2>
      <p style={body}>
        We keep your data for as long as your account exists. If you delete your account, your
        profile, housing profile and messages are deleted. Identity verification documents are
        deleted once a review is complete and are not kept longer than necessary to confirm your
        identity. Technical logs are kept for a limited period for security purposes and then
        removed.
      </p>

      <h2 style={sectionTitle}>7. Your rights</h2>
      <p style={body}>
        Under the GDPR you can request access to, correction of, or deletion of your personal
        data, ask for a copy in a portable format, restrict or object to processing, and lodge a
        complaint with your local supervisory authority (in Italy, the Garante per la Protezione
        dei Dati Personali).
      </p>

      <h2 style={sectionTitle}>8. Contact</h2>
      <p style={body}>
        For any privacy request, write to{" "}
        <a href="mailto:admin1@4uni.online" style={{ color: "var(--text-1)", textDecoration: "underline" }}>
          admin1@4uni.online
        </a>
        . We reply within 30 days as required by the GDPR.
      </p>
    </div>
  );
}
