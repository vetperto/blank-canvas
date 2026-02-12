import { useState, useCallback, useMemo, lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  SlidersHorizontal, 
  MapPin, 
  Grid, 
  Loader2, 
  AlertCircle,
  Map as MapIcon,
  LayoutList,
  ArrowUpDown
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterSidebar, FilterState } from "@/components/search/FilterSidebar";
import { ProfessionalCard } from "@/components/professionals/ProfessionalCard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearchProfessionals, SearchFilters } from "@/hooks/useSearchProfessionals";
import type { SearchMode } from "@/lib/search/types";
import vet1 from "@/assets/vet-1.jpg";
import vet2 from "@/assets/vet-2.jpg";

const ProfessionalMap = lazy(() => import("@/components/search/ProfessionalMap"));

const sortOptions = [
  { value: "relevance", label: "Mais Relevantes" },
  { value: "rating", label: "Melhor Avaliação" },
  { value: "distance", label: "Mais Próximos" },
  { value: "price-low", label: "Menor Preço" },
  { value: "availability", label: "Disponibilidade" },
];

const fallbackPhotos = [vet1, vet2];

const defaultFilterState: FilterState = {
  petType: [],
  atendimento: [],
  especialidade: [],
  servicos: [],
  avaliacao: [],
  disponibilidade: [],
  pagamento: [],
};

// Helper: read URL params for display & initial values only
function readUrlForDisplay(searchParams: URLSearchParams) {
  const query = searchParams.get("q") || "";
  const location = searchParams.get("location") || "";
  const petType = searchParams.get("petType") || "";
  const radiusStr = searchParams.get("radius");
  const radius = radiusStr ? (parseInt(radiusStr) || 5) : 5;
  const modeRaw = searchParams.get("mode");
  const searchMode: SearchMode = (modeRaw && ['local_fixo', 'domiciliar', 'all'].includes(modeRaw))
    ? modeRaw as SearchMode : 'all';
  return { query, location, petType, radius, searchMode };
}

// Helper: build sidebar filter fields into SearchFilters shape
function buildSidebarFields(f: FilterState): Partial<SearchFilters> {
  return {
    specialty: f.especialidade,
    locationType: f.atendimento,
    services: f.servicos,
    minRating: f.avaliacao?.length > 0 ? parseFloat(f.avaliacao[0]) : undefined,
    availableToday: f.disponibilidade?.includes("hoje"),
    availableThisWeek: f.disponibilidade?.includes("semana"),
    urgency: f.disponibilidade?.includes("urgencia"),
    paymentMethods: f.pagamento,
  };
}

