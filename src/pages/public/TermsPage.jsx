import { Link, useNavigate } from 'react-router-dom';
import { usePageMeta } from '@/lib/usePageMeta';

const SECTIONS = [
  {
    title: '1. Acceptance of these Terms',
    body: [
      'These Terms of Service ("Terms") govern your access to and use of Creatorske, a platform that connects brands with content creators in Kenya ("Creatorske", "we", "us", or "our"). By creating an account, browsing rate cards, or otherwise using the platform, you agree to be bound by these Terms. If you do not agree, you may not use Creatorske.',
      'If you are using Creatorske on behalf of a company or other legal entity, you represent that you have the authority to bind that entity to these Terms.',
    ],
  },
  {
    title: '2. Description of the Service',
    body: [
      'Creatorske provides a marketplace where creators publish rate cards and portfolios, and brands discover creators, send enquiries, and book paid collaborations. Creatorske facilitates the connection and, where applicable, the payment for these collaborations — it does not itself produce, endorse, or guarantee the content created between a brand and a creator.',
    ],
  },
  {
    title: '3. Eligibility & Accounts',
    body: [
      'You must be at least 18 years old, or the age of legal majority in your jurisdiction, to create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.',
      'You agree to provide accurate, current information when registering — including a verifiable business domain for brand accounts — and to keep that information up to date. We may suspend or terminate accounts that fail brand verification or are found to contain false information.',
    ],
  },
  {
    title: '4. Creator & Brand Responsibilities',
    body: [
      'Creators are responsible for the accuracy of their rate cards, portfolios, and social statistics, and for delivering agreed content on time and to the scope described in an accepted enquiry.',
      'Brands are responsible for providing a clear brief, responding to creator communications in good faith, and approving or disputing a delivery within the review window shown on the booking.',
      'Both parties agree to communicate through Creatorske\'s messaging tools for any booking made through the platform, so a record exists if a dispute needs to be reviewed.',
    ],
  },
  {
    title: '5. Enquiries, Bookings & Escrow Payments',
    body: [
      'When a brand sends a paid enquiry, funds are held in escrow by Creatorske (via our licensed payment partners, including M-Pesa and Airtel Money) until the creator marks the deliverable complete and the brand approves it, or the review window lapses without a dispute being raised.',
      'If a brand raises a dispute within the evidence window, Creatorske\'s admin team will review the evidence submitted by both parties and issue a binding decision on how the escrowed funds are released. This process is described further in Section 10.',
    ],
  },
  {
    title: '6. Fees',
    body: [
      'Creatorske charges a platform fee on completed bookings, deducted from the amount released to the creator. Current fee rates and any subscription-plan pricing are shown on our Pricing page and may vary by plan. We will give reasonable notice before changing fee rates that affect existing bookings.',
    ],
  },
  {
    title: '7. Content Ownership & Licensing',
    body: [
      'Unless otherwise agreed in writing between a brand and a creator, the creator retains ownership of the content they produce. A completed booking grants the brand a license to use the delivered content for the purpose and duration described in the booking\'s scope.',
      'By publishing a rate card, portfolio, or review on Creatorske, you grant us a non-exclusive, worldwide license to display that content on the platform for the purpose of operating the marketplace.',
    ],
  },
  {
    title: '8. Reviews & Conduct',
    body: [
      'Reviews must reflect a genuine completed booking. We may remove reviews that are fraudulent, abusive, or that violate a person\'s privacy, and may suspend accounts that repeatedly post such content.',
      'You agree not to harass, discriminate against, or misrepresent yourself to another user of the platform.',
    ],
  },
  {
    title: '9. Prohibited Uses',
    body: [
      'You may not use Creatorske to: circumvent the platform\'s payment or fee system for a booking initiated on Creatorske; impersonate another person or business; upload unlawful, infringing, or fraudulent content; or interfere with the platform\'s normal operation, including through scraping or automated abuse.',
    ],
  },
  {
    title: '10. Disputes & Resolution',
    body: [
      'A dispute over a delivery may be raised by either party during the evidence window shown on the booking. Both parties may submit evidence (messages, files, screenshots). Creatorske\'s admin team will issue a decision on how the escrowed amount is split, which is binding for the purposes of releasing funds held on the platform.',
      'This process addresses disputes over Creatorske-held escrow funds only. It does not limit either party\'s other legal rights.',
    ],
  },
  {
    title: '11. Termination',
    body: [
      'You may close your account at any time from Settings. We may suspend or terminate an account that violates these Terms, fails verification, or poses a risk to other users. Bookings already in progress at the time of termination are handled per Section 10.',
    ],
  },
  {
    title: '12. Disclaimers & Limitation of Liability',
    body: [
      'Creatorske is provided "as is." We do not guarantee the quality, timeliness, or outcome of any collaboration between a brand and a creator — we facilitate the connection and payment, we are not a party to the underlying creative agreement.',
      'To the fullest extent permitted by law, Creatorske\'s liability for any claim arising from your use of the platform is limited to the platform fees you paid in the three months preceding the claim.',
    ],
  },
  {
    title: '13. Governing Law',
    body: [
      'These Terms are governed by the laws of the Republic of Kenya. Any dispute not resolved through Creatorske\'s internal process may be brought before the courts of Kenya.',
    ],
  },
  {
    title: '14. Changes to these Terms',
    body: [
      'We may update these Terms from time to time. We will post the updated Terms with a new "Last updated" date, and, for material changes, notify you by email or an in-app notice. Continuing to use Creatorske after a change takes effect means you accept the revised Terms.',
    ],
  },
  {
    title: '15. Contact Us',
    body: [
      'Questions about these Terms can be sent to legal@creatorske.com.',
    ],
  },
];

