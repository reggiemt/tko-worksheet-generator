"use client";

import { MATH_CATEGORIES, type Subcategory } from "@/lib/categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CategorySelectorProps {
  category: string;
  subcategory: string;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
}

export function CategorySelector({
  category,
  subcategory,
  onCategoryChange,
  onSubcategoryChange,
}: CategorySelectorProps) {
  const selectedCategory = MATH_CATEGORIES.find((c) => c.id === category);
  const subcategories: Subcategory[] = selectedCategory?.subcategories ?? [];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {MATH_CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subcategory">Topic</Label>
        <Select
          value={subcategory}
          onValueChange={onSubcategoryChange}
          disabled={!category}
        >
          <SelectTrigger id="subcategory">
            <SelectValue placeholder={category ? "Select a topic" : "Select a category first"} />
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
