/**
 * Creator verification is stored on the account and returned by the API as `verificationStatus`
 * ("PENDING" | "VERIFIED"). Saving a rate card, profile, avatar or onboarding step never changes
 * it, so nothing here may be fed from a save response's success flag.
 */
export const VERIFICATION = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
};

// Creator payloads (directory rows, /c/:handle, public portfolio, signed-in profile) can nest the
// record under `user` or `creator`. A missing field means PENDING - never assume VERIFIED.
export function verificationStatusOf(...sources) {
  for (const source of sources) {
    const value = source?.verificationStatus
      ?? source?.user?.verificationStatus
      ?? source?.creator?.verificationStatus;
    if (value !== undefined && value !== null && value !== '') {
      return String(value).toUpperCase() === VERIFICATION.VERIFIED
        ? VERIFICATION.VERIFIED
        : VERIFICATION.PENDING;
    }
  }
  return VERIFICATION.PENDING;
}

export const isVerifiedCreator = (source) => verificationStatusOf(source) === VERIFICATION.VERIFIED;
