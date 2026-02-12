import { useState, useCallback } from "react";
import { Filter, X, RotateCcw, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DistanceFilter } from "./DistanceFilter";
import { FilterState } from "./FilterSidebar";

interface FilterGroup {
  id: keyof FilterState;
  title: string;
  options: { value: string; label: string }[];
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
    id: "atendimento",
    title: "Tipo de Atendimento",
    options: [
      { value: "domiciliar", label: "Atendimento Domiciliar" },
      { value: "clinica", label: "Em Clínica/Consultório" },
      { value: "hospital", label: "Hospital Veterinário" },
      { value: "petshop", label: "Pet Shop" },
    ],
  },
  {
    id: "especialidade",
    title: "Especialidade",
    options: [
      { value: "clinica-geral", label: "Clínica Geral" },
      { value: "cardiologia", label: "Cardiologia" },
      { value: "dermatologia", label: "Dermatologia" },
      { value: "ortopedia", label: "Ortopedia/Cirurgia" },
      { value: "oncologia", label: "Oncologia" },
    ],
  },
  {
    id: "servicos",
    title: "Serviços",
    options: [
      { value: "banho-tosa", label: "Banho e Tosa" },
      { value: "pet-walker", label: "Pet Walker" },
      { value: "adestramento", label: "Adestramento" },
      { value: "hospedagem", label: "Hospedagem Pet" },
      { value: "vacinas", label: "Vacinação" },
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

interface MobileFilterSheetProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  radius: number;
  onRadiusChange: (radius: number) => void;
  onApply?: () => void;
}

export function MobileFilterSheet({
  filters,
  onFiltersChange,
  radius,
  onRadiusChange,
  onApply,
}: MobileFilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [localRadius, setLocalRadius] = useState(radius);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["petType"]);

  const totalSelected = Object.values(filters).flat().length;

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  }, []);

  const toggleFilter = useCallback((groupId: keyof FilterState, value: string) => {
    setLocalFilters((prev) => {
      const current = prev[groupId] || [];
      let updated: string[];
      
      if (groupId === "avaliacao") {
        updated = current.includes(value) ? [] : [value];
      } else {
        updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
      }
      
      return { ...prev, [groupId]: updated };
    });
  }, []);

  const clearFilters = useCallback(() => {
    const emptyFilters: FilterState = {
      petType: [],
      atendimento: [],
      especialidade: [],
      servicos: [],
      avaliacao: [],
      disponibilidade: [],
      pagamento: [],
    };
    setLocalFilters(emptyFilters);
    setLocalRadius(5);
  }, []);

  const handleApply = useCallback(() => {
    onFiltersChange(localFilters);
    onRadiusChange(localRadius);
    onApply?.();
    setIsOpen(false);
  }, [localFilters, localRadius, onFiltersChange, onRadiusChange, onApply]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setLocalFilters(filters);
      setLocalRadius(radius);
    }
  };

  const localTotalSelected = Object.values(localFilters).flat().length;

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 relative"
        >
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
          {totalSelected > 0 && (
            <Badge 
              variant="default" 
              className="h-5 min-w-[20px] text-xs absolute -top-2 -right-2"
            >
              {totalSelected}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="bottom" 
        className="h-[85vh] rounded-t-3xl flex flex-col"
      >
        <SheetHeader className="pb-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">Filtros</SheetTitle>
            {localTotalSelected > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Limpar ({localTotalSelected})
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 -mx-6 px-6">
          {/* Active Filters */}
          {localTotalSelected > 0 && (
            <div className="mb-4 pb-4 border-b border-border">
              <p className="text-xs text-muted-foreground mb-2">Filtros selecionados:</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(localFilters).map(([groupId, values]) =>
                  values.map((value) => {
                    const group = filterGroups.find((g) => g.id === groupId);
                    const option = group?.options.find((o) => o.value === value);
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

          {/* Distance Filter */}
          <div className="mb-6 pb-4 border-b border-border">
            <h4 className="font-medium text-sm mb-3">Raio de Distância</h4>
            <DistanceFilter
              value={localRadius}
              onChange={setLocalRadius}
              min={1}
              max={50}
              showQuickOptions
            />
          </div>

          {/* Filter Groups */}
          <div className="space-y-2">
            {filterGroups.map((group) => {
              const selectedCount = localFilters[group.id]?.length || 0;
              const isExpanded = expandedGroups.includes(group.id);

              return (
                <Collapsible
                  key={group.id}
                  open={isExpanded}
                  onOpenChange={() => toggleGroup(group.id)}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-3 px-2 rounded-lg hover:bg-muted transition-colors">
                    <span className="flex items-center gap-2 font-medium text-sm">
                      {group.title}
                      {selectedCount > 0 && (
                        <Badge variant="default" className="h-5 min-w-[20px] text-xs">
                          {selectedCount}
                        </Badge>
                      )}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>

                  <CollapsibleContent className="overflow-hidden">
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="py-2 space-y-1">
                            {group.options.map((option) => {
                              const isSelected = localFilters[group.id]?.includes(option.value);
                              return (
                                <label
                                  key={option.value}
                                  className={`flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer transition-colors ${
                                    isSelected
                                      ? "bg-primary/10"
                                      : "hover:bg-muted"
                                  }`}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => toggleFilter(group.id, option.value)}
                                  />
                                  <span className={`text-sm ${isSelected ? "font-medium" : ""}`}>
                                    {option.label}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </div>

        <SheetFooter className="pt-4 border-t border-border shrink-0 gap-3 sm:gap-3">
          <SheetClose asChild>
            <Button variant="outline" className="flex-1">
              Cancelar
            </Button>
          </SheetClose>
          <Button 
            className="flex-1 bg-gradient-primary"
            onClick={handleApply}
          >
            Aplicar Filtros
            {localTotalSelected > 0 && ` (${localTotalSelected})`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
