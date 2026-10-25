import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/features/auth/services/auth.service';

export function useUsernameAvailability(username) {
  const normalizedUsername = username.trim();
  const [debouncedUsername, setDebouncedUsername] = useState('');

  useEffect(() => {
    if (!normalizedUsername) {
      setDebouncedUsername('');
      return undefined;
    }

    const timeout = setTimeout(() => setDebouncedUsername(normalizedUsername), 300);
    return () => clearTimeout(timeout);
  }, [normalizedUsername]);

  const query = useQuery({
    queryKey: ['username-availability', debouncedUsername],
    queryFn: ({ signal }) => authService.checkUsername(debouncedUsername, signal),
    enabled: Boolean(debouncedUsername),
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const isCurrentValue = normalizedUsername === debouncedUsername;

  return {
    availability: isCurrentValue ? query.data : undefined,
    error: isCurrentValue ? query.error : null,
    isChecking: Boolean(normalizedUsername) && (!isCurrentValue || query.isFetching),
    retry: query.refetch,
  };
}
