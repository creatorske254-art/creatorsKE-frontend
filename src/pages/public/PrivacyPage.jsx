import { Link, useNavigate } from 'react-router-dom';
import { usePageMeta } from '@/lib/usePageMeta';

const SECTIONS = [
  {
    title: '1. Compliance Statement',
    body: [
      'Creators KE is committed to protecting user privacy and processing personal data in full compliance with the Data Protection Act (2019) of Kenya, the Computer Misuse and Cybercrimes Act (2018), and applicable regulatory frameworks.',
    ],
  },
  {
    title: '2. Information We Collect',
    body: [
      'We collect personal and professional information necessary to facilitate platform connections and campaign operations, including:',
    ],
    list: [
      'Account Registration Data: Full name, business name, phone number, email address, physical location, and password.',
      'Identity & Human Verification Data (Video Selfie): A short (approximately 5-second) self-recorded video clip submitted during account creation or profile verification. This is collected to confirm human identity, prevent catfishing, eliminate bot registrations, and verify that the individual creating the account is the genuine owner of the associated social media handles.',
      'Creator Profile Data: Social media account handles, follower counts, engagement analytics, audience demographics, content portfolios, and statutory KRA PIN details.',
      'Financial & Payment Data: Bank account numbers, Mobile Money (M-PESA) details, billing addresses, and invoice history.',
      'Usage & Technical Data: IP addresses, browser types, device identifiers, and platform activity logs.',
    ],
  },
  {
    title: '3. How We Use Your Information',
    body: [
      'Creators KE uses collected data strictly for operational purposes, including:',
    ],
    list: [
      'Human Verification & Anti-Impersonation: Reviewing submitted 5-second verification videos by authorized human moderators to confirm creator authenticity and protect the platform ecosystem against catfish accounts, bots, and impersonation.',
      'Account & Waitlist Management: Creating and managing user accounts, platform roles, and waitlist access.',
      'Brand-Creator Matching: Recommending suitable Creators to Brands based on verified profile analytics and portfolio history.',
      'Payment & Escrow Administration: Processing payment transactions, managing escrow releases, and verifying campaign completion.',
      'Dispute & Support Resolution: Facilitating platform communications and investigating reported support tickets.',
      'Regulatory & Tax Compliance: Complying with statutory requirements under Kenyan law, including tax recordkeeping and data protection regulations.',
    ],
  },
  {
    title: '4. Video Verification Safeguards and Moderator Confidentiality',
    list: [
      'Human Review Only: Verification videos are reviewed strictly by authorized Creators KE internal moderators for identity cross-checking against linked creator handles.',
      'Non-Public Display: Verification videos are strictly private internal security records. They are never published publicly, displayed on Creator public profiles, or shared with Brands or external third parties.',
      'Secure Storage: Verification videos are encrypted in transit and at rest using industry-standard security protocols.',
    ],
  },
  {
    title: '5. Information Sharing and Disclosure',
    body: [
      'Creators KE does not sell, rent, or monetize your personal data or verification recordings to third parties. Data is shared only under the following limited circumstances:',
    ],
    list: [
      'Between Platform Users: Essential public profile information, portfolios, and campaign statistics are shared between Brands and Creators to facilitate campaign matching. (Verification videos are excluded).',
      'Third-Party Service Providers: Verified payment processors, SMS/email delivery providers, and secure cloud hosting partners who operate under strict confidentiality agreements.',
      'Legal and Regulatory Authorities: Disclosure to law enforcement or tax authorities (such as the Kenya Revenue Authority) when strictly required by a court order, statutory requirement, or legal process.',
    ],
  },
  {
    title: '6. Data Security and Escrow Safeguards',
    body: [
      'We implement robust administrative, technical, and physical security measures - including SSL encryption, restricted access controls, and secure database hosting - to protect your personal information and verification media against unauthorized access, loss, or alteration.',
    ],
  },
  {
    title: '7. Data Retention',
    body: [
      'We retain personal data for as long as your account remains active or as required to fulfill platform services.',
      'Verification video files are retained only for as long as necessary to complete account verification and prevent identity re-use by fraudulent actors.',
      'Financial transaction records are retained for the statutory period mandated by Kenyan business and tax recordkeeping laws.',
    ],
  },
  {
    title: '8. Your Statutory Rights Under Kenyan Law',
    body: [
      'Subject to the Kenya Data Protection Act (2019), users have the following rights regarding their personal data:',
    ],
    list: [
      'Right to Access: Request a copy of the personal data held by Creators KE.',
      'Right to Rectification: Request correction of inaccurate or incomplete personal records.',
      'Right to Erasure: Request deletion of personal data or verification media where retention is no longer legally required.',
      'Right to Object: Object to processing of data for direct marketing purposes.',
    ],
  },
  {
    title: '9. Privacy Policy Updates',
    body: [
      'Creators KE reserves the right to update this Privacy Policy as our platform evolves. Any material changes will be communicated via email or prominent site notice prior to taking effect.',
    ],
  },
  {
    title: '10. Contact Information',
    body: [
      'For questions regarding these Terms, Privacy Policy, or data protection practices, please contact the Creators KE Data Protection Officer / Support Team at support@creatorske.com.',
    ],
  },
];

export default function PrivacyPage() {
  usePageMeta('Privacy Policy', 'How Creatorske collects, uses, and protects your information.');
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
          Privacy Policy
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
          See also our <Link to="/terms" className="text-[var(--purple-500)] hover:text-[var(--purple-700)]">Terms of Service</Link>.
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
