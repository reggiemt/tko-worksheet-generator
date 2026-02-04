"use client";

import { RW_CATEGORIES, type RWSubcategory } from "@/lib/rw-categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface RWCategorySelectorProps {
  category: string;
  subcategory: string;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
}

export function RWCategorySelector({
  category,
  subcategory,
  onCategoryChange,
  onSubcategoryChange,
}: RWCategorySelectorProps) {
  const selectedCategory = RW_CATEGORIES.find((c) => c.id === category);
  const subcategories: RWSubcategory[] = selectedCategory?.subcategories ?? [];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rw-category">Domain</Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger id="rw-category">
            <SelectValue placeholder="Select a domain" />
          </SelectTrigger>
          <SelectContent>
            {RW_CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rw-subcategory">Skill</Label>
        <Select
          value={subcategory}
          onValueChange={onSubcategoryChange}
          disabled={!category}
        >
          <SelectTrigger id="rw-subcategory">
            <SelectValue placeholder={category ? "Select a skill" : "Select a domain first"} />
          </SelectTrigger>
          <SelectContent>
            {subcategories.map((sub) => (
              <SelectItem key={sub.id} value={sub.id}>
                <div className="flex flex-col">
                  <span>{sub.name}</span>
                  <span className="text-xs text-muted-foreground">{sub.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
