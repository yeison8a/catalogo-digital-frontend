
import type { Category } from "@/types/product";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2"
      role="group"
      aria-label="Filtrar productos por categoría"
    >
      <button
        type="button"
        onClick={() => onCategoryChange(null)}
        aria-pressed={selectedCategory === null}
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          selectedCategory === null
            ? "bg-primary text-white"
            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        Todas
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onCategoryChange(category.id)}
          aria-pressed={selectedCategory === category.id}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selectedCategory === category.id
              ? "bg-primary text-white"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
