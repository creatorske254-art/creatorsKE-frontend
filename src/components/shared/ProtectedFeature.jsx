import { useAuth } from '@/context/AuthContext';
import UpgradePrompt from './UpgradePrompt';

const PLAN_RANK = { starter: 0, pro: 1, business: 2 };

/**
 * ProtectedFeature — renders children if user's plan meets the requirement,
 * otherwise shows UpgradePrompt.
 *
 * @param {'pro'|'business'} requiredPlan
 * @param {string} [feature]  - human-readable feature name for the prompt
 * @param {'inline'|'card'} [promptVariant]
 * @param {React.ReactNode} children
 */
export default function ProtectedFeature({
  requiredPlan = 'pro',
  feature,
  promptVariant = 'card',
  children,
}) {
  const { user } = useAuth();
  const userPlan = user?.plan?.toLowerCase() ?? 'starter';
  const hasAccess = PLAN_RANK[userPlan] >= PLAN_RANK[requiredPlan.toLowerCase()];

  if (hasAccess) return children;

  return (
    <UpgradePrompt
      feature={feature}
      requiredPlan={requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}
      variant={promptVariant}
    />
  );
}