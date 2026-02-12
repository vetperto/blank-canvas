import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, MapPin, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { DistanceFilter } from "./DistanceFilter";
import { MobileFilterSheet } from "./MobileFilterSheet";
import { FilterState } from "./FilterSidebar";
import { LocationSuggestion } from "@/hooks/useLocationAutocomplete";
import { useIsMobile } from "@/hooks/use-mobile";

const petTypes = [
  { value: "cao", label: "Cães", emoji: "🐕" },
  { value: "gato", label: "Gatos", emoji: "🐱" },
  { value: "pequeno", label: "Animais Pequenos", emoji: "🐹" },
  { value: "grande", label: "Animais Grandes", emoji: "🐴" },
  { value: "producao", label: "Animais de Produção", emoji: "🐄" },
  { value: "silvestres", label: "Silvestres/Exóticos", emoji: "🦜" },
];

const defaultFilters: FilterState = {
  petType: [],
  atendimento: [],
  especialidade: [],
  servicos: [],
  avaliacao: [],
  disponibilidade: [],
  pagamento: [],
};

interface ResponsiveSearchBarProps {
  onSearch?: (data: {
    service: string;
    location: string;
    petType: string;
    radius: number;
    coordinates?: { lat: number; lng: number } | null;
    filters?: FilterState;
  }) => void;
  initialValues?: {
    service?: string;
    location?: string;
    petType?: string;
    radius?: number;
  };
}

