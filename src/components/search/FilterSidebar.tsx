import { useState, useCallback, useEffect } from "react";
import { ChevronDown, ChevronUp, X, RotateCcw, Building2, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DistanceFilter } from "./DistanceFilter";
import type { SearchMode } from "@/lib/search/types";

export interface FilterState {
  petType: string[];
  atendimento: string[];
  especialidade: string[];
  servicos: string[];
  avaliacao: string[];
  disponibilidade: string[];
  pagamento: string[];
}

interface FilterGroup {
  id: keyof FilterState;
  title: string;
  options: { value: string; label: string; count?: number }[];
}

const filterGroups: FilterGroup[] = [
  {
    id: "petType",
    title: "Tipo de Pet",
    options: [
      { value: "cao", label: "🐕 Cães" },
      { value: "gato", label: "🐱 Gatos" },
      { value: "pequeno", label: "🐹 Animais Pequenos" },
      { value: "grande", label: "🐴 Animais Grandes" },
      { value: "producao", label: "🐄 Animais de Produção" },
      { value: "silvestres", label: "🦜 Silvestres/Exóticos" },
    ],
  },
  {
    id: "especialidade",
    title: "Especialidade Veterinária",
    options: [
      { value: "clinica-geral", label: "Clínica Geral" },
      { value: "cardiologia", label: "Cardiologia" },
      { value: "dermatologia", label: "Dermatologia" },
      { value: "ortopedia", label: "Ortopedia/Cirurgia" },
      { value: "oncologia", label: "Oncologia" },
      { value: "oftalmologia", label: "Oftalmologia" },
      { value: "neurologia", label: "Neurologia" },
      { value: "felina", label: "Medicina Felina" },
      { value: "silvestres", label: "Silvestres/Exóticos" },
    ],
  },
  {
    id: "servicos",
    title: "Serviços Pet",
    options: [
      { value: "banho-tosa", label: "Banho e Tosa" },
      { value: "pet-walker", label: "Pet Walker" },
      { value: "adestramento", label: "Adestramento" },
      { value: "hospedagem", label: "Hospedagem Pet" },
      { value: "vacinas", label: "Vacinação" },
      { value: "exames", label: "Exames Laboratoriais" },
      { value: "usg", label: "Ultrassonografia" },
    ],
  },
  {
    id: "avaliacao",
    title: "Avaliação Mínima",
    options: [
      { value: "4.5", label: "⭐ 4.5 ou mais" },
      { value: "4.0", label: "⭐ 4.0 ou mais" },
      { value: "3.5", label: "⭐ 3.5 ou mais" },
    ],
  },
  {
    id: "disponibilidade",
    title: "Disponibilidade",
    options: [
      { value: "hoje", label: "Disponível Hoje" },
      { value: "semana", label: "Esta Semana" },
      { value: "urgencia", label: "Urgência/Emergência" },
    ],
  },
  {
    id: "pagamento",
    title: "Formas de Pagamento",
    options: [
      { value: "credit_card", label: "💳 Cartão de Crédito" },
      { value: "debit_card", label: "💳 Cartão de Débito" },
      { value: "pix", label: "📱 PIX" },
      { value: "cash", label: "💵 Dinheiro" },
    ],
  },
];

interface FilterSidebarProps {
  onFiltersChange?: (filters: FilterState) => void;
  onRadiusChange?: (radius: number) => void;
  onSearchModeChange?: (mode: SearchMode) => void;
  selectedRadius?: number;
  searchMode?: SearchMode;
  initialFilters?: Partial<FilterState>;
}

const defaultFilters: FilterState = {
  petType: [],
  atendimento: [],
  especialidade: [],
  servicos: [],
  avaliacao: [],
  disponibilidade: [],
  pagamento: [],
};

