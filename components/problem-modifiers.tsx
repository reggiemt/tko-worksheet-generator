"use client";

import type { ProblemModifiers } from "@/lib/types";
import { Label } from "./ui/label";

interface ModifierOption {
  key: keyof ProblemModifiers;
  label: string;
  description: string;
  icon: string;
}

const MODIFIER_OPTIONS: ModifierOption[] = [
  {
    key: "includeFractions",
    label: "Include Fractions",
    description: "Problems involving fractional coefficients, answers, or arithmetic",
    icon: "½",
  },
  {
    key: "includeUnknownConstants",
    label: "Unknown Constants",
    description: 'Problems with variables like k, a, c ("For what value of k...")',
    icon: "k",
  },
  {
    key: "noDesmos",
    label: "No-Desmos Problems",
    description: "Problems requiring algebraic reasoning that can't be shortcut with a graphing calculator",
    icon: "🚫",
  },
  {
    key: "wordProblemsOnly",
    label: "Word Problems Only",
    description: "All problems presented as real-world contexts and scenarios",
    icon: "📖",
  },
  {
    key: "multiStepOnly",
    label: "Multi-Step Only",
    description: "Every problem requires 2+ steps to solve — no quick one-step solves",
    icon: "🔗",
  },
  {
    key: "gridInOnly",
    label: "All Grid-In (No Multiple Choice)",
    description: "Student-produced responses only — no answer choices to guess from",
    icon: "✏️",
  },
];

interface ProblemModifiersProps {
  value: ProblemModifiers;
  onChange: (modifiers: ProblemModifiers) => void;
}

export function ProblemModifiersSelector({ value, onChange }: ProblemModifiersProps) {
  const activeCount = Object.values(value).filter(Boolean).length;

  const toggle = (key: keyof ProblemModifiers) => {
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-[#1a365d]">
          Problem Modifiers
        </Label>
        {activeCount > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a365d] text-white">
            {activeCount} active
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground -mt-1">
        Fine-tune your worksheet with specific constraints
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {MODIFIER_OPTIONS.map((opt) => {
          const isActive = value[opt.key];
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => toggle(opt.key)}
              className={`
                flex items-start gap-3 p-3 rounded-lg border text-left transition-all
                ${isActive
                  ? "border-[#1a365d] bg-[#1a365d]/5 ring-1 ring-[#1a365d]/20"
                  : "border-border hover:border-[#1a365d]/30 hover:bg-muted/50"
                }
              `}
            >
              <span className="text-lg leading-none mt-0.5 shrink-0 w-6 text-center">
                {opt.icon}
              </span>
              <div className="min-w-0">
                <div className={`text-sm font-medium ${isActive ? "text-[#1a365d]" : ""}`}>
                  {opt.label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  {opt.description}
                </div>
              </div>
              <div className={`
                ml-auto shrink-0 mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                ${isActive
                  ? "border-[#1a365d] bg-[#1a365d]"
                  : "border-muted-foreground/30"
                }
              `}>
                {isActive && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