export default function TermsPage() {
  usePageMeta('Terms of Service', 'The terms and conditions that govern your use of Creatorske.');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--page-bg)] flex flex-col">
      <style>{`
        .pr-nav-link { font-size:13px; color:var(--grey-600); padding:6px 12px; border-radius:8px; cursor:pointer; font-weight:500; background:none; border:none; font-family:var(--font-body); transition:all .15s; text-decoration:none; }
        .pr-nav-link:hover { color:var(--black); background:var(--grey-50); }
        .pr-btn-ghost { background:transparent; color:var(--grey-600); border-radius:8px; font-size:13px; padding:7px 16px; border:0.5px solid var(--grey-200); cursor:pointer; font-family:var(--font-body); font-weight:500; transition:all .15s; }
        .pr-btn-ghost:hover { color:var(--black); border-color:var(--grey-400); background:var(--grey-50); }
        .pr-btn-purple { background:var(--purple-600); color:#fff; border-radius:8px; font-size:13px; padding:7px 16px; border:none; cursor:pointer; font-family:var(--font-body); font-weight:500; transition:all .15s; }
        .pr-btn-purple:hover { background:var(--purple-700); }
      `}</style>

      {/* Nav */}
      <nav className="h-[60px] flex items-center justify-between px-10 border-b border-[0.5px] border-[var(--grey-100)] bg-white/[0.92] backdrop-blur-md sticky top-0 z-10">
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
      <div className="max-w-[720px] w-full mx-auto px-8 py-16 flex-1">
        <h1 className="font-[var(--font-display)] text-[32px] font-semibold tracking-[-0.02em] text-[var(--black)] mb-2">
          Terms of Service
        </h1>
        <p className="text-[13px] text-[var(--grey-400)] mb-12">Last updated: January 1, 2026</p>

        <div className="flex flex-col gap-10">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="font-[var(--font-display)] text-[18px] font-semibold text-[var(--black)] mb-3">
                {s.title}
              </h2>
              {s.body.map((p, i) => (
                <p key={i} className="text-[14px] leading-[1.75] text-[var(--grey-600)] mb-3 last:mb-0">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>

        <p className="text-[13px] text-[var(--grey-400)] mt-12">
          See also our <Link to="/privacy" className="text-[var(--purple-500)] hover:text-[var(--purple-700)]">Privacy Policy</Link>.
        </p>
      </div>

      {/* Footer */}
      <footer className="px-8 py-5 border-t border-[0.5px] border-[var(--grey-100)] bg-white flex items-center justify-between flex-wrap gap-2 text-[12px] text-[var(--grey-400)]">
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