// Helper: sync URL for bookmarking (fire-and-forget, NOT source of truth)
function syncUrlForBookmark(
  setSearchParams: ReturnType<typeof useSearchParams>[1],
  filters: SearchFilters
) {
  const params = new URLSearchParams();
  if (filters.service) params.set("q", filters.service);
  if (filters.location) params.set("location", filters.location);
  if (filters.petType?.length) params.set("petType", filters.petType[0]);
  if (filters.radius) params.set("radius", filters.radius.toString());
  if (filters.searchMode && filters.searchMode !== 'all') params.set("mode", filters.searchMode);
  if (filters.coordinates) {
    params.set("lat", filters.coordinates.lat.toString());
    params.set("lng", filters.coordinates.lng.toString());
  }
  setSearchParams(params, { replace: true });
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"list" | "map" | "split">("split");
  const [sortBy, setSortBy] = useState("relevance");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sidebarFilters, setSidebarFilters] = useState<FilterState>(defaultFilterState);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);

  // ====== SINGLE SOURCE OF TRUTH FOR ACTIVE SEARCH ======
  const [currentSearch, setCurrentSearch] = useState<SearchFilters | null>(null);

  // URL values used ONLY for display labels and SearchBar initial values
  const urlDisplay = useMemo(() => readUrlForDisplay(searchParams), [searchParams]);

  // Derive display values from currentSearch (if exists) or URL fallback
  const displayQuery = currentSearch?.service ?? urlDisplay.query;
  const displayLocation = currentSearch?.location ?? urlDisplay.location;
  const displayRadius = currentSearch?.radius ?? urlDisplay.radius;
  const displaySearchMode = currentSearch?.searchMode ?? urlDisplay.searchMode;
  const displayCoordinates = currentSearch?.coordinates ?? null;

  const { professionals, isLoading, error, totalCount, searchProfessionals } = useSearchProfessionals();

  // ===== SEARCH: triggered by SearchBar button click =====
  const handleSearch = useCallback((data: { 
    service: string; location: string; petType: string; radius: number;
    coordinates?: { lat: number; lng: number } | null;
  }) => {
    const filters: SearchFilters = {
      service: data.service,
      location: data.location,
      petType: data.petType ? [data.petType] : sidebarFilters.petType,
      radius: data.radius,
      coordinates: data.coordinates ?? null,
      ...buildSidebarFields(sidebarFilters),
      searchMode: currentSearch?.searchMode ?? urlDisplay.searchMode,
    };

    setCurrentSearch(filters);
    searchProfessionals(filters);
    syncUrlForBookmark(setSearchParams, filters);
  }, [sidebarFilters, currentSearch?.searchMode, urlDisplay.searchMode, searchProfessionals, setSearchParams]);

  // ===== SIDEBAR FILTERS: merge into currentSearch =====
  const handleFiltersChange = useCallback((filters: FilterState) => {
    setSidebarFilters(filters);

    const base = currentSearch ?? {
      service: urlDisplay.query,
      location: urlDisplay.location,
      petType: filters.petType,
      radius: urlDisplay.radius,
      searchMode: urlDisplay.searchMode,
      coordinates: null,
    };

    const updated: SearchFilters = {
      ...base,
      petType: filters.petType.length > 0 ? filters.petType : base.petType,
      ...buildSidebarFields(filters),
    };

    setCurrentSearch(updated);
    searchProfessionals(updated);
    syncUrlForBookmark(setSearchParams, updated);
    setMobileFiltersOpen(false);
  }, [currentSearch, urlDisplay, searchProfessionals, setSearchParams]);

  // ===== RADIUS CHANGE: patch currentSearch directly =====
  const handleRadiusChange = useCallback((newRadius: number) => {
    const base = currentSearch ?? {
      service: urlDisplay.query,
      location: urlDisplay.location,
      petType: sidebarFilters.petType,
      radius: newRadius,
      searchMode: urlDisplay.searchMode,
      coordinates: currentSearch?.coordinates ?? null,
      ...buildSidebarFields(sidebarFilters),
    };

    const updated: SearchFilters = { ...base, radius: newRadius };

    setCurrentSearch(updated);
    searchProfessionals(updated);
    syncUrlForBookmark(setSearchParams, updated);
  }, [currentSearch, urlDisplay, sidebarFilters, searchProfessionals, setSearchParams]);

  // ===== SEARCH MODE CHANGE: patch currentSearch directly =====
  const handleSearchModeChange = useCallback((mode: SearchMode) => {
    const base = currentSearch ?? {
      service: urlDisplay.query,
      location: urlDisplay.location,
      petType: sidebarFilters.petType,
      radius: urlDisplay.radius,
      searchMode: mode,
      coordinates: currentSearch?.coordinates ?? null,
      ...buildSidebarFields(sidebarFilters),
    };

    const updated: SearchFilters = { ...base, searchMode: mode };

    setCurrentSearch(updated);
    searchProfessionals(updated);
    syncUrlForBookmark(setSearchParams, updated);
  }, [currentSearch, urlDisplay, sidebarFilters, searchProfessionals, setSearchParams]);

  // ===== RETRY: use currentSearch =====
  const handleRetry = useCallback(() => {
    if (currentSearch) {
      searchProfessionals(currentSearch);
    }
  }, [currentSearch, searchProfessionals]);

  const sortedProfessionals = useMemo(() => {
    return [...professionals].sort((a, b) => {
      switch (sortBy) {
        case "rating": return b.rating - a.rating;
        case "distance":
          if (a.distanceKm === undefined && b.distanceKm === undefined) return 0;
          if (a.distanceKm === undefined) return 1;
          if (b.distanceKm === undefined) return -1;
          return a.distanceKm - b.distanceKm;
        case "price-low":
          return parseFloat(a.priceRange?.replace(/[^\d.]/g, "") || "999999") -
                 parseFloat(b.priceRange?.replace(/[^\d.]/g, "") || "999999");
        default: return b.reviewCount - a.reviewCount;
      }
    });
  }, [professionals, sortBy]);

  const modeLabel = displaySearchMode === 'local_fixo' ? 'Local Fixo' : displaySearchMode === 'domiciliar' ? 'Domiciliar' : '';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="border-b border-border bg-card">
        <div className="container py-4">
          <SearchBar 
            variant="compact" 
            onSearch={handleSearch}
            initialValues={{
              service: urlDisplay.query,
              location: urlDisplay.location,
              petType: urlDisplay.petType,
              radius: urlDisplay.radius,
            }}
          />
        </div>
      </div>

      <main className="flex-1">
        <div className="container py-6">
          <div className="flex gap-6">
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-20">
                <FilterSidebar 
                  onFiltersChange={handleFiltersChange}
                  onRadiusChange={handleRadiusChange}
                  onSearchModeChange={handleSearchModeChange}
                  selectedRadius={displayRadius}
                  searchMode={displaySearchMode}
                  initialFilters={sidebarFilters}
                />
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-xl font-semibold">
                    {displayQuery || "Todos os profissionais"}
                  </h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {displayLocation || "Todas as regiões"} • {totalCount} resultado{totalCount !== 1 ? "s" : ""}
                    {displaySearchMode !== 'domiciliar' && displayRadius && ` • +${displayRadius} km`}
                    {modeLabel && ` • ${modeLabel}`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden">
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Filtros
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 p-0">
                      <div className="p-4">
                        <FilterSidebar 
                          onFiltersChange={handleFiltersChange}
                          onRadiusChange={handleRadiusChange}
                          onSearchModeChange={handleSearchModeChange}
                          selectedRadius={displayRadius}
                          searchMode={displaySearchMode}
                          initialFilters={sidebarFilters}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        Ordenar
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {sortOptions.map(option => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => setSortBy(option.value)}
                          className={sortBy === option.value ? "bg-muted" : ""}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="hidden sm:flex items-center border border-border rounded-lg p-1 bg-muted/30">
                    <button onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-background shadow-sm" : "hover:bg-muted"}`}
                      title="Lista"><LayoutList className="w-4 h-4" /></button>
                    <button onClick={() => setViewMode("split")}
                      className={`p-1.5 rounded transition-colors ${viewMode === "split" ? "bg-background shadow-sm" : "hover:bg-muted"}`}
                      title="Lista + Mapa"><Grid className="w-4 h-4" /></button>
                    <button onClick={() => setViewMode("map")}
                      className={`p-1.5 rounded transition-colors ${viewMode === "map" ? "bg-background shadow-sm" : "hover:bg-muted"}`}
                      title="Mapa"><MapIcon className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Buscando profissionais...</span>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Erro ao buscar profissionais</h3>
                  <p className="text-muted-foreground mb-4">Tente novamente mais tarde</p>
                  <Button onClick={handleRetry}>Tentar novamente</Button>
                </div>
              )}

              {!isLoading && !error && sortedProfessionals.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Nenhum profissional encontrado</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Tente expandir o raio de busca, mudar a localização ou ajustar os filtros
                  </p>
                  <Button variant="outline" onClick={() => {
                    const newFilters = defaultFilterState;
                    setSidebarFilters(newFilters);
                    if (currentSearch) {
                      const updated: SearchFilters = {
                        ...currentSearch,
                        radius: 30,
                        searchMode: 'all',
                        ...buildSidebarFields(newFilters),
                      };
                      setCurrentSearch(updated);
                      searchProfessionals(updated);
                      syncUrlForBookmark(setSearchParams, updated);
                    }
                  }}>
                    Limpar filtros e expandir busca
                  </Button>
                </div>
              )}

              {!isLoading && !error && sortedProfessionals.length > 0 && (
                <div className={`
                  ${viewMode === "split" ? "grid lg:grid-cols-2 gap-6" : ""}
                  ${viewMode === "map" ? "h-[calc(100vh-300px)]" : ""}
                `}>
                  {(viewMode === "list" || viewMode === "split") && (
                    <div className={`space-y-4 ${viewMode === "split" ? "max-h-[calc(100vh-300px)] overflow-y-auto pr-2" : ""}`}>
                      {sortedProfessionals.map((professional, index) => (
                        <motion.div
                          key={professional.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => setSelectedProfessionalId(professional.id)}
                          className={`cursor-pointer transition-all ${
                            selectedProfessionalId === professional.id ? "ring-2 ring-primary rounded-2xl" : ""
                          }`}
                        >
                          <ProfessionalCard 
                            {...professional} 
                            photo={professional.photo || fallbackPhotos[index % fallbackPhotos.length]}
                            distance={professional.distanceKm 
                              ? `${professional.distanceKm.toFixed(1)} km` 
                              : professional.distance}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {(viewMode === "map" || viewMode === "split") && (
                    <div className={`
                      ${viewMode === "split" ? "sticky top-20 h-[calc(100vh-300px)]" : "h-full"}
                      ${viewMode === "map" ? "h-[calc(100vh-300px)]" : ""}
                    `}>
                      <Suspense fallback={
                        <div className="h-full bg-muted rounded-xl flex items-center justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      }>
                        <ProfessionalMap
                          professionals={sortedProfessionals.map((p, i) => ({
                            ...p, photo: p.photo || fallbackPhotos[i % fallbackPhotos.length],
                          }))}
                          userLocation={displayCoordinates}
                          searchRadius={displaySearchMode !== 'domiciliar' ? displayRadius : 0}
                          onProfessionalClick={(p: any) => setSelectedProfessionalId(p.id)}
                          selectedProfessionalId={selectedProfessionalId}
                          className="h-full"
                        />
                      </Suspense>
                    </div>
                  )}
                </div>
              )}

              {!isLoading && !error && sortedProfessionals.length > 0 && viewMode !== "map" && (
                <div className="mt-8 text-center">
                  <Button variant="outline" size="lg">Carregar mais resultados</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
