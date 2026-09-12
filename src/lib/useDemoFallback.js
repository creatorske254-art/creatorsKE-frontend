import { useMemo } from 'react';

/**
 * Sample data for a query the backend can't serve yet - dev builds only.
 *
 * Many dashboard endpoints are specified (BACKEND_API_SPEC.md) but not built.
 * In a production build those sections show their honest error/empty state.
 * In a dev build, when the query has *errored* (unreachable API, 404 on an
 * unbuilt route), the sample is substituted so the design is reviewable, and
 * `isDemo` is true so the block can render <DemoTag />. A query that succeeds
 * with no rows is a real empty state and is never replaced.
 *
 * @param {{ data, isError, isLoading }} query - a TanStack query result
 * @param {*} sample - what to show instead
 * @returns {{ data, isDemo, isLoading }}
 */
export function useDemoFallback(query, sample) {
  const isDemo = Boolean(import.meta.env.DEV && query?.isError);
  const data = isDemo ? sample : query?.data;
  return useMemo(() => ({ data, isDemo, isLoading: Boolean(query?.isLoading) }), [data, isDemo, query?.isLoading]);
}
