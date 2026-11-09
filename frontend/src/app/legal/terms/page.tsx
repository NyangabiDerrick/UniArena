import Link from "next/link"
import { TERMS_VERSION } from "@/lib/legal"
import { LegalPage, Section } from "../privacy/page"

export default function TermsPage() {
  return <LegalPage title="UniArena Terms of Use" version={TERMS_VERSION}>
    <Section n="1" title="Who can use UniArena">
      UniArena is for current students and staff of [university] who have a university email address.
    </Section>
    <Section n="2" title="Your account">
      Keep your password private and use only your own account. Sharing an account is not allowed.
    </Section>
    <Section n="3" title="Acceptable behaviour">
      Respect other members. No harassment, hate speech, threats, spam, impersonation, or content that breaks the law.
    </Section>
    <Section n="4" title="Groups and events">
      Group leaders and organisers are responsible for their own events and content. UniArena provides the platform, not the event. We do not guarantee the safety, quality or outcome of any event or activity.
    </Section>
    <Section n="5" title="Reporting and moderation">
      You can report content and people. We review reports and may remove content, warn, or suspend accounts. You may appeal a suspension.
    </Section>
    <Section n="6" title="Content you post">
      You keep ownership of what you post. You give UniArena permission to display it within the platform.
    </Section>
    <Section n="7" title="Limits of liability">
      To the extent the law allows, UniArena is not liable for losses arising from events, from other users' conduct, or from temporary service interruptions. Nothing here limits liability that cannot legally be limited.
    </Section>
    <Section n="8" title="Ending your account">
      We may suspend or end accounts that break these terms. You may ask to delete your account at any time.
    </Section>
    <Section n="9" title="Governing law">
      [To be confirmed with the university. Kenyan law is expected to apply.]
    </Section>
    <Section n="10" title="Changes">
      If we make a material change, we will ask you to accept the new version before you continue.
    </Section>
    <p style={{ marginTop: 24 }}><Link href="/legal/privacy" style={{ color: "#0B1D3A" }}>Read the Data Policy</Link></p>
  </LegalPage>
}