export function FilterSidebar({ 
  onFiltersChange, 
  onRadiusChange,
  onSearchModeChange,
  selectedRadius = 5,
  searchMode = 'all',
  initialFilters 
}: FilterSidebarProps) {
  const [selectedFilters, setSelectedFilters] = useState<FilterState>(() => ({
    ...defaultFilters,
    ...initialFilters,
  }));
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["petType", "especialidade"]);
  const [radius, setRadius] = useState(selectedRadius);
  const [mode, setMode] = useState<SearchMode>(searchMode);

  useEffect(() => { setRadius(selectedRadius); }, [selectedRadius]);
  useEffect(() => { setMode(searchMode); }, [searchMode]);

  useEffect(() => {
    if (initialFilters) {
      setSelectedFilters(prev => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  }, []);

  const toggleFilter = useCallback((groupId: keyof FilterState, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[groupId] || [];
      let updated: string[];
      if (groupId === "avaliacao") {
        updated = current.includes(value) ? [] : [value];
      } else {
        updated = current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value];
      }
      const newFilters = { ...prev, [groupId]: updated };
      setTimeout(() => onFiltersChange?.(newFilters), 0);
      return newFilters;
    });
  }, [onFiltersChange]);

  const clearFilters = useCallback(() => {
    setSelectedFilters(defaultFilters);
    setRadius(5);
    setMode('all');
    onFiltersChange?.(defaultFilters);
    onRadiusChange?.(5);
    onSearchModeChange?.('all');
  }, [onFiltersChange, onRadiusChange, onSearchModeChange]);

  const handleRadiusChange = useCallback((value: number) => {
    setRadius(value);
    onRadiusChange?.(value);
  }, [onRadiusChange]);

  const handleModeChange = useCallback((newMode: SearchMode) => {
    setMode(newMode);
    onSearchModeChange?.(newMode);
  }, [onSearchModeChange]);

  const totalSelected = Object.values(selectedFilters).flat().length;

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Filtros</h3>
        {totalSelected > 0 && (
          <Button 
            variant="ghost" size="sm" onClick={clearFilters} 
            className="text-sm text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Limpar ({totalSelected})
          </Button>
        )}
      </div>

      {/* Active Filters Summary */}
      {totalSelected > 0 && (
        <div className="mb-4 pb-4 border-b border-border">
          <p className="text-xs text-muted-foreground mb-2">Filtros ativos:</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(selectedFilters).map(([groupId, values]) =>
              values.map(value => {
                const group = filterGroups.find(g => g.id === groupId);
                const option = group?.options.find(o => o.value === value);
                return (
                  <Badge
                    key={`${groupId}-${value}`}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => toggleFilter(groupId as keyof FilterState, value)}
                  >
                    {option?.label || value}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Search Mode Selector */}
      <div className="mb-6 pb-4 border-b border-border">
        <h4 className="font-medium text-sm mb-3">Modo de Busca</h4>
        <div className="grid grid-cols-1 gap-2">
          {[
            { value: 'all' as SearchMode, label: 'Todos', icon: null, desc: 'Local fixo + Domiciliar' },
            { value: 'local_fixo' as SearchMode, label: 'Local Fixo', icon: Building2, desc: 'Clínicas e consultórios' },
            { value: 'domiciliar' as SearchMode, label: 'Domiciliar', icon: Home, desc: 'Atendimento em casa' },
          ].map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => handleModeChange(opt.value)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  mode === opt.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/30 hover:bg-muted/50'
                }`}
              >
                {Icon && <Icon className={`w-4 h-4 shrink-0 ${mode === opt.value ? 'text-primary' : 'text-muted-foreground'}`} />}
                {!Icon && <span className="w-4 h-4 shrink-0 text-center text-sm">🔍</span>}
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${mode === opt.value ? 'text-primary' : ''}`}>{opt.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{opt.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Radius Filter - Only show for local_fixo and all modes */}
      {mode !== 'domiciliar' && (
        <div className="mb-6 pb-4 border-b border-border">
          <h4 className="font-medium text-sm mb-3">Raio de Distância</h4>
          <DistanceFilter value={radius} onChange={handleRadiusChange} min={1} max={50} showQuickOptions />
        </div>
      )}

      {/* Domiciliar info */}
      {mode === 'domiciliar' && (
        <div className="mb-6 pb-4 border-b border-border">
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">
              <Home className="w-3.5 h-3.5 inline mr-1" />
              No modo domiciliar, os resultados são filtrados pelo raio de atendimento de cada profissional.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filterGroups.map(group => (
          <div key={group.id} className="border-b border-border pb-4 last:border-0">
            <button
              onClick={() => toggleGroup(group.id)}
              className="flex items-center justify-between w-full py-2 text-left font-medium hover:text-primary transition-colors"
            >
              <span className="flex items-center gap-2">
                {group.title}
                {selectedFilters[group.id]?.length > 0 && (
                  <Badge variant="default" className="h-5 min-w-[20px] text-xs">
                    {selectedFilters[group.id].length}
                  </Badge>
                )}
              </span>
              {expandedGroups.includes(group.id) ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            <AnimatePresence>
              {expandedGroups.includes(group.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 space-y-2">
                    {group.options.map(option => {
                      const isSelected = selectedFilters[group.id]?.includes(option.value);
                      return (
                        <label
                          key={option.value}
                          className={`flex items-center gap-3 py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted"
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleFilter(group.id, option.value)}
                          />
                          <span className={`flex-1 text-sm ${isSelected ? "font-medium" : ""}`}>
                            {option.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
