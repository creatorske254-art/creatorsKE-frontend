import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';

/** Platform KPIs for the admin overview (GET /admin/stats). */
export function useAdmin() {
  const query = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats(),
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    flaggedReviewCount: query.data?.flaggedReviewCount ?? null,
  };
}
