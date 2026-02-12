import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { DistanceFilter } from "./DistanceFilter";
import { LocationSuggestion } from "@/hooks/useLocationAutocomplete";
const petTypes = [{
  value: "cao",
  label: "Cães",
  emoji: "🐕"
}, {
  value: "gato",
  label: "Gatos",
  emoji: "🐱"
}, {
  value: "pequeno",
  label: "Animais Pequenos",
  emoji: "🐹"
}, {
  value: "grande",
  label: "Animais Grandes",
  emoji: "🐴"
}, {
  value: "producao",
  label: "Animais de Produção",
  emoji: "🐄"
}, {
  value: "silvestres",
  label: "Silvestres/Exóticos",
  emoji: "🦜"
}];
const radiusOptions = [{
  value: 1,
  label: "+1 km"
}, {
  value: 5,
  label: "+5 km"
}, {
  value: 10,
  label: "+10 km"
}, {
  value: 20,
  label: "+20 km"
}, {
  value: 50,
  label: "+50 km"
}];
interface SearchBarProps {
  variant?: "hero" | "compact";
  onSearch?: (data: {
    service: string;
    location: string;
    petType: string;
    radius: number;
    coordinates?: {
      lat: number;
      lng: number;
    } | null;
  }) => void;
  initialValues?: {
    service?: string;
    location?: string;
    petType?: string;
    radius?: number;
  };
}
export function SearchBar({
  variant = "hero",
  onSearch,
  initialValues
}: SearchBarProps) {
  const navigate = useNavigate();
  const [service, setService] = useState(initialValues?.service || "");
  const [location, setLocation] = useState(initialValues?.location || "");
  const [petType, setPetType] = useState(initialValues?.petType || "");
  const [radius, setRadius] = useState(initialValues?.radius || 5);
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Only sync from initialValues on TRUE mount (not on every prop change)
  // This prevents overwriting user edits when parent re-renders
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      // Initial mount: already set via useState defaults, skip
      return;
    }
    // After mount: never overwrite user input from props
  }, [initialValues]);

  // Handle location selection from autocomplete
  const handleLocationSelect = useCallback((suggestion: LocationSuggestion) => {
    setLocation(suggestion.displayName);
    setCoordinates({
      lat: suggestion.latitude,
      lng: suggestion.longitude
    });
  }, []);
  const handleLocationChange = useCallback((value: string) => {
    setLocation(value);
    // Clear coordinates when user manually types (they'll be set when a suggestion is selected)
    if (!value) {
      setCoordinates(null);
    }
  }, []);
  const handleLocationClear = useCallback(() => {
    setLocation("");
    setCoordinates(null);
  }, []);
  const handleRadiusChange = useCallback((newRadius: number) => {
    setRadius(newRadius);
  }, []);
  const handleSearch = useCallback(() => {
    if (onSearch) {
      onSearch({
        service,
        location,
        petType,
        radius,
        coordinates
      });
    } else {
      // Navigate to search page with params
      const params = new URLSearchParams();
      if (service) params.set("q", service);
      if (location) params.set("location", location);
      if (petType) params.set("petType", petType);
      if (radius) params.set("radius", radius.toString());
      if (coordinates) {
        params.set("lat", coordinates.lat.toString());
        params.set("lng", coordinates.lng.toString());
      }
      navigate(`/buscar?${params.toString()}`);
    }
  }, [onSearch, service, location, petType, radius, coordinates, navigate]);
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  }, [handleSearch]);
  const selectedPet = petTypes.find(p => p.value === petType);
  if (variant === "compact") {
    return <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-card rounded-xl border border-border shadow-soft">
        {/* Pet Type - Compact */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left">
              <span className="text-lg">{selectedPet?.emoji || "🐾"}</span>
              <span className="text-sm font-medium truncate max-w-[80px]">
                {selectedPet?.label || "Pet"}
              </span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {petTypes.map(pet => <DropdownMenuItem key={pet.value} onClick={() => setPetType(pet.value)} className="flex items-center gap-2">
                <span>{pet.emoji}</span>
                {pet.label}
              </DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden sm:block w-px h-6 bg-border" />

        {/* Service Search */}
        <div className="flex-1 flex items-center gap-2 px-3">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input type="text" placeholder="Buscar serviço..." value={service} onChange={e => setService(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0" />
        </div>

        <div className="hidden sm:block w-px h-6 bg-border" />

        {/* Location with Autocomplete */}
        <div className="flex-1 min-w-0 max-w-[200px]">
          <LocationAutocomplete value={location} onChange={handleLocationChange} onSelect={handleLocationSelect} onClear={handleLocationClear} placeholder="Localização..." variant="compact" showGpsButton />
        </div>

        <div className="hidden sm:block w-px h-6 bg-border" />

        {/* Radius - Compact */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">+{radius}km</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="p-3 w-64">
            <DistanceFilter value={radius} onChange={handleRadiusChange} min={1} max={50} showQuickOptions />
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" className="bg-gradient-primary" onClick={handleSearch}>
          <Search className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Buscar</span>
        </Button>
      </div>;
  }
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.5,
    delay: 0.2
  }} className="w-full max-w-4xl mx-auto">
      <div className="bg-card border border-border shadow-hover p-2 search-input rounded-md">
        <div className="flex flex-col md:flex-row gap-2">
          {/* Pet Type Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-4 py-3 md:py-4 rounded-xl hover:bg-muted transition-colors text-left w-full md:w-auto md:min-w-[180px]">
                <span className="text-2xl">{selectedPet?.emoji || "🐾"}</span>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Tipo de Pet</p>
                  <p className="font-medium text-sm truncate">
                    {selectedPet?.label || "Selecione"}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {petTypes.map(pet => <DropdownMenuItem key={pet.value} onClick={() => setPetType(pet.value)} className="flex items-center gap-2">
                  <span>{pet.emoji}</span>
                  {pet.label}
                </DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden md:block w-px bg-border" />

          {/* Service Search */}
          <div className="flex items-center gap-3 px-4 py-3 md:py-4 flex-1">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Serviço</p>
              <input type="text" placeholder="Veterinário, Banho e Tosa, Pet Walker..." value={service} onChange={e => setService(e.target.value)} onKeyDown={handleKeyDown} className="w-full bg-transparent font-medium text-sm outline-none placeholder:text-muted-foreground/70" />
            </div>
          </div>

          <div className="hidden md:block w-px bg-border" />

          {/* Location with Autocomplete */}
          <div className="flex-1 px-4 py-3 md:py-4">
            <p className="text-xs text-muted-foreground mb-1">Localização</p>
            <LocationAutocomplete value={location} onChange={handleLocationChange} onSelect={handleLocationSelect} onClear={handleLocationClear} placeholder="CEP, Bairro, Cidade ou Estado" variant="default" showGpsButton inputClassName="font-medium" />
          </div>

          {/* Radius Selector with Distance Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-3 md:py-4 rounded-xl hover:bg-muted transition-colors">
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Raio</p>
                  <p className="font-medium text-sm">+{radius} km</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="p-4 w-72">
              <p className="text-sm font-medium mb-3">Distância máxima</p>
              <DistanceFilter value={radius} onChange={handleRadiusChange} min={1} max={50} showQuickOptions />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search Button */}
          <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity px-8 py-6 text-base font-semibold" onClick={handleSearch}>
            <Search className="w-5 h-5 mr-2" />
            Buscar
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {["Veterinário", "Banho e Tosa", "Pet Walker", "Adestrador", "Hospedagem"].map(tag => <button key={tag} onClick={() => {
        setService(tag);
        handleSearch();
      }} className="px-4 py-2 text-sm bg-card/80 hover:bg-primary-light hover:text-primary rounded-full border border-border/50 transition-colors">
            {tag}
          </button>)}
      </div>
    </motion.div>;
}