export function ResponsiveSearchBar({ onSearch, initialValues }: ResponsiveSearchBarProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [service, setService] = useState(initialValues?.service || "");
  const [location, setLocation] = useState(initialValues?.location || "");
  const [petType, setPetType] = useState(initialValues?.petType || "");
  const [radius, setRadius] = useState(initialValues?.radius || 5);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  useEffect(() => {
    if (initialValues) {
      if (initialValues.service) setService(initialValues.service);
      if (initialValues.location) setLocation(initialValues.location);
      if (initialValues.petType) setPetType(initialValues.petType);
      if (initialValues.radius) setRadius(initialValues.radius);
    }
  }, [initialValues]);

  const handleLocationSelect = useCallback((suggestion: LocationSuggestion) => {
    setLocation(suggestion.displayName);
    setCoordinates({ lat: suggestion.latitude, lng: suggestion.longitude });
  }, []);

  const handleLocationChange = useCallback((value: string) => {
    setLocation(value);
    if (!value) setCoordinates(null);
  }, []);

  const handleLocationClear = useCallback(() => {
    setLocation("");
    setCoordinates(null);
  }, []);

  const handleSearch = useCallback(() => {
    if (onSearch) {
      onSearch({ service, location, petType, radius, coordinates, filters });
    } else {
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
  }, [onSearch, service, location, petType, radius, coordinates, filters, navigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  }, [handleSearch]);

  const selectedPet = petTypes.find((p) => p.value === petType);
  const totalFilters = Object.values(filters).flat().length;

  // Mobile Layout
  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-4xl mx-auto px-4"
      >
        <div className="bg-card border border-border shadow-hover rounded-2xl p-4 space-y-3">
          {/* Service Search - Full Width */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar veterinário, banho e tosa..."
              value={service}
              onChange={(e) => setService(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-3 bg-muted/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Location - Full Width */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
            <div className="pl-10">
              <LocationAutocomplete
                value={location}
                onChange={handleLocationChange}
                onSelect={handleLocationSelect}
                onClear={handleLocationClear}
                placeholder="Localização..."
                variant="compact"
                showGpsButton
                inputClassName="bg-muted/50 rounded-xl py-3"
              />
            </div>
          </div>

          {/* Bottom Row: Pet Type + Filters + Search */}
          <div className="flex items-center gap-2">
            {/* Pet Type */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2.5 bg-muted/50 rounded-xl text-sm flex-1 min-w-0">
                  <span className="text-lg">{selectedPet?.emoji || "🐾"}</span>
                  <span className="truncate text-left flex-1">
                    {selectedPet?.label || "Tipo de Pet"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {petTypes.map((pet) => (
                  <DropdownMenuItem
                    key={pet.value}
                    onClick={() => setPetType(pet.value)}
                    className="flex items-center gap-2"
                  >
                    <span>{pet.emoji}</span>
                    {pet.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filters Sheet */}
            <MobileFilterSheet
              filters={filters}
              onFiltersChange={setFilters}
              radius={radius}
              onRadiusChange={setRadius}
            />

            {/* Search Button */}
            <Button
              size="icon"
              className="bg-gradient-primary shrink-0 h-10 w-10"
              onClick={handleSearch}
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Quick Tags */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {["Veterinário", "Banho e Tosa", "Pet Walker"].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setService(tag);
                handleSearch();
              }}
              className="px-3 py-1.5 text-xs bg-card/80 hover:bg-primary-light hover:text-primary rounded-full border border-border/50 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  // Tablet & Desktop Layout
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-card border border-border shadow-hover p-2 rounded-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-2 flex-wrap lg:flex-nowrap items-stretch">
          {/* Pet Type Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-4 py-3 lg:py-4 rounded-xl hover:bg-muted transition-colors text-left w-full lg:w-auto lg:min-w-[160px] shrink-0">
                <span className="text-2xl">{selectedPet?.emoji || "🐾"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Tipo de Pet</p>
                  <p className="font-medium text-sm truncate">
                    {selectedPet?.label || "Selecione"}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {petTypes.map((pet) => (
                <DropdownMenuItem
                  key={pet.value}
                  onClick={() => setPetType(pet.value)}
                  className="flex items-center gap-2"
                >
                  <span>{pet.emoji}</span>
                  {pet.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden lg:block w-px bg-border" />

          {/* Service Search */}
          <div className="flex items-center gap-3 px-4 py-3 lg:py-4 flex-1 min-w-0">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Serviço</p>
              <input
                type="text"
                placeholder="Veterinário, Banho e Tosa..."
                value={service}
                onChange={(e) => setService(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent font-medium text-sm outline-none placeholder:text-muted-foreground/70 truncate"
              />
            </div>
          </div>

          <div className="hidden lg:block w-px bg-border" />

          {/* Location */}
          <div className="flex-1 min-w-0 px-4 py-3 lg:py-4">
            <p className="text-xs text-muted-foreground mb-1">Localização</p>
            <LocationAutocomplete
              value={location}
              onChange={handleLocationChange}
              onSelect={handleLocationSelect}
              onClear={handleLocationClear}
              placeholder="CEP, Bairro ou Cidade"
              variant="default"
              showGpsButton
              inputClassName="font-medium"
            />
          </div>

          {/* Radius Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-3 lg:py-4 rounded-xl hover:bg-muted transition-colors shrink-0">
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Raio</p>
                  <p className="font-medium text-sm">+{radius}km</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="p-4 w-72">
              <p className="text-sm font-medium mb-3">Distância máxima</p>
              <DistanceFilter
                value={radius}
                onChange={setRadius}
                min={1}
                max={50}
                showQuickOptions
              />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desktop Filters Toggle (hidden on smaller screens, full sidebar on search page) */}
          <div className="hidden xl:flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-3 lg:py-4 rounded-xl hover:bg-muted transition-colors relative">
                  <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Filtros</span>
                  {totalFilters > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-xs font-medium bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      {totalFilters}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-4">
                <p className="text-sm font-medium mb-3">Filtros rápidos</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Avaliação mínima</p>
                    <div className="flex gap-2">
                      {["4.5", "4.0", "3.5"].map((rating) => (
                        <button
                          key={rating}
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              avaliacao: prev.avaliacao.includes(rating) ? [] : [rating],
                            }))
                          }
                          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                            filters.avaliacao.includes(rating)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          ⭐ {rating}+
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Tipo de atendimento</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "domiciliar", label: "Domiciliar" },
                        { value: "clinica", label: "Clínica" },
                      ].map((item) => (
                        <button
                          key={item.value}
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              atendimento: prev.atendimento.includes(item.value)
                                ? prev.atendimento.filter((v) => v !== item.value)
                                : [...prev.atendimento, item.value],
                            }))
                          }
                          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                            filters.atendimento.includes(item.value)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search Button */}
          <Button
            className="bg-gradient-primary hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 h-12 lg:h-14 px-4 md:px-6 lg:px-8 text-sm md:text-base font-semibold shrink-0 rounded-xl shadow-md hover:shadow-lg min-w-[48px] md:min-w-[100px] lg:min-w-[120px]"
            onClick={handleSearch}
          >
            <Search className="w-5 h-5 md:mr-2" />
            <span className="hidden md:inline">Buscar</span>
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {["Veterinário", "Banho e Tosa", "Pet Walker", "Adestrador", "Hospedagem"].map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setService(tag);
              handleSearch();
            }}
            className="px-4 py-2 text-sm bg-card/80 hover:bg-primary-light hover:text-primary rounded-full border border-border/50 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
