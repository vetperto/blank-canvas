import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Wallet,
  Loader2,
  Check,
  Save
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PaymentMethod {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "credit_card",
    label: "Cartão de Crédito",
    icon: <CreditCard className="w-5 h-5" />,
    description: "Aceita pagamentos via cartão de crédito"
  },
  {
    id: "debit_card",
    label: "Cartão de Débito",
    icon: <CreditCard className="w-5 h-5" />,
    description: "Aceita pagamentos via cartão de débito"
  },
  {
    id: "pix",
    label: "PIX",
    icon: <Smartphone className="w-5 h-5" />,
    description: "Aceita pagamentos instantâneos via PIX"
  },
  {
    id: "cash",
    label: "Dinheiro",
    icon: <Banknote className="w-5 h-5" />,
    description: "Aceita pagamentos em dinheiro"
  }
];

// Map internal IDs to display labels for public profile
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  pix: "PIX",
  cash: "Dinheiro"
};

export function PaymentMethodsManager() {
  const { profile } = useAuth();
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalMethods, setOriginalMethods] = useState<string[]>([]);

  // Fetch current payment methods
  useEffect(() => {
    async function fetchPaymentMethods() {
      if (!profile?.id) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("payment_methods")
          .eq("id", profile.id)
          .single();

        if (error) throw error;
        
        const methods = (data?.payment_methods as string[]) || [];
        setSelectedMethods(methods);
        setOriginalMethods(methods);
      } catch (err) {
        console.error("Error fetching payment methods:", err);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível carregar os métodos de pagamento.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchPaymentMethods();
  }, [profile?.id]);

  // Track changes
  useEffect(() => {
    const hasChanged = 
      selectedMethods.length !== originalMethods.length ||
      selectedMethods.some(m => !originalMethods.includes(m)) ||
      originalMethods.some(m => !selectedMethods.includes(m));
    setHasChanges(hasChanged);
  }, [selectedMethods, originalMethods]);

  const toggleMethod = (methodId: string) => {
    setSelectedMethods(prev => 
      prev.includes(methodId)
        ? prev.filter(m => m !== methodId)
        : [...prev, methodId]
    );
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ payment_methods: selectedMethods })
        .eq("id", profile.id);

      if (error) throw error;

      setOriginalMethods(selectedMethods);
      setHasChanges(false);
      
      toast({
        title: "Salvo com sucesso!",
        description: "Seus métodos de pagamento foram atualizados.",
      });
    } catch (err) {
      console.error("Error saving payment methods:", err);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os métodos de pagamento.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedMethods(originalMethods);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-secondary" />
          Métodos de Pagamento
        </CardTitle>
        <CardDescription>
          Selecione os métodos de pagamento que você aceita. Estas informações serão exibidas no seu perfil público.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {PAYMENT_METHODS.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <label
                htmlFor={method.id}
                className={`
                  flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all
                  ${selectedMethods.includes(method.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }
                `}
              >
                <Checkbox
                  id={method.id}
                  checked={selectedMethods.includes(method.id)}
                  onCheckedChange={() => toggleMethod(method.id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className={`
                  p-2 rounded-lg
                  ${selectedMethods.includes(method.id) ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
                `}>
                  {method.icon}
                </div>
                <div className="flex-1">
                  <Label htmlFor={method.id} className="font-medium cursor-pointer">
                    {method.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {method.description}
                  </p>
                </div>
                {selectedMethods.includes(method.id) && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </label>
            </motion.div>
          ))}
        </div>

        {selectedMethods.length === 0 && (
          <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            ⚠️ Nenhum método de pagamento selecionado. Clientes não saberão como podem pagar.
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {selectedMethods.length} método{selectedMethods.length !== 1 ? "s" : ""} selecionado{selectedMethods.length !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-2">
            {hasChanges && (
              <Button variant="outline" onClick={handleReset} disabled={isSaving}>
                Cancelar
              </Button>
            )}
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || isSaving}
              className="min-w-[100px]"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
