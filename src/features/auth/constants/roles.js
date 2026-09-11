export const ROLES = {
  CREATOR: 'creator',
  BRAND: 'brand',
  ADMIN: 'admin',
};

export const ROLE_HOME = {
  creator: '/creator/dashboard',
  brand: '/brand/dashboard',
  admin: '/admin',
};

// sessionStorage key carrying a post-auth redirect target across the
// signup -> verify-email -> login hop, which can happen in a different
// tab/session than the one that started it -- a query param alone won't
// survive that.
export const POST_AUTH_REDIRECT_KEY = 'creatorske_post_auth_redirect';