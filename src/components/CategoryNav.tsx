import React from 'react';

interface CategoryNavProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  subcategories: string[];
  activeSubcategory: string | null;
  onSelectSubcategory: (sub: string | null) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  subcategories,
  activeSubcategory,
  onSelectSubcategory,
}) => {
  return (
    <div className="bg-white border-b border-[#EFEFEC]">
      {/* Primary Category Bar */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? 'text-[var(--primary)] border-[var(--primary)] font-semibold'
                    : 'text-[#6B6760] border-transparent hover:text-[#1B1B1B]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategory Bar */}
      {subcategories.length > 0 && (
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-[#F7F7F5]">
          <span className="text-xs font-semibold text-[#87837A] uppercase tracking-wider shrink-0 mr-1">
            Filtro:
          </span>
          <button
            onClick={() => onSelectSubcategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              !activeSubcategory
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'bg-white border border-[#E0DED9] text-[#6B6760] hover:border-[var(--primary)] hover:text-[var(--primary)]'
            }`}
          >
            Todos
          </button>
          {subcategories.map((sub) => {
            const isSubActive = activeSubcategory === sub;
            return (
              <button
                key={sub}
                onClick={() => onSelectSubcategory(sub)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                  isSubActive
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'bg-white border border-[#E0DED9] text-[#6B6760] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
