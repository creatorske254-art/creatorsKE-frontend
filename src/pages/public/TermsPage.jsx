import { Link, useNavigate } from 'react-router-dom';
import { usePageMeta } from '@/lib/usePageMeta';

const SECTIONS = [
  {
    title: '1. Introduction and Platform Role',
    body: [
      'Creators KE operates strictly as a digital marketplace and technological intermediary connecting brand advertisers ("Brands") with digital content creators ("Creators"). Creators KE provides infrastructure for discovery, campaign management, messaging, and escrow protection. Creators KE is not an employer, talent agency, publisher, or joint venture partner to any user.',
    ],
  },
  {
    title: '2. Independent Direct Contracts',
    body: [
      'All campaign briefs, deliverables, timelines, and payment terms agreed upon between a Brand and a Creator constitute a direct legal contract strictly between those two parties. Creators KE is not a party to, bound by, or liable under any contract signed or established between a Brand and a Creator.',
    ],
  },
  {
    title: '3. Dispute Resolution and Platform Intervention',
    body: [
      'Creators KE will not actively interfere in ongoing campaign communications or creative direction. Platform intervention is limited strictly to non-binding administrative mediation subject to the following rules:',
    ],
    list: [
      'Waiting Period: The dispute must remain unresolved between the Brand and Creator for a minimum of 14 calendar days despite direct, good-faith negotiation.',
      'Formal Ticket Submission: Either party must submit a formal support ticket including the original brief, written platform chat history, and proof of work.',
      'Binding Escrow Adjudication: Where funds are held in platform escrow, both parties agree that Creators KE\'s administrative ruling regarding the release or refund of escrow funds is final and binding within the platform ecosystem.',
    ],
  },
  {
    title: '4. Off-Platform Transactions and Forfeiture of Protection',
    body: [
      'All negotiations, communications (including exchange of phone numbers, emails, or personal handles), content submissions, and payments must take place exclusively on Creators KE.',
    ],
    list: [
      'Automatic Voiding: Exchanging contact information or transferring funds off-platform automatically and permanently voids all platform protections, including Creators KE Legal Guard and Escrow Protection.',
      'No Money Recovery: If a Brand conducts business outside the platform and the Creator fails to deliver work, posts subpar content, or defaults on agreement terms, Creators KE will not intervene, mediate, or assist in recovering lost funds.',
      'Account Sanctions: Circumventing the platform may result in immediate suspension or permanent termination of both Brand and Creator accounts.',
    ],
  },
  {
    title: '5. Tax Obligations and Statutory Deductions',
    body: [
      'Creators KE is a software provider and is not a payment proxy, employer, or designated tax withholding agent for any transaction facilitated on the platform.',
    ],
    list: [
      'Brand Responsibility (Withholding Tax): Under the Kenya Income Tax Act, the Brand bears sole legal responsibility for withholding the applicable statutory Withholding Tax (WHT) - currently 5% for resident creators and 20% for non-resident creators - from the gross payment and remitting it directly to the Kenya Revenue Authority (KRA). The Brand is required to generate and issue an official KRA WHT Certificate to the Creator.',
      'Creator Responsibility: Creators are independent contractors responsible for filing their annual income tax returns with KRA and accounting for any additional tax liabilities.',
      'Tax Indemnification: Neither Brands nor Creators shall hold Creators KE liable for unremitted taxes, KRA audits, penalties, or interest. Users agree to defend and hold harmless Creators KE against any tax claims arising from platform agreements.',
    ],
  },
  {
    title: '6. Intellectual Property Rights',
    list: [
      'Ownership: Creators retain full ownership of all original content until full and final payment is released from platform escrow.',
      'License Transfer: Upon full disbursement of agreed funds, the Brand receives licensing and usage rights to the content strictly as defined in the accepted campaign brief.',
      'Prohibited Content: Users must not create or publish content that violates third-party copyright, trademark, or Kenyan statutory regulations.',
    ],
  },
  {
    title: '7. Limitation of Liability',
    body: [
      'To the maximum extent permitted by the laws of Kenya, Creators KE shall not be liable for any direct, indirect, incidental, or consequential damages resulting from lost profits, breach of contract by platform users, campaign delays, or unsatisfactory creative deliverables.',
    ],
  },
  {
    title: '8. Account Termination',
    body: [
      'Creators KE reserves the right to modify, suspend, or terminate user access at any time for violations of these Terms, fraudulent activity, off-platform payment solicitation, or abusive behavior toward other users.',
    ],
  },
];

