import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * QuickActions
 *
 * Props:
 *   publicUrl: string           - the creator's public profile URL
 *   copyPublicLink: () => Promise<{ success: bool }>
 */
export default function QuickActions({ publicUrl, copyPublicLink }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const result = await copyPublicLink();
    if (result?.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const actions = [
    {
      id: 'edit-rate-card',
      label: 'Edit rate card',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M13 2.5l2.5 2.5-9 9H4V11.5l9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M2 16h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      onClick: () => navigate('/creator/rate-card'),
    },
    {
      id: 'copy-link',
      label: copied ? 'Copied!' : 'Copy public link',
      icon: copied ? (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M3 9l4.5 4.5L15 5" stroke="var(--color-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="6" y="6" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M3 12V3h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      onClick: handleCopy,
      disabled: !publicUrl,
    },
    {
      id: 'view-as-brand',
      label: 'View as brand',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M1.5 9C3 5 5.5 3 9 3s6 2 7.5 6c-1.5 4-4 6-7.5 6S3 13 1.5 9z" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
      onClick: () => publicUrl && window.open(publicUrl, '_blank', 'noopener'),
      disabled: !publicUrl,
    },
    {
      id: 'go-to-money',
      label: 'Go to Money',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="1.5" y="4.5" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="9" cy="9.5" r="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 4.5V3M13 4.5V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      onClick: () => navigate('/creator/money'),
    },
  ];

  return (
    <div className="quick-actions">
      <h3 className="quick-actions__title">Quick actions</h3>
      <ul className="quick-actions__list">
        {actions.map((action) => (
          <li key={action.id}>
            <button
              className="quick-actions__btn"
              onClick={action.onClick}
              disabled={action.disabled}
              aria-label={action.label}
            >
              <span className="quick-actions__icon">{action.icon}</span>
              <span className="quick-actions__label">{action.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}