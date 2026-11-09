import Link from "next/link"
import { POLICY_VERSION } from "@/lib/legal"

export default function PrivacyPage() {
  return <LegalPage title="UniArena Data Policy" version={POLICY_VERSION}>
    <Section n="1" title="Who we are">
      UniArena is a student platform for clubs, societies, sports teams, events, news and messaging at Mount Kenya University. The data controller is [to be confirmed by the university]. You can contact us at [support email].
    </Section>
    <Section n="2" title="What we collect">
      <ul>
        <li><b>Account details:</b> name, university email, registration number, faculty and year of study (optional), and a short bio (optional).</li>
        <li><b>Activity:</b> clubs and teams you join or leave, events you RSVP to, discussion posts, messages you send, and reports you file.</li>
        <li><b>Leave reasons:</b> when you leave a group you may choose a reason. This is optional (see section 5).</li>
        <li><b>Technical data:</b> sign-in times and the security logs needed to keep accounts safe. We do not use advertising trackers.</li>
      </ul>
      We never store your password in readable form. Passwords are kept as one-way hashes.
    </Section>
    <Section n="3" title="Why we collect it">
      To create and secure your account and confirm you are a student (your email must match your registration number). To run the features you use. To keep the community safe through reports, warnings and appeals. To give organisers aggregate insights about group membership.
    </Section>
    <Section n="4" title="Who can see what">
      <ul>
        <li><b>You:</b> everything about your account.</li>
        <li><b>Other students:</b> your name, faculty and bio where a club or team lists you as a member. Never your email, registration number or leave reasons.</li>
        <li><b>Group leaders:</b> the members of their own group, including registration numbers, for group administration.</li>
        <li><b>Administrators:</b> account and moderation records, needed to handle reports and appeals.</li>
        <li><b>Nobody else.</b> We do not sell or share your data for advertising.</li>
      </ul>
    </Section>
    <Section n="5" title="Leave reasons and insights">
      Leave reasons are never shown next to your name. Organisers see only totals, for example "3 members left in 90 days, 2 cited timetable clashes". Leave reasons are never used to make decisions about an individual's standing.
    </Section>
    <Section n="6" title="Messages and reports">
      Messages are private between the two people. An administrator can read messages only as part of a report, and only the last few messages between the two people involved, not your full history.
    </Section>
    <Section n="7" title="How long we keep data">
      Active accounts are kept while you use UniArena. When an account is deleted, its personal details are removed, except records the university must keep for its own purposes. Admin audit logs are kept for [X] years for accountability. Security logs are kept for [X] days.
    </Section>
    <Section n="8" title="Your rights">
      You can view and correct your profile, leave any group, and ask us to delete your account by emailing [support email]. You can appeal any moderation decision from the sign-in page.
    </Section>
    <Section n="9" title="Security">
      Passwords are hashed. In production, data is sent over HTTPS. Administrator actions are logged. Access to live data is limited to named people.
    </Section>
    <Section n="10" title="Where data is hosted">
      [To be completed once the hosting provider and region are confirmed.]
    </Section>
    <Section n="11" title="Changes">
      If we make a material change, we will ask you to accept the new version before you continue using UniArena.
    </Section>
    <p style={{ marginTop: 24 }}><Link href="/legal/terms" style={{ color: "#0B1D3A" }}>Read the Terms of Use</Link></p>
  </LegalPage>
}

export function LegalPage({ title, version, children }: { title: string; version: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F8F7F4", fontFamily: "'Inter', sans-serif", padding: "48px 20px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", background: "white", borderRadius: 16, border: "1px solid #E4E2DC", padding: "40px 44px" }}>
        <Link href="/auth/login" style={{ fontSize: 13, color: "#6B6962", textDecoration: "none" }}>← Back to sign in</Link>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: "#0B1D3A", margin: "16px 0 6px" }}>{title}</h1>
        <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 28 }}>Version {version}</p>
        <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.75 }}>{children}</div>
      </div>
    </div>
  )
}

export function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 22 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0B1D3A", marginBottom: 6 }}>{n}. {title}</h2>
      <div>{children}</div>
    </section>
  )
}