import { Outlet, useLocation } from 'react-router-dom';

/*
   Every route's content fades and rises in (index.css .page-enter) instead
   of snapping into place. Keyed on the pathname so it re-runs on each
   navigation but not on query-string changes (filters, tabs) - those
   should feel like the same page updating. Honours reduced motion.
*/
export default function PageTransition() {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="page-enter">
      <Outlet />
    </div>
  );
}
