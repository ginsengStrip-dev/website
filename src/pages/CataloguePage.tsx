import React, { useState } from 'react';
import { BookOpen, FolderOpen, ArrowLeft, ArrowRight } from 'lucide-react';
import { Manuscript, Category, Language, FilterState } from '../types';
import { SearchBar } from '../components/SearchBar';
import { ManuscriptCard } from '../components/ManuscriptCard';

interface CataloguePageProps {
  manuscripts: Manuscript[];
  categories: Category[];
  languages: Language[];
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onRead: (id: number) => void;
  onNavigate: (tab: string, manuscriptId?: number) => void;
}

export const CataloguePage: React.FC<CataloguePageProps> = ({
  manuscripts,
  categories,
  languages,
  filters,
  onFilterChange,
  onResetFilters,
  onRead,
  onNavigate,
}) => {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(manuscripts.length / itemsPerPage) || 1;
  const paginatedManuscripts = manuscripts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Introduction */}
      <div className="space-y-2 border-b border-amber-200/80 pb-4">
        <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block">
          Digital Archival Collection
        </span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-amber-950">
          Manuscript Catalogue
        </h1>
        <p className="text-xs sm:text-sm text-amber-900/80 max-w-2xl leading-relaxed">
          Search, filter, and read all published ancient manuscripts preserved in our digital repository. All manuscripts are free for global scholarly reading.
        </p>
      </div>

      {/* Search & Filter Component */}
      <SearchBar
        filters={filters}
        onFilterChange={updated => {
          onFilterChange(updated);
          setCurrentPage(1);
        }}
        onResetFilters={() => {
          onResetFilters();
          setCurrentPage(1);
        }}
        categories={categories}
        languages={languages}
        layout={layout}
        onLayoutChange={setLayout}
        totalResults={manuscripts.length}
      />

      {/* Manuscripts Display */}
      {manuscripts.length === 0 ? (
        <div className="bg-[#fbf8f1] border border-[#e5dcd0] rounded-2xl p-12 text-center space-y-4 max-w-md mx-auto">
          <FolderOpen className="w-12 h-12 text-amber-800/50 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-amber-950">
            No Manuscripts Found
          </h3>
          <p className="text-xs text-amber-900/70">
            No preserved manuscripts matched your search criteria. Try clearing search keywords or selecting different filters.
          </p>
          <button
            onClick={onResetFilters}
            className="px-4 py-2 rounded-xl bg-amber-900 text-amber-50 text-xs font-semibold hover:bg-amber-950 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div
          className={
            layout === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {paginatedManuscripts.map(m => (
            <ManuscriptCard
              key={m.id}
              manuscript={m}
              onRead={onRead}
              onViewDetails={id => onNavigate('detail', id)}
              layout={layout}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 border-t border-amber-200">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2.5 rounded-lg border border-amber-300 bg-white text-amber-950 disabled:opacity-40 disabled:hover:bg-white hover:bg-amber-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-semibold text-amber-900 px-4">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-lg border border-amber-300 bg-white text-amber-950 disabled:opacity-40 disabled:hover:bg-white hover:bg-amber-100 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
