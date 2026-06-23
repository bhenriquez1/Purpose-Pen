"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export function ListField({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const update = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              placeholder={placeholder}
              onChange={(e) => update(index, e.target.value)}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="px-2 text-sm text-red-600 hover:underline dark:text-red-400"
            >
              Remove
            </button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => onChange([...items, ""])}>
          Add
        </Button>
      </div>
    </div>
  );
}
