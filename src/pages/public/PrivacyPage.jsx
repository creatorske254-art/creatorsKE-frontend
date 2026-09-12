import { Link, useNavigate } from 'react-router-dom';
import { usePageMeta } from '@/lib/usePageMeta';

const SECTIONS = [
  {
    title: '1. Introduction',
    body: [
      'This Privacy Policy explains how Creatorske ("we", "us", or "our") collects, uses, and protects your information when you use our platform to connect brands with content creators in Kenya. By using Creatorske, you agree to the collection and use of information as described here.',
    ],
  },
  {
    title: '2. Information We Collect',
    body: [
      'Account information: your name, email address, phone number, and password when you register, plus your role (creator, brand, or admin).',
      'Profile information: rate card details, portfolio content, social media statistics, business domain (for brands), and any other information you choose to add to your profile.',
      'Booking information: enquiries, messages, package selections, and delivery files exchanged through the platform.',
      'Payment information: M-Pesa/Airtel Money transaction references and payout details, processed through our licensed payment partners. We do not store your full payment credentials ourselves.',
      'Usage information: log data such as IP address, browser type, device information, and how you interact with the platform, collected automatically.',
    ],
  },
  {
    title: '3. How We Use Your Information',
    body: [
      'We use your information to: operate the marketplace (matching brands with creators, processing enquiries and bookings); process payments and hold funds in escrow; verify brand and creator accounts; send transactional notifications (enquiries, payment confirmations, delivery reminders); resolve disputes; and improve and secure the platform.',
    ],
  },
  {
    title: '4. Payment Information',
    body: [
      'Payments are processed through licensed third-party payment providers (including M-Pesa and Airtel Money). Creatorske receives confirmation of a transaction but does not store your mobile money PIN or full payment credentials. Escrowed funds are held per the terms described in our Terms of Service.',
    ],
  },
  {
    title: '5. Sharing Your Information',
    body: [
      'We share information with the other party to a booking as necessary to complete it (e.g., a brand sees the creator\'s contact and delivery information for a booking they\'ve made, and vice versa).',
      'We share information with payment processors to complete transactions, and with service providers who help us operate the platform (e.g., hosting, analytics), under confidentiality obligations.',
      'We do not sell your personal information. We may disclose information if required by law or to protect the rights, safety, or property of Creatorske or our users.',
    ],
  },
  {
    title: '6. Cookies & Tracking',
    body: [
      'We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how the platform is used. You can control cookies through your browser settings, though some features may not work correctly if you disable them.',
    ],
  },
  {
    title: '7. Data Retention',
    body: [
      'We retain your information for as long as your account is active, or as needed to provide the service, comply with our legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your account as described in Section 8.',
    ],
  },
  {
    title: '8. Your Rights',
    body: [
      'Under the Kenya Data Protection Act, 2019, you have the right to access, correct, or request deletion of your personal data, to object to certain processing, and to lodge a complaint with the Office of the Data Protection Commissioner. You can access and update most of your information directly from your account Settings, or contact us using the details in Section 11 to make a request.',
    ],
  },
  {
    title: "9. Children's Privacy",
    body: [
      'Creatorske is not directed at individuals under 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will take steps to delete it.',
    ],
  },
  {
    title: '10. Security',
    body: [
      'We use industry-standard technical and organizational measures to protect your information, including encrypted connections and access controls. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.',
    ],
  },
  {
    title: '11. Changes to this Policy',
    body: [
      'We may update this Privacy Policy from time to time. We will post the updated policy with a new "Last updated" date, and, for material changes, notify you by email or an in-app notice.',
    ],
  },
  {
    title: '12. Contact Us',
    body: [
      'Questions about this Privacy Policy, or requests regarding your personal data, can be sent to privacy@creatorske.com.',
    ],
  },
];

export default function PrivacyPage() {
  usePageMeta('Privacy Policy', 'How Creatorske collects, uses, and protects your information.');
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
          Privacy Policy
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
          See also our <Link to="/terms" className="text-[var(--purple-500)] hover:text-[var(--purple-700)]">Terms of Service</Link>.
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
