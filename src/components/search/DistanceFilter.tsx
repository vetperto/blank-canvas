import { memo, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface DistanceFilterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  showQuickOptions?: boolean;
}

const quickOptions = [
  { value: 1, label: "1 km" },
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 20, label: "20 km" },
  { value: 50, label: "50 km" },
];

export const DistanceFilter = memo(function DistanceFilter({
  value,
  onChange,
  min = 1,
  max = 50,
  className,
  showQuickOptions = true,
}: DistanceFilterProps) {
  const handleSliderChange = useCallback((values: number[]) => {
    onChange(values[0]);
  }, [onChange]);

  const handleQuickSelect = useCallback((newValue: number) => {
    onChange(newValue);
  }, [onChange]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Slider */}
      <div className="px-1">
        <Slider
          value={[value]}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
          <span>{min} km</span>
          <span className="font-medium text-primary">+{value} km</span>
          <span>{max} km</span>
        </div>
      </div>

      {/* Quick options */}
      {showQuickOptions && (
        <div className="flex flex-wrap gap-1.5">
          {quickOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleQuickSelect(option.value)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-full border transition-colors",
                value === option.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary/50 hover:bg-muted"
              )}
            >
              +{option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
