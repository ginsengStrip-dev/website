import React from 'react';
import { Search, Filter, X, Grid, List, RotateCcw, Calendar, BookOpen, Globe } from 'lucide-react';
import { FilterState, Category, Language } from '../types';

interface SearchBarProps {
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onResetFilters: () => void;
  categories: Category[];
  languages: Language[];
  layout: 'grid' | 'list';
  onLayoutChange: (mode: 'grid' | 'list') => void;
  totalResults: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  categories,
  languages,
  layout,
  onLayoutChange,
  totalResults,
}) => {
  const isFiltered =
    filters.search !== '' ||
    filters.category !== 'ALL' ||
    filters.language !== 'ALL' ||
    filters.yearFrom !== '' ||
    filters.yearTo !== '';

  return (
    <div className="bg-[#fbf8f1] border border-[#e5dcd0] rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
      {/* Search Input & Main Row */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-amber-800/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={e => onFilterChange({ search: e.target.value })}
            placeholder="Search manuscripts by title, author, keywords, or historical topics..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#e5dcd0] text-sm text-amber-950 placeholder-amber-900/40 focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800 transition-all shadow-inner"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-800/60 hover:text-amber-950 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="w-full md:w-56">
          <select
            value={filters.category}
            onChange={e => onFilterChange({ category: e.target.value })}
            className="w-full py-2.5 px-3 rounded-xl bg-white border border-[#e5dcd0] text-sm text-amber-950 focus:outline-none focus:border-amber-800 transition-all"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Language Dropdown */}
        <div className="w-full md:w-48">
          <select
            value={filters.language}
            onChange={e => onFilterChange({ language: e.target.value })}
            className="w-full py-2.5 px-3 rounded-xl bg-white border border-[#e5dcd0] text-sm text-amber-950 focus:outline-none focus:border-amber-800 transition-all"
          >
            <option value="ALL">All Languages</option>
            {languages.map(l => (
              <option key={l.id} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Secondary Filter Row: Sort, Year inputs, View Modes */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-amber-200/50 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Sort By */}
          <div className="flex items-center gap-1.5 text-amber-900 font-medium">
            <span>Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={e => onFilterChange({ sortBy: e.target.value as any })}
              className="bg-white border border-[#e5dcd0] rounded-lg px-2 py-1 text-xs text-amber-950 focus:outline-none focus:border-amber-800"
            >
              <option value="created_desc">Recently Added</option>
              <option value="year_asc">Year (Oldest First)</option>
              <option value="year_desc">Year (Newest First)</option>
              <option value="title_asc">Title (A - Z)</option>
            </select>
          </div>

          {/* Year Range Inputs */}
          <div className="flex items-center gap-1.5 text-amber-900 font-medium">
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span>Era Year:</span>
            <input
              type="number"
              placeholder="-600 (BCE)"
              value={filters.yearFrom}
              onChange={e => onFilterChange({ yearFrom: e.target.value })}
              className="w-20 bg-white border border-[#e5dcd0] rounded-lg px-2 py-1 text-xs text-amber-950 focus:outline-none"
            />
            <span>to</span>
            <input
              type="number"
              placeholder="1900 (CE)"
              value={filters.yearTo}
              onChange={e => onFilterChange({ yearTo: e.target.value })}
              className="w-20 bg-white border border-[#e5dcd0] rounded-lg px-2 py-1 text-xs text-amber-950 focus:outline-none"
            />
          </div>

          {/* Reset button */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="px-2.5 py-1 rounded-lg bg-amber-200/70 text-amber-950 hover:bg-amber-300 transition-colors flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Results count & layout switcher */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="font-semibold text-amber-900">
            {totalResults} {totalResults === 1 ? 'Manuscript' : 'Manuscripts'} Found
          </span>

          <div className="flex items-center bg-amber-900/10 rounded-lg p-0.5 border border-amber-900/15">
            <button
              onClick={() => onLayoutChange('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                layout === 'grid' ? 'bg-amber-900 text-amber-50 shadow-xs' : 'text-amber-900 hover:bg-amber-900/10'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onLayoutChange('list')}
              className={`p-1.5 rounded-md transition-colors ${
                layout === 'list' ? 'bg-amber-900 text-amber-50 shadow-xs' : 'text-amber-900 hover:bg-amber-900/10'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
