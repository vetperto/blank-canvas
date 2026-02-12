import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: { text: string; included: boolean }[];
  planType: "basic" | "intermediate" | "complete" | "enterprise";
  popular?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
  buttonText?: string;
}

const planStyles = {
  basic: {
    badge: "bg-plan-basic/10 text-plan-basic",
    button: "bg-plan-basic hover:bg-plan-basic/90",
    border: "border-plan-basic/20",
    gradient: "from-slate-500 to-slate-600",
  },
  intermediate: {
    badge: "bg-plan-intermediate/10 text-plan-intermediate",
    button: "bg-plan-intermediate hover:bg-plan-intermediate/90",
    border: "border-plan-intermediate/30",
    gradient: "from-primary to-primary-dark",
  },
  complete: {
    badge: "bg-plan-complete/10 text-plan-complete",
    button: "bg-gradient-warm hover:opacity-90",
    border: "border-plan-complete/30",
    gradient: "from-amber-500 to-orange-500",
  },
  enterprise: {
    badge: "bg-plan-enterprise/10 text-plan-enterprise",
    button: "bg-plan-enterprise hover:bg-plan-enterprise/90",
    border: "border-plan-enterprise/30",
    gradient: "from-purple-500 to-violet-600",
  },
};

export function PlanCard({
  name,
  price,
  period = "/mês",
  description,
  features,
  planType,
  popular,
  onSelect,
  disabled = false,
  buttonText = "Começar Agora",
}: PlanCardProps) {
  const styles = planStyles[planType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative bg-card rounded-2xl border-2 p-6 shadow-card hover:shadow-hover transition-all",
        popular ? styles.border : "border-border"
      )}
    >
      {popular && (
        <div className={cn(
          "absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold",
          "bg-gradient-to-r text-white",
          styles.gradient
        )}>
          Mais Popular
        </div>
      )}

      <div className="text-center mb-6">
        <span className={cn("inline-block px-3 py-1 rounded-full text-xs font-medium mb-3", styles.badge)}>
          {name}
        </span>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground">{period}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            {feature.included ? (
              <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-0.5" />
            )}
            <span className={cn(
              "text-sm",
              !feature.included && "text-muted-foreground/50"
            )}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onSelect}
        disabled={disabled}
        className={cn("w-full text-white", styles.button, disabled && "opacity-50 cursor-not-allowed")}
      >
        {buttonText}
      </Button>
    </motion.div>
  );
}
