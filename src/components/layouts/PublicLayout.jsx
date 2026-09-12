import PageTransition from './PageTransition'

// Intentionally minimal - every page rendered inside this layout (Home,
// Directory, RateCard, Pricing, ...) builds its own full nav/footer inline.
export default function PublicLayout() {
  return <PageTransition />
}
