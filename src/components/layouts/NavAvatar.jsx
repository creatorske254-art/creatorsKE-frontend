import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import SmartImage from '@/components/ui/SmartImage';

/*
   The navbar's account circle, shared by the three dashboard layouts.
   Shows the profile photo when the account has one, otherwise initials
   worked out from whatever the user object carries (name, company, or the
   email's local part) - never a "?" for a signed-in user. It links to the
   Profile tab of that role's settings.
*/
function initialsFor(user) {
  if (!user) return '';
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    || user.name || user.fullName || user.displayName || user.companyName || user.brandName || '';
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  const local = (user.email ?? '').split('@')[0].replace(/[^a-z0-9]/gi, '');
  return local.slice(0, 2).toUpperCase();
}

export default function NavAvatar() {
  const { user, role } = useAuth();
  const href = role === 'admin' ? '/admin/settings?tab=profile' : `/${role}/settings?tab=profile`;
  const photo = user?.avatar ?? user?.avatarUrl ?? user?.photoUrl ?? user?.logoUrl ?? null;
  const initials = initialsFor(user);
  return (
    <Link to={href} className="nav-avatar" title="Your profile" aria-label="Your profile and settings">
      <SmartImage src={photo} fallback={initials} />
    </Link>
  );
}
