"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Difficulty } from "@/lib/types";

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (value: Difficulty) => void;
}

const DIFFICULTIES: { value: Difficulty; label: string; description: string }[] = [
  {
    value: "easy",
    label: "Easy",
    description: "Single concept, 1-2 steps",
  },
  {
    value: "medium",
    label: "Medium",
    description: "2-3 steps, some interpretation",
  },
  {
    value: "hard",
    label: "Hard",
    description: "Multi-step, combines concepts",
  },
];

export function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Difficulty</Label>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as Difficulty)}
        className="flex gap-4"
      >
        {DIFFICULTIES.map((diff) => (
          <div key={diff.value} className="flex items-center space-x-2">
            <RadioGroupItem value={diff.value} id={diff.value} />
            <Label
              htmlFor={diff.value}
              className="cursor-pointer font-normal"
              title={diff.description}
            >
              {diff.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      <p className="text-xs text-muted-foreground">
        {DIFFICULTIES.find((d) => d.value === value)?.description}
      </p>
    </div>
  );
}
