import { useState, useCallback, useMemo } from 'react';
import { getAvailability } from '../lib/api/inventory';
import type { BloodGroup } from '../types/database';

interface SearchFilters {
  blood_group?: BloodGroup | string;
  city?: string;
}

interface SearchResults {
  [bloodGroup: string]: {
    [city: string]: number;
  };
}

interface SearchStats {
  totalUnits: number;
  totalCities: number;
  totalBloodGroups: number;
  mostAvailableBloodGroup: string | null;
  mostAvailableCity: string | null;
}

interface UseSearchPageReturn {
  // Search state
  results: SearchResults | null;
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  
  // Search actions
  handleSearch: (filters: SearchFilters) => Promise<void>;
  clearResults: () => void;
  retry: () => Promise<void>;
  
  // Computed data
  searchStats: SearchStats;
  isEmptyResults: boolean;
  formattedResults: Array<{
    bloodGroup: string;
    cities: Array<{ city: string; count: number }>;
    totalUnits: number;
  }>;
  
  // Last search
  lastSearchFilters: SearchFilters | null;
}

export const useSearchPage = (): UseSearchPageReturn => {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchFilters, setLastSearchFilters] = useState<SearchFilters | null>(null);

  // Handle search operation
  const handleSearch = useCallback(async (filters: SearchFilters) => {
    if (!filters.blood_group && !filters.city) {
      setError('Please select at least a blood group or city to search');
      return;
    }

    setLoading(true);
    setError(null);
    setLastSearchFilters(filters);

    try {
      const bloodGroup = filters.blood_group && filters.blood_group !== '' 
        ? filters.blood_group as BloodGroup 
        : undefined;
      const data = await getAvailability(bloodGroup, filters.city);
      setResults(data || {});
      setHasSearched(true);
    } catch (err) {
      console.error('Error searching:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to search blood availability';
      setError(errorMessage);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Retry last search
  const retry = useCallback(async () => {
    if (lastSearchFilters) {
      await handleSearch(lastSearchFilters);
    }
  }, [lastSearchFilters, handleSearch]);

  // Clear results
  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
    setHasSearched(false);
    setLastSearchFilters(null);
  }, []);

  // Check if results are empty
  const isEmptyResults = useMemo(() => {
    return results !== null && Object.keys(results).length === 0;
  }, [results]);

  // Calculate search statistics
  const searchStats = useMemo((): SearchStats => {
    if (!results) {
      return {
        totalUnits: 0,
        totalCities: 0,
        totalBloodGroups: 0,
        mostAvailableBloodGroup: null,
        mostAvailableCity: null,
      };
    }

    let totalUnits = 0;
    const cityCount = new Set<string>();
    let maxBloodGroupUnits = 0;
    let maxCityUnits = 0;
    let mostAvailableBloodGroup: string | null = null;
    let mostAvailableCity: string | null = null;
    const cityTotals: { [city: string]: number } = {};

    Object.entries(results).forEach(([bloodGroup, cities]) => {
      let bloodGroupTotal = 0;
      
      Object.entries(cities).forEach(([city, count]) => {
        const units = Number(count);
        totalUnits += units;
        bloodGroupTotal += units;
        cityCount.add(city);
        
        // Track city totals
        cityTotals[city] = (cityTotals[city] || 0) + units;
      });

      // Track most available blood group
      if (bloodGroupTotal > maxBloodGroupUnits) {
        maxBloodGroupUnits = bloodGroupTotal;
        mostAvailableBloodGroup = bloodGroup;
      }
    });

    // Find most available city
    Object.entries(cityTotals).forEach(([city, total]) => {
      if (total > maxCityUnits) {
        maxCityUnits = total;
        mostAvailableCity = city;
      }
    });

    return {
      totalUnits,
      totalCities: cityCount.size,
      totalBloodGroups: Object.keys(results).length,
      mostAvailableBloodGroup,
      mostAvailableCity,
    };
  }, [results]);

  // Format results for display
  const formattedResults = useMemo(() => {
    if (!results) return [];

    return Object.entries(results).map(([bloodGroup, cities]) => {
      const cityData = Object.entries(cities).map(([city, count]) => ({
        city,
        count: Number(count),
      }));

      // Sort cities by count (descending)
      cityData.sort((a, b) => b.count - a.count);

      const totalUnits = cityData.reduce((sum, item) => sum + item.count, 0);

      return {
        bloodGroup,
        cities: cityData,
        totalUnits,
      };
    }).sort((a, b) => b.totalUnits - a.totalUnits); // Sort blood groups by total units
  }, [results]);

  return {
    results,
    loading,
    error,
    hasSearched,
    handleSearch,
    clearResults,
    retry,
    searchStats,
    isEmptyResults,
    formattedResults,
    lastSearchFilters,
  };
};
