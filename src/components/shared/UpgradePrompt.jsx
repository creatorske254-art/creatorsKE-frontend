import { useNavigate } from 'react-router-dom';
import { IconLock, IconRocket } from '@tabler/icons-react';

/**
 * UpgradePrompt
 * @param {string} [feature]     - human-readable feature name e.g. "Unlimited Rate Cards"
 * @param {string} [requiredPlan] - "Pro" | "Business"
 * @param {'inline'|'card'} [variant] - inline is compact, card has more padding
 */
export default function UpgradePrompt({
  feature,
  requiredPlan = 'Pro',
  variant = 'card',
}) {
  const navigate = useNavigate();

  const isCard = variant === 'card';

  return (
    <div
      style={{
        background: 'var(--purple-50)',
        border: '0.5px solid var(--purple-200)',
        borderRadius: isCard ? 'var(--radius-lg)' : 'var(--radius-md)',
        padding: isCard ? '20px' : '12px 16px',
        display: 'flex',
        alignItems: isCard ? 'flex-start' : 'center',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: isCard ? '36px' : '28px',
          height: isCard ? '36px' : '28px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--purple-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <IconLock size={isCard ? 16 : 13} style={{ color: 'var(--purple-600)' }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: isCard ? '15px' : '13px',
            fontWeight: 600,
            color: 'var(--purple-800)',
            marginBottom: '4px',
          }}
        >
          {feature ? `${feature} is a ${requiredPlan} feature` : `${requiredPlan} plan required`}
        </div>
        {isCard && (
          <div
            style={{
              fontSize: '13px',
              color: 'var(--purple-600)',
              lineHeight: 1.55,
              marginBottom: '14px',
            }}
          >
            Upgrade to {requiredPlan} to unlock this and more premium features.
          </div>
        )}
        <button
          onClick={() => navigate('/pricing')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: isCard ? '8px 16px' : '5px 12px',
            fontSize: isCard ? '13px' : '12px',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            background: 'var(--purple-500)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
          }}
        >
          <IconRocket size={13} />
          Upgrade to {requiredPlan}
        </button>
      </div>
    </div>
  );
}