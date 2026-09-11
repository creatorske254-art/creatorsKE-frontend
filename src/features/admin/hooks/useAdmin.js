import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';

export function useAdmin() {
  const query = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats(),
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    flaggedReviewCount: query.data?.flaggedReviewCount ?? null,
  };
}
