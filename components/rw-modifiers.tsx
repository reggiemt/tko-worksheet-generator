"use client";

import type { RWModifiers } from "@/lib/rw-types";
import { Label } from "./ui/label";
import { Lock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RWModifierToggle {
  key: keyof Omit<RWModifiers, "passageType">;
  label: string;
  description: string;
  icon: string;
}

const TOGGLE_OPTIONS: RWModifierToggle[] = [
  {
    key: "includeCharts",
    label: "Include Charts/Tables",
    description: "Add data tables or chart descriptions where appropriate",
    icon: "📊",
  },
  {
    key: "includePoetry",
    label: "Include Poetry",
    description: "Feature poetry excerpts and literary passages",
    icon: "📝",
  },
  {
    key: "includeDualPassages",
    label: "Dual Passages",
    description: "Include questions comparing two related passages",
    icon: "📄",
  },
  {
    key: "grammarHeavy",
    label: "Grammar Heavy",
    description: "Emphasize punctuation, agreement, and conventions questions",
    icon: "✍️",
  },
  {
    key: "vocabularyHeavy",
    label: "Vocabulary Heavy",
    description: "Emphasize words-in-context with challenging academic vocabulary",
    icon: "📖",
  },
  {
    key: "transitionsFocus",
    label: "Transitions Focus",
    description: "More questions testing logical connectors between ideas",
    icon: "🔗",
  },
  {
    key: "evidenceFocus",
    label: "Evidence Focus",
    description: "More Command of Evidence questions (textual and quantitative)",
    icon: "🔍",
  },
];

const PASSAGE_TYPE_OPTIONS = [
  { value: "mixed", label: "Mixed (All Types)" },
  { value: "science", label: "Science" },
  { value: "literature", label: "Literature" },
  { value: "history", label: "History/Social Studies" },
  { value: "humanities", label: "Humanities" },
];

interface RWModifiersProps {
  value: RWModifiers;
  onChange: (modifiers: RWModifiers) => void;
  disabled?: boolean;
}

export function RWModifiersSelector({ value, onChange, disabled }: RWModifiersProps) {
  const activeCount = disabled
    ? 0
    : Object.entries(value).filter(([k, v]) => {
        if (k === "passageType") return v !== "mixed";
        return v === true;
      }).length;

  const toggle = (key: keyof Omit<RWModifiers, "passageType">) => {
    if (disabled) return;
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-[#1a365d]">
          R/W Modifiers
        </Label>
        {activeCount > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a365d] text-white">
            {activeCount} active
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground -mt-1">
        Customize passage types and question emphasis
      </p>
      {disabled && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          <span>
            R/W modifiers are available on paid plans.{" "}
            <a href="/pricing" className="underline font-semibold hover:text-amber-900">
              Upgrade →
            </a>
          </span>
        </div>
      )}

      {/* Passage Type Dropdown */}
      <div className={`space-y-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
        <Label htmlFor="passage-type" className="text-sm">Passage Type</Label>
        <Select
          value={value.passageType}
          onValueChange={(v) => onChange({ ...value, passageType: v as RWModifiers["passageType"] })}
          disabled={disabled}
        >
          <SelectTrigger id="passage-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PASSAGE_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Toggle Options */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
        {TOGGLE_OPTIONS.map((opt) => {
          const isActive = disabled ? false : value[opt.key];
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => toggle(opt.key)}
              disabled={disabled}
              className={`
                flex items-start gap-3 p-3 rounded-lg border text-left transition-all relative
                ${disabled
                  ? "border-border cursor-not-allowed"
                  : isActive
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
              {disabled ? (
                <div className="ml-auto shrink-0 mt-0.5">
                  <Lock className="h-4 w-4 text-muted-foreground/40" />
                </div>
              ) : (
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
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
