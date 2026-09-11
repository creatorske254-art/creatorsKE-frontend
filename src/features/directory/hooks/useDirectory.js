import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchCreators, getFilterOptions } from '../services/directory.service';

const DEFAULT_FILTERS = {
  keyword: '',
  niche: '',
  platform: '',
  followerRange: '',
  location: '',
  availability: '',
  page: 1,
};

/**
 * Manages directory state: filters, debounced keyword search, and paginated results.
 */
export function useDirectory() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const keywordTimer = useRef(null);

  // Debounce keyword by 400ms
  useEffect(() => {
    clearTimeout(keywordTimer.current);
    keywordTimer.current = setTimeout(() => {
      setDebouncedKeyword(filters.keyword);
    }, 400);
    return () => clearTimeout(keywordTimer.current);
  }, [filters.keyword]);

  const activeFilters = { ...filters, keyword: debouncedKeyword };

  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['directory', activeFilters],
    queryFn: () => searchCreators(activeFilters),
    keepPreviousData: true,
    staleTime: 30_000,
  });

  const { data: filterOptions } = useQuery({
    queryKey: ['directory-filter-options'],
    queryFn: getFilterOptions,
    staleTime: 5 * 60_000,
  });

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // reset to page 1 whenever a filter changes (but not pagination itself)
      page: key === 'page' ? value : 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    creators: data?.creators ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    isFetching,
    error,
    filters,
    filterOptions: filterOptions ?? { niches: [], platforms: [] },
    updateFilter,
    resetFilters,
  };
}
