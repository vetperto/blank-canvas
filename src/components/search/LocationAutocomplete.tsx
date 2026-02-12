import { useRef, useEffect, useCallback, memo } from "react";
import { MapPin, Navigation, Loader2, X, Building2, Map, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocationAutocomplete, LocationSuggestion } from "@/hooks/useLocationAutocomplete";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LocationAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (suggestion: LocationSuggestion) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  showGpsButton?: boolean;
  variant?: "default" | "compact";
}

// Icon mapping for suggestion types
const typeIcons: Record<LocationSuggestion['type'], typeof MapPin> = {
  street: Home,
  neighborhood: Building2,
  city: MapPin,
  state: Map,
  place: MapPin,
};

const typeLabels: Record<LocationSuggestion['type'], string> = {
  street: "Rua",
  neighborhood: "Bairro",
  city: "Cidade",
  state: "Estado",
  place: "Local",
};

export const LocationAutocomplete = memo(function LocationAutocomplete({
  value = "",
  onChange,
  onSelect,
  onClear,
  placeholder = "Cidade, bairro ou CEP...",
  className,
  inputClassName,
  showGpsButton = true,
  variant = "default",
}: LocationAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    query,
    setQuery,
    suggestions,
    isLoading,
    isOpen,
    handleSearch,
    selectSuggestion,
    clear,
    closeSuggestions,
    setIsOpen,
  } = useLocationAutocomplete({
    debounceMs: 350,
    minChars: 2,
    maxResults: 6,
  });

  // Sync external value with internal state
  useEffect(() => {
    if (value !== query && value !== undefined) {
      setQuery(value);
    }
  }, [value, query, setQuery]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    handleSearch(newValue);
    onChange?.(newValue);
  }, [handleSearch, onChange]);

  // Handle suggestion selection
  const handleSelect = useCallback((suggestion: LocationSuggestion) => {
    const selected = selectSuggestion(suggestion);
    onChange?.(selected.displayName);
    onSelect?.(selected);
  }, [selectSuggestion, onChange, onSelect]);

  // Handle clear
  const handleClear = useCallback(() => {
    clear();
    onChange?.("");
    onClear?.();
    inputRef.current?.focus();
  }, [clear, onChange, onClear]);

  // Handle GPS location
  const [isGettingLocation, setIsGettingLocation] = React.useState(false);

  const handleGetLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada pelo navegador");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=pt-BR`
          );
          const data = await response.json();

          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || "";
            const state = data.address.state || "";
            const neighborhood = data.address.suburb || data.address.neighbourhood || "";

            const locationStr = [neighborhood, city, state].filter(Boolean).join(", ");
            const displayName = locationStr || "Minha localização atual";

            setQuery(displayName);
            onChange?.(displayName);
            onSelect?.({
              id: "gps-location",
              displayName,
              type: "place",
              city,
              state,
              neighborhood,
              latitude,
              longitude,
            });

            toast.success("Localização obtida com sucesso!");
          }
        } catch (error) {
          const displayName = "Minha localização atual";
          setQuery(displayName);
          onChange?.(displayName);
          onSelect?.({
            id: "gps-location",
            displayName,
            type: "place",
            latitude,
            longitude,
          });
          toast.success("Localização obtida!");
        }

        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Não foi possível obter sua localização");
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [onChange, onSelect, setQuery]);

  // Handle keyboard navigation
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        closeSuggestions();
        break;
    }
  }, [isOpen, suggestions, selectedIndex, handleSelect, closeSuggestions]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeSuggestions();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeSuggestions]);

  const isCompact = variant === "compact";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className={cn(
        "flex items-center gap-2 rounded-lg transition-colors",
        isCompact ? "px-2" : "px-3 py-2 bg-background border border-input",
        isOpen && !isCompact && "ring-2 ring-ring ring-offset-2"
      )}>
        <MapPin className={cn(
          "shrink-0 text-muted-foreground",
          isCompact ? "w-4 h-4" : "w-5 h-5"
        )} />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            "flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-0",
            isCompact ? "text-sm" : "text-sm md:text-base",
            inputClassName
          )}
        />

        {/* Loading indicator */}
        {isLoading && (
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />
        )}

        {/* Clear button */}
        {query && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full hover:bg-muted transition-colors shrink-0"
            title="Limpar"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}

        {/* GPS button */}
        {showGpsButton && (
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            className={cn(
              "rounded-lg transition-colors shrink-0",
              isCompact ? "p-1" : "p-1.5 hover:bg-muted"
            )}
            title="Usar minha localização"
          >
            {isGettingLocation ? (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 text-primary" />
            )}
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
          >
            <ul className="py-1 max-h-64 overflow-y-auto">
              {suggestions.map((suggestion, index) => {
                const Icon = typeIcons[suggestion.type];
                const isSelected = index === selectedIndex;

                return (
                  <li key={suggestion.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(suggestion)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors",
                        isSelected ? "bg-accent" : "hover:bg-muted"
                      )}
                    >
                      <div className={cn(
                        "mt-0.5 p-1.5 rounded-md shrink-0",
                        suggestion.type === "state" ? "bg-primary/10 text-primary" :
                        suggestion.type === "city" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                        suggestion.type === "neighborhood" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" :
                        "bg-muted text-muted-foreground"
                      )}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {suggestion.displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {typeLabels[suggestion.type]}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Need to import React for useState in the component
import React from "react";
