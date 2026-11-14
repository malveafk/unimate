import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — 4UNI",
  description: "How 4UNI collects, uses and protects your personal data.",
};

// The GDPR requires the policy to say who is responsible for the data.
const CONTROLLERS = "Lorenzo Distefano and Nicolo Malvezzi";
const CONTROLLER_LOCATION = "Luxembourg";
const CONTACT_EMAIL = "admin1@4uni.online";

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

const list: React.CSSProperties = { ...body, paddingLeft: 20, margin: "8px 0 0" };

function Email() {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--text-1)", textDecoration: "underline" }}>
      {CONTACT_EMAIL}
    </a>
  );
}

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px 96px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-1)", marginBottom: 6 }}>
        Privacy Policy
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 32 }}>
        Last updated: 14 November 2026
      </p>

      <p style={body}>
        4UNI (&quot;we&quot;, &quot;us&quot;) helps students find universities and housing
        abroad. This policy explains what personal data we collect, why, who we share it with, and
        the rights you have under the EU General Data Protection Regulation (GDPR).
      </p>

      <h2 style={sectionTitle}>1. Who is responsible for your data</h2>
      <p style={body}>
        4UNI is run by {CONTROLLERS}, private individuals based in {CONTROLLER_LOCATION}, who act
        jointly as the data controllers for 4UNI. You can contact us about anything in this policy
        at <Email />.
      </p>

      <h2 style={sectionTitle}>2. Data we collect</h2>
      <p style={body}>
        <strong>Account data.</strong>{" "}Your email address and, if you sign in with Google, the
        basic profile information Google shares with us (your name and email address). If you
        sign up with a password, we never see or store it in readable form.
        <br />
        <strong>Roommate profile.</strong>{" "}If you create one, the details you choose to give us
        (first name, age, gender, nationality, university, programme, year of study, city, budget,
        move-in date, a short bio, lifestyle and languages, and what you&apos;re looking for in a
        flatmate). Other students can see your profile while it is visible; you can hide or delete
        it at any time from your account page.
        <br />
        <strong>Apartment listings.</strong>{" "}If you post an apartment, the details and the photo you
        upload. Listing photos are stored publicly so anyone browsing 4UNI can see them.
        <br />
        <strong>Identity document.</strong>{" "}To keep the housing community safe, we ask you to upload
        a photo ID (passport, national ID card or driver&apos;s licence) before creating a roommate
        profile or posting an apartment. It is stored in a private storage area, is never shown to
        other users, and is only looked at by us to check your identity and give the ✓ Verified
        badge. We do not currently use an outside verification company.
        <br />
        <strong>Messages.</strong>{" "}Messages you exchange with other users on 4UNI, so we can
        deliver them. Only you and the person you are talking to can read them.
        <br />
        <strong>AI chat.</strong>{" "}Messages you send to the 4UNI assistant, which are sent to
        Anthropic (our AI provider) to generate a reply. If you are signed in, your chats are saved
        so you can come back to them. Please don&apos;t share sensitive personal data in the chat.
        <br />
        <strong>Technical data.</strong>{" "}Your IP address and basic usage events (for example
        &quot;signed in&quot;), used to prevent abuse, apply the daily AI message limit and
        understand how the site is used.
        <br />
        <strong>Stored on your device only.</strong>{" "}Your quiz answers and some layout preferences
        are saved in your browser&apos;s local storage. They never leave your device.
      </p>

      <h2 style={sectionTitle}>3. Minimum age and verification for minors</h2>
      <p style={body}>
        4UNI is available to students aged 16 and over. If you are under 18 and do not have your
        own photo ID for housing verification, we accept a photo ID from a parent or legal
        guardian, together with their confirmation that they consent to your use of the housing
        features.
      </p>

      <h2 style={sectionTitle}>4. Why we use your data</h2>
      <p style={body}>
        We use your data to provide the service you signed up for (performance of a contract,
        art. 6(1)(b) GDPR), to keep the platform safe, check identities and prevent fraud and abuse
        (our legitimate interest, art. 6(1)(f)), and to meet legal obligations (art. 6(1)(c)). We do
        not sell your data and we do not use it for advertising.
      </p>

      <h2 style={sectionTitle}>5. Who we share it with</h2>
      <p style={body}>
        We use the following service providers, who process data on our behalf:
      </p>
      <ul style={list}>
        <li><strong>Supabase</strong>{" "}— database, sign-in and file storage (profiles, listings, messages, photos and ID documents).</li>
        <li><strong>Vercel</strong>{" "}— hosting of the website.</li>
        <li><strong>Google</strong>{" "}— only if you choose &quot;Continue with Google&quot; to sign in.</li>
        <li><strong>Anthropic</strong>{" "}— generates the AI assistant&apos;s replies.</li>
        <li><strong>Esri, OpenStreetMap and unpkg</strong>{" "}— the maps on 4UNI load map images and the map library from these providers, which means your browser shares your IP address with them.</li>
      </ul>
      <p style={{ ...body, marginTop: 12 }}>
        Some of these providers are based in, or may process data in, countries outside the
        European Economic Area (such as the United States). In those cases the transfer is
        covered by the safeguards in their data processing terms, such as the EU Standard
        Contractual Clauses.
      </p>
      <p style={{ ...body, marginTop: 12 }}>
        <strong>Partner listings.</strong>{" "}Some apartments on 4UNI come from housing partners (for
        example ClubHouse and helpHousing). When you open &quot;View full listing&quot; or
        &quot;Chat on WhatsApp&quot;, you leave 4UNI and the partner&apos;s (or WhatsApp&apos;s) own
        privacy policy applies to anything you share with them.
      </p>

      <h2 style={sectionTitle}>6. Cookies</h2>
      <p style={body}>
        4UNI only uses cookies that are strictly necessary to keep you signed in. We do not use
        tracking or advertising cookies, which is why there is no cookie banner.
      </p>

      <h2 style={sectionTitle}>7. How long we keep it</h2>
      <p style={body}>
        We keep your data for as long as your account exists. You can delete your roommate
        profile, your listings or your whole account at any time from your account page. Deleting
        your account permanently removes your profile, listings, photos, messages, AI chats and
        identity documents.
        <br />
        <strong>Identity documents</strong>{" "}are kept for as long as your account exists, so we can
        re-check them if a safety problem is reported, and are deleted together with your account
        (or earlier, if you delete your roommate profile and you have no listings that rely on
        them).
        <br />
        <strong>Technical logs</strong>{" "}are kept only as long as needed for security and abuse
        prevention, and are then deleted.
      </p>

      <h2 style={sectionTitle}>8. Your rights</h2>
      <p style={body}>
        Under the GDPR you can ask to access, correct or delete your personal data, receive a copy
        of it in a portable format, and restrict or object to how we use it. Most of this you can
        do yourself from your account page; for anything else, email us at <Email />. We reply
        within one month. You also have the right to complain to a data protection authority: in
        Luxembourg, the Commission nationale pour la protection des données (CNPD, cnpd.public.lu),
        or the data protection authority of the EU country where you live.
      </p>

      <h2 style={sectionTitle}>9. Changes to this policy</h2>
      <p style={body}>
        If we change how we use your data, we will update this page and change the date at the top.
        Important changes will also be announced on the site.
      </p>
    </div>
  );
}
