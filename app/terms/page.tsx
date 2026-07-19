import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — 4UNI",
  description: "The terms that govern your use of 4UNI.",
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

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px 96px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-1)", marginBottom: 6 }}>
        Terms of Service
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 32 }}>
        Last updated: 18 July 2026
      </p>

      <p style={body}>
        These terms govern your use of 4UNI, a platform that helps students explore
        universities abroad, get guidance from an AI assistant, and find housing and roommates. By
        using 4UNI you agree to these terms.
      </p>

      <h2 style={sectionTitle}>1. The service</h2>
      <p style={body}>
        4UNI provides information about universities, study programs, costs and student life,
        an AI-powered assistant, and a housing section where students can publish profiles and
        listings and message each other. The service is free; some features may become paid in the
        future, in which case pricing will be clearly communicated before you are charged.
      </p>

      <h2 style={sectionTitle}>2. Information accuracy — no guarantees</h2>
      <p style={body}>
        University data (tuition fees, deadlines, programs, subsidies) changes frequently and may
        be incomplete or out of date. The AI assistant can make mistakes. 4UNI is an
        orientation tool, not official advice: always verify critical information (deadlines,
        fees, admission requirements, visa and legal matters) directly with the university or the
        competent authority before making decisions.
      </p>

      <h2 style={sectionTitle}>3. Housing and interactions between users</h2>
      <p style={body}>
        Housing profiles and listings are published by users. 4UNI does not verify identities,
        listings, or the accuracy of what users publish, and is not a party to any agreement you
        make with other users. Never send money to someone you have not verified, and always view
        a room or apartment (in person or by live video) before paying anything.
      </p>

      <h2 style={sectionTitle}>4. Your account and conduct</h2>
      <p style={body}>
        You must provide accurate information and keep your credentials secure. You may not use
        4UNI to harass others, publish false listings, send spam, scrape the platform, or
        attempt to disrupt the service. We may suspend or delete accounts that violate these
        rules.
      </p>

      <h2 style={sectionTitle}>5. Fair use of the AI assistant</h2>
      <p style={body}>
        The AI assistant has a daily free message limit per user. Automated or abusive use (bots,
        bulk requests) is not allowed.
      </p>

      <h2 style={sectionTitle}>6. Liability</h2>
      <p style={body}>
        To the maximum extent permitted by law, 4UNI is provided &quot;as is&quot; and we are
        not liable for decisions made based on information found on the platform, for
        interactions or agreements between users, or for temporary unavailability of the service.
        Nothing in these terms limits liability that cannot be limited under applicable law.
      </p>

      <h2 style={sectionTitle}>7. Changes</h2>
      <p style={body}>
        We may update these terms as the product evolves. Material changes will be announced on
        the site. Continuing to use 4UNI after a change means you accept the updated terms.
      </p>

      <h2 style={sectionTitle}>8. Contact</h2>
      <p style={body}>
        Questions about these terms:{" "}
        <a href="mailto:nixonmalvezzi@gmail.com" style={{ color: "var(--text-1)", textDecoration: "underline" }}>
          nixonmalvezzi@gmail.com
        </a>
        .
      </p>
    </div>
  );
}
