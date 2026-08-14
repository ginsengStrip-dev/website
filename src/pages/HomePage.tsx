import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe,
  Calendar,
  Tag,
  Clock,
  CheckCircle2,
  Bookmark,
  Layers,
  Award
} from 'lucide-react';
import { Manuscript, Category, Language } from '../types';
import { ManuscriptCard } from '../components/ManuscriptCard';
import { HomeGalleryCarousel } from '../components/HomeGalleryCarousel';

interface HomePageProps {
  manuscripts: Manuscript[];
  categories: Category[];
  languages: Language[];
  onNavigate: (tab: string, manuscriptId?: number) => void;
  onRead: (id: number) => void;
  onSearchQuery: (query: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  manuscripts,
  categories,
  languages,
  onNavigate,
  onRead,
  onSearchQuery,
}) => {
  const [heroSearch, setHeroSearch] = useState<string>('');

  const featured = manuscripts.slice(0, 3);
  const recentlyAdded = manuscripts.slice(0, 4);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      onSearchQuery(heroSearch.trim());
      onNavigate('catalogue');
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#2b2016] via-[#241a11] to-[#1c140c] text-amber-50 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-3xl shadow-xl border-b border-amber-900/50">
        {/* Subtle background parchment motif */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-900/60 border border-amber-600/40 text-amber-200 text-xs font-semibold uppercase tracking-widest shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Digital Preservation & Open Knowledge Platform</span>
          </div>

          <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight text-amber-100 leading-tight">
            Preserving History's Rare Manuscripts for Global Readers
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-amber-200/80 max-w-3xl mx-auto font-sans leading-relaxed">
            Explore centuries of human wisdom, medical codices, astronomical treatises, and epic poetry digitized directly into binary records and readable online for free.
          </p>

          {/* Search Box */}
          <form onSubmit={handleHeroSubmit} className="max-w-2xl mx-auto relative group">
            <div className="relative flex items-center bg-[#fbf8f1] rounded-2xl p-2 shadow-2xl border border-amber-700/50">
              <Search className="w-6 h-6 text-amber-800 ml-3 shrink-0" />
              <input
                type="text"
                value={heroSearch}
                onChange={e => setHeroSearch(e.target.value)}
                placeholder="Search manuscripts by title (e.g., Sushruta, Surya Siddhanta, Tirukkural)..."
                className="w-full px-4 py-3 bg-transparent text-amber-950 placeholder-amber-900/50 font-sans text-sm sm:text-base focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-100 text-sm font-semibold transition-all shrink-0 flex items-center gap-2 shadow-md"
              >
                <span>Search Archives</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Stats Grid */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-amber-800/40 text-left">
            <div className="bg-amber-950/40 p-4 rounded-xl border border-amber-800/30">
              <span className="font-serif font-bold text-2xl text-amber-300 block">{manuscripts.length}+</span>
              <span className="text-xs text-amber-200/70 font-medium">Preserved Manuscripts</span>
            </div>
            <div className="bg-amber-950/40 p-4 rounded-xl border border-amber-800/30">
              <span className="font-serif font-bold text-2xl text-amber-300 block">{languages.length}</span>
              <span className="text-xs text-amber-200/70 font-medium">Classical Languages</span>
            </div>
            <div className="bg-amber-950/40 p-4 rounded-xl border border-amber-800/30">
              <span className="font-serif font-bold text-2xl text-amber-300 block">100%</span>
              <span className="text-xs text-amber-200/70 font-medium">Free Digital Access</span>
            </div>
            <div className="bg-amber-950/40 p-4 rounded-xl border border-amber-800/30">
              <span className="font-serif font-bold text-2xl text-amber-300 block">BLOB</span>
              <span className="text-xs text-amber-200/70 font-medium">SQLite PDF Storage</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Manuscripts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-amber-200/80 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block mb-1">
              Curated Highlights
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-amber-950">
              Featured Ancient Treatises
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalogue')}
            className="text-xs font-bold text-amber-900 hover:text-amber-700 flex items-center gap-1 transition-colors"
          >
            <span>Browse All Collections</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map(m => (
            <ManuscriptCard
              key={m.id}
              manuscript={m}
              onRead={onRead}
              onViewDetails={id => onNavigate('detail', id)}
            />
          ))}
        </div>
      </section>

      <HomeGalleryCarousel onViewGallery={() => onNavigate('gallery')} />

      {/* Category Explorer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block">
            Explore By Domain
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-amber-950">
            Manuscript Categories & Disciplines
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map(cat => {
            const count = manuscripts.filter(m => m.category === cat.name).length;
            return (
              <div
                key={cat.id}
                onClick={() => {
                  onSearchQuery('');
                  onNavigate('catalogue');
                }}
                className="bg-[#fbf8f1] border border-[#e5dcd0] p-6 rounded-2xl hover:border-amber-800/60 hover:shadow-lg transition-all cursor-pointer group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-900/10 text-amber-900 flex items-center justify-center font-bold group-hover:bg-amber-900 group-hover:text-amber-50 transition-colors">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-amber-800 bg-amber-200/60 px-2.5 py-1 rounded-full">
                    {count} {count === 1 ? 'Manuscript' : 'Manuscripts'}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-lg text-amber-950 group-hover:text-amber-800 transition-colors">
                  {cat.name}
                </h3>

                <p className="text-xs text-amber-900/70 leading-relaxed">
                  {cat.description || 'Rare documents and historical literature.'}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Preservation Mission Statement */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#241a11] text-amber-100 rounded-3xl p-8 sm:p-12 border border-amber-900/50 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-900/80 text-amber-200 border border-amber-700/60">
              Preservation Initiative
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-amber-50 leading-tight">
              Why We Digitally Safeguard Ancient Codices
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/80 leading-relaxed">
              Fragile palm-leaf manuscripts, birch bark folios, and parchment scrolls are vulnerable to age, humidity, and decay. Through our binary database preservation system, rare historical texts are rendered accessible to researchers, universities, and readers worldwide.
            </p>

            <ul className="space-y-2 text-xs text-amber-200/90 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Binary storage inside SQLite BLOBs for durable preservation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>In-browser full interactive PDF reader with page controls & sepia mode</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Open digital access with comprehensive search, filters, and metadata</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#1c140c] p-6 rounded-2xl border border-amber-800/40 space-y-4">
            <h3 className="font-serif font-bold text-lg text-amber-200 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Preservation System Architecture</span>
            </h3>

            <div className="space-y-3 text-xs text-amber-200/80">
              <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-800/30 flex items-start gap-3">
                <Layers className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-100">Direct BLOB Stream</p>
                  <p className="text-[11px] text-amber-300/70">
                    PDF files are converted to binary Buffers and served directly from endpoint GET /api/manuscripts/:id/pdf
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-800/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-100">Role-Based Admin Protection</p>
                  <p className="text-[11px] text-amber-300/70">
                    Authorized admins manage manuscripts, upload PDFs/covers, and modify publishing status.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
