import { useState, useCallback, useRef, useEffect } from 'react';

export interface LocationSuggestion {
  id: string;
  displayName: string;
  type: 'street' | 'neighborhood' | 'city' | 'state' | 'place';
  city?: string;
  state?: string;
  neighborhood?: string;
  street?: string;
  latitude: number;
  longitude: number;
}

interface UseLocationAutocompleteOptions {
  debounceMs?: number;
  minChars?: number;
  maxResults?: number;
}

// In-memory cache for suggestions
const suggestionCache = new Map<string, { data: LocationSuggestion[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Brazilian states for quick suggestions
const brazilianStates: LocationSuggestion[] = [
  { id: 'br-ac', displayName: 'Acre', type: 'state', state: 'AC', latitude: -9.0238, longitude: -70.812 },
  { id: 'br-al', displayName: 'Alagoas', type: 'state', state: 'AL', latitude: -9.5713, longitude: -36.782 },
  { id: 'br-ap', displayName: 'Amapá', type: 'state', state: 'AP', latitude: 0.902, longitude: -52.003 },
  { id: 'br-am', displayName: 'Amazonas', type: 'state', state: 'AM', latitude: -3.4168, longitude: -65.856 },
  { id: 'br-ba', displayName: 'Bahia', type: 'state', state: 'BA', latitude: -12.5797, longitude: -41.7007 },
  { id: 'br-ce', displayName: 'Ceará', type: 'state', state: 'CE', latitude: -5.4984, longitude: -39.3206 },
  { id: 'br-df', displayName: 'Distrito Federal', type: 'state', state: 'DF', latitude: -15.7998, longitude: -47.8645 },
  { id: 'br-es', displayName: 'Espírito Santo', type: 'state', state: 'ES', latitude: -19.1834, longitude: -40.3089 },
  { id: 'br-go', displayName: 'Goiás', type: 'state', state: 'GO', latitude: -15.827, longitude: -49.8362 },
  { id: 'br-ma', displayName: 'Maranhão', type: 'state', state: 'MA', latitude: -4.9609, longitude: -45.2744 },
  { id: 'br-mt', displayName: 'Mato Grosso', type: 'state', state: 'MT', latitude: -12.6819, longitude: -56.9211 },
  { id: 'br-ms', displayName: 'Mato Grosso do Sul', type: 'state', state: 'MS', latitude: -20.7722, longitude: -54.7852 },
  { id: 'br-mg', displayName: 'Minas Gerais', type: 'state', state: 'MG', latitude: -18.5122, longitude: -44.555 },
  { id: 'br-pa', displayName: 'Pará', type: 'state', state: 'PA', latitude: -3.4168, longitude: -52.2167 },
  { id: 'br-pb', displayName: 'Paraíba', type: 'state', state: 'PB', latitude: -7.24, longitude: -36.782 },
  { id: 'br-pr', displayName: 'Paraná', type: 'state', state: 'PR', latitude: -25.2521, longitude: -52.0215 },
  { id: 'br-pe', displayName: 'Pernambuco', type: 'state', state: 'PE', latitude: -8.8137, longitude: -36.9541 },
  { id: 'br-pi', displayName: 'Piauí', type: 'state', state: 'PI', latitude: -7.7183, longitude: -42.7289 },
  { id: 'br-rj', displayName: 'Rio de Janeiro', type: 'state', state: 'RJ', latitude: -22.2528, longitude: -42.8712 },
  { id: 'br-rn', displayName: 'Rio Grande do Norte', type: 'state', state: 'RN', latitude: -5.4026, longitude: -36.9541 },
  { id: 'br-rs', displayName: 'Rio Grande do Sul', type: 'state', state: 'RS', latitude: -30.0346, longitude: -51.2177 },
  { id: 'br-ro', displayName: 'Rondônia', type: 'state', state: 'RO', latitude: -11.5057, longitude: -63.5806 },
  { id: 'br-rr', displayName: 'Roraima', type: 'state', state: 'RR', latitude: 2.7376, longitude: -62.0751 },
  { id: 'br-sc', displayName: 'Santa Catarina', type: 'state', state: 'SC', latitude: -27.2423, longitude: -50.2189 },
  { id: 'br-sp', displayName: 'São Paulo', type: 'state', state: 'SP', latitude: -22.1965, longitude: -48.7972 },
  { id: 'br-se', displayName: 'Sergipe', type: 'state', state: 'SE', latitude: -10.5741, longitude: -37.3857 },
  { id: 'br-to', displayName: 'Tocantins', type: 'state', state: 'TO', latitude: -10.1753, longitude: -48.2982 },
];

export function useLocationAutocomplete(options: UseLocationAutocompleteOptions = {}) {
  const { debounceMs = 300, minChars = 2, maxResults = 8 } = options;

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean old cache entries
  const cleanCache = useCallback(() => {
    const now = Date.now();
    suggestionCache.forEach((value, key) => {
      if (now - value.timestamp > CACHE_TTL) {
        suggestionCache.delete(key);
      }
    });
  }, []);

  // Fetch suggestions from Nominatim API
  const fetchSuggestions = useCallback(async (searchQuery: string): Promise<LocationSuggestion[]> => {
    const cacheKey = searchQuery.toLowerCase().trim();
    
    // Check cache first
    const cached = suggestionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const params = new URLSearchParams({
      q: searchQuery,
      format: 'json',
      addressdetails: '1',
      countrycodes: 'br',
      limit: maxResults.toString(),
      'accept-language': 'pt-BR',
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        signal: abortControllerRef.current.signal,
        headers: {
          'User-Agent': 'VetpertoApp/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar localização');
    }

    const data = await response.json();
    
    const results: LocationSuggestion[] = data.map((item: any, index: number) => {
      const address = item.address || {};
      
      // Determine type based on available data
      let type: LocationSuggestion['type'] = 'place';
      if (address.road || address.street) {
        type = 'street';
      } else if (address.suburb || address.neighbourhood) {
        type = 'neighborhood';
      } else if (address.city || address.town || address.municipality) {
        type = 'city';
      } else if (address.state && !address.city) {
        type = 'state';
      }

      // Build display name with relevant parts
      const parts: string[] = [];
      if (address.road || address.street) {
        parts.push(address.road || address.street);
      }
      if (address.suburb || address.neighbourhood) {
        parts.push(address.suburb || address.neighbourhood);
      }
      if (address.city || address.town || address.municipality) {
        parts.push(address.city || address.town || address.municipality);
      }
      if (address.state) {
        parts.push(address.state);
      }

      const displayName = parts.length > 0 ? parts.join(', ') : item.display_name;

      return {
        id: `nom-${item.place_id || index}`,
        displayName: displayName.length > 80 ? displayName.slice(0, 77) + '...' : displayName,
        type,
        city: address.city || address.town || address.municipality,
        state: address.state,
        neighborhood: address.suburb || address.neighbourhood,
        street: address.road || address.street,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      };
    });

    // Cache results
    suggestionCache.set(cacheKey, { data: results, timestamp: Date.now() });
    cleanCache();

    return results;
  }, [maxResults, cleanCache]);

  // Filter Brazilian states for quick suggestions
  const filterStates = useCallback((searchQuery: string): LocationSuggestion[] => {
    const queryLower = searchQuery.toLowerCase().trim();
    return brazilianStates.filter(state => 
      state.displayName.toLowerCase().includes(queryLower) ||
      (state.state && state.state.toLowerCase() === queryLower)
    ).slice(0, 3);
  }, []);

  // Handle search with debounce
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    setError(null);

    // Clear timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If query is too short, show state suggestions or clear
    if (searchQuery.trim().length < minChars) {
      if (searchQuery.trim().length > 0) {
        const stateSuggestions = filterStates(searchQuery);
        setSuggestions(stateSuggestions);
        setIsOpen(stateSuggestions.length > 0);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    // Debounce API call
    debounceTimerRef.current = setTimeout(async () => {
      try {
        // First check for state matches
        const stateSuggestions = filterStates(searchQuery);
        
        // Then fetch from API
        const apiSuggestions = await fetchSuggestions(searchQuery);
        
        // Combine and deduplicate
        const combined = [...stateSuggestions];
        for (const apiSug of apiSuggestions) {
          if (!combined.some(s => s.displayName === apiSug.displayName)) {
            combined.push(apiSug);
          }
        }

        setSuggestions(combined.slice(0, maxResults));
        setIsOpen(combined.length > 0);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Erro ao buscar sugestões');
          console.error('Location autocomplete error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);
  }, [debounceMs, minChars, maxResults, fetchSuggestions, filterStates]);

  // Select a suggestion
  const selectSuggestion = useCallback((suggestion: LocationSuggestion) => {
    setQuery(suggestion.displayName);
    setSuggestions([]);
    setIsOpen(false);
    return suggestion;
  }, []);

  // Clear suggestions and query
  const clear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setError(null);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Close suggestions dropdown
  const closeSuggestions = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    isLoading,
    error,
    isOpen,
    handleSearch,
    selectSuggestion,
    clear,
    closeSuggestions,
    setIsOpen,
  };
}
