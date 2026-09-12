import { IconStar, IconRocket } from '@tabler/icons-react';

const PLAN_MAP = {
  starter: {
    label: 'Starter',
    icon: null,
    style: {
      background: 'var(--grey-50)',
      color: 'var(--grey-700)',
      border: '0.5px solid var(--grey-200)',
    },
  },
  pro: {
    label: 'Pro',
    icon: IconStar,
    style: {
      background: 'var(--purple-50)',
      color: 'var(--purple-700)',
      border: '0.5px solid var(--purple-200)',
    },
  },
  business: {
    label: 'Business',
    icon: IconRocket,
    style: {
      background: 'var(--black)',
      color: 'var(--white)',
      border: 'none',
    },
  },
};

/**
 * PlanBadge
 * @param {'starter'|'pro'|'business'} plan
 * @param {'sm'|'md'} [size]
 */
export default function PlanBadge({ plan = 'starter', size = 'md' }) {
  const config = PLAN_MAP[plan.toLowerCase()] ?? PLAN_MAP.starter;
  const Icon = config.icon;

  const padding = size === 'sm' ? '3px 8px' : '4px 10px';
  const fontSize = size === 'sm' ? '10px' : '12px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        fontFamily: 'var(--font-body)',
        fontSize,
        fontWeight: 500,
        padding,
        borderRadius: 'var(--radius-pill)',
        lineHeight: 1,
        ...config.style,
      }}
    >
      {Icon && <Icon size={size === 'sm' ? 10 : 12} />}
      {config.label}
    </span>
  );
}