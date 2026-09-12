import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconCheck, IconCopy, IconEye, IconPencil, IconWallet } from '@tabler/icons-react';

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
        <IconPencil className="icon-md" aria-hidden="true" />
      ),
      onClick: () => navigate('/creator/rate-card'),
    },
    {
      id: 'copy-link',
      label: copied ? 'Copied!' : 'Copy public link',
      icon: copied ? (
        <IconCheck className="icon-md" style={{ color: 'var(--status-success)' }} aria-hidden="true" />
      ) : (
        <IconCopy className="icon-md" aria-hidden="true" />
      ),
      onClick: handleCopy,
      disabled: !publicUrl,
    },
    {
      id: 'view-as-brand',
      label: 'View as brand',
      icon: (
        <IconEye className="icon-md" aria-hidden="true" />
      ),
      onClick: () => publicUrl && window.open(publicUrl, '_blank', 'noopener'),
      disabled: !publicUrl,
    },
    {
      id: 'go-to-money',
      label: 'Go to Money',
      icon: (
        <IconWallet className="icon-md" aria-hidden="true" />
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