export default function TermsPage() {
  usePageMeta('Terms of Service', 'The terms and conditions that govern your use of Creatorske.');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--page-bg)] flex flex-col">
      <style>{`
        .pr-nav-link { font-size:13px; color:var(--grey-600); padding:var(--space-8) var(--space-12); border-radius:8px; cursor:pointer; font-weight:500; background:none; border:none; font-family:var(--font-body); transition:all .15s; text-decoration:none; }
        .pr-nav-link:hover { color:var(--black); background:var(--grey-50); }
        .pr-btn-ghost { background:transparent; color:var(--grey-600); border-radius:8px; font-size:13px; padding:var(--space-8) var(--space-16); border:0.5px solid var(--grey-200); cursor:pointer; font-family:var(--font-body); font-weight:500; transition:all .15s; }
        .pr-btn-ghost:hover { color:var(--black); border-color:var(--grey-400); background:var(--grey-50); }
        .pr-btn-purple { background:var(--purple-600); color:#fff; border-radius:8px; font-size:13px; padding:var(--space-8) var(--space-16); border:none; cursor:pointer; font-family:var(--font-body); font-weight:500; transition:all .15s; }
        .pr-btn-purple:hover { background:var(--purple-700); }
      `}</style>

      {/* Nav */}
      <nav className="h-[60px] flex items-center justify-between px-[var(--gutter-public)] border-b border-[var(--grey-100)] bg-white/[0.92] backdrop-blur-md sticky top-0 z-10">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="font-[var(--font-display)] text-[20px] font-semibold tracking-[-0.01em] text-[var(--black)]"
        >
          Creatorske<span className="text-[var(--purple-500)]">.</span>
        </button>
        <div className="hidden md:flex gap-1">
          <Link className="pr-nav-link" to="/directory">Browse creators</Link>
          <Link className="pr-nav-link" to="/pricing">Pricing</Link>
        </div>
        <div className="flex items-center gap-2">
          <Link className="pr-btn-ghost" to="/login">Log in</Link>
          <Link className="pr-btn-purple" to="/signup">Get started</Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-[720px] w-full mx-auto px-[var(--gutter-public)] py-16 flex-1">
        <h1 className="font-[var(--font-display)] text-[32px] font-semibold tracking-[-0.02em] text-[var(--black)] mb-2">
          Terms of Service
        </h1>
        <p className="text-[13px] text-[var(--grey-400)] mb-12">Last updated: September 27, 2026</p>

        <div className="flex flex-col gap-10">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="font-[var(--font-display)] text-[18px] font-semibold text-[var(--black)] mb-3">
                {s.title}
              </h2>
              {s.body?.map((p, i) => (
                <p key={i} className="text-[14px] leading-[1.75] text-[var(--grey-600)] mb-3 last:mb-0">
                  {p}
                </p>
              ))}
              {s.list && (
                <ol className="list-decimal pl-5 flex flex-col gap-2 mt-1">
                  {s.list.map((item, i) => (
                    <li key={i} className="text-[14px] leading-[1.75] text-[var(--grey-600)]">
                      {item}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </div>

        <p className="text-[13px] text-[var(--grey-400)] mt-12">
          See also our <Link to="/privacy" className="text-[var(--purple-500)] hover:text-[var(--purple-700)]">Privacy Policy</Link>.
        </p>
      </div>

      {/* Footer */}
      <footer className="px-[var(--gutter-public)] py-5 border-t border-[var(--grey-100)] bg-white flex items-center justify-between flex-wrap gap-2 text-[12px] text-[var(--grey-400)]">
        <div className="font-[var(--font-display)] text-[14px] text-[var(--black)]">
          Creatorske<span className="text-[var(--purple-500)]">.</span>
        </div>
        <div>© 2026 Creatorske. All rights reserved.</div>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-[var(--black)]">Privacy</Link>
          <Link to="/terms" className="hover:text-[var(--black)]">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
