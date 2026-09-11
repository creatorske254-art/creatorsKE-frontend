// planGate(user, 'UNLIMITED_RATE_CARDS') → bool
export function planGate(user, feature) {
  return !!user?.plan?.features?.includes(feature);
}
