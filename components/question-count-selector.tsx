"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { QuestionCount } from "@/lib/types";

interface QuestionCountSelectorProps {
  value: QuestionCount;
  onChange: (value: QuestionCount) => void;
}

const COUNTS: QuestionCount[] = [10, 15, 20];

export function QuestionCountSelector({ value, onChange }: QuestionCountSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Number of Questions</Label>
      <RadioGroup
        value={value.toString()}
        onValueChange={(v) => onChange(parseInt(v) as QuestionCount)}
        className="flex gap-4"
      >
        {COUNTS.map((count) => (
          <div key={count} className="flex items-center space-x-2">
            <RadioGroupItem value={count.toString()} id={`count-${count}`} />
            <Label htmlFor={`count-${count}`} className="cursor-pointer font-normal">
              {count}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
