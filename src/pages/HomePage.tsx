import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Camera,
  Landmark,
  ScrollText,
  HeartHandshake,
  Archive,
  CheckCircle2,
  Library,
  ScanLine,
  MapPin,
} from 'lucide-react';

import { Manuscript, Category, Language } from '../types';
import { ManuscriptCard } from '../components/ManuscriptCard';

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

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (heroSearch.trim()) {
      onSearchQuery(heroSearch.trim());
      onNavigate('catalogue');
    }
  };

  return (
    <div className="space-y-20 pb-16">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative bg-gradient-to-b from-[#2d2117] via-[#241a11] to-[#1b130c] text-amber-50 min-h-[650px] flex items-center px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-[2.5rem] shadow-xl border-b border-amber-900/50">

        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />

        {/* Soft glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-8">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-900/50 border border-amber-600/30 text-amber-200 text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Manuscript Conservation & Digital Preservation</span>
          </div>

          <div className="space-y-4">
            <p className="font-serif text-amber-400 text-sm sm:text-base tracking-wide">
              Medhijan Shri Shri Gajala Satra · Sivasagar, Assam
            </p>

            <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-7xl tracking-tight text-amber-50 leading-[1.08] max-w-5xl mx-auto">
              Preserving Centuries of
              <span className="block text-amber-300">
                Written Heritage
              </span>
            </h1>
          </div>

          <p className="text-sm sm:text-base md:text-lg text-amber-200/80 max-w-3xl mx-auto leading-relaxed">
            A digital initiative documenting, conserving and safeguarding the
            historic manuscript collection of Medhijan Shri Shri Gajala Satra.
            Following damage to fragile manuscripts, conservation specialists
            and researchers are working to preserve these invaluable records
            and create a lasting digital archive for future generations.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('catalogue')}
              className="px-6 py-3.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <BookOpen className="w-4 h-4" />
              Explore the Manuscripts
            </button>

            <button
              onClick={() => onNavigate('gallery')}
              className="px-6 py-3.5 rounded-xl border border-amber-600/50 bg-amber-950/30 hover:bg-amber-900/50 text-amber-100 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              View Conservation Gallery
            </button>
          </div>

          {/* Search */}
          <form
            onSubmit={handleHeroSubmit}
            className="max-w-2xl mx-auto relative pt-4"
          >
            <div className="relative flex items-center bg-[#fbf8f1] rounded-2xl p-2 shadow-2xl border border-amber-700/40">

              <Search className="w-5 h-5 text-amber-800 ml-3 shrink-0" />

              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search the manuscript collection..."
                className="w-full px-4 py-3 bg-transparent text-amber-950 placeholder-amber-900/40 text-sm focus:outline-none"
              />

              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-100 text-xs font-bold transition-all shrink-0 flex items-center gap-2"
              >
                Search
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </form>
        </div>
      </section>


      {/* =========================================================
          INTRODUCTION / SATRA
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          <div className="space-y-5">

            <div className="flex items-center gap-2 text-amber-800">
              <Landmark className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em]">
                A Living Heritage Collection
              </span>
            </div>

            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-amber-950 leading-tight">
              The Manuscripts of
              <span className="block">
                Medhijan Shri Shri Gajala Satra
              </span>
            </h2>

            <p className="text-sm text-amber-900/80 leading-relaxed">
              For generations, the Satra has safeguarded manuscripts carrying
              religious, literary, historical and cultural knowledge. Written
              and preserved long before modern archival systems existed, these
              manuscripts constitute an important part of Assam&apos;s written
              heritage.
            </p>

            <p className="text-sm text-amber-900/80 leading-relaxed">
              Age, environmental exposure and recent flood damage have made
              several manuscripts increasingly fragile. The present initiative
              combines physical conservation with systematic digitisation so
              that the knowledge contained within these works can survive even
              as the original material continues to age.
            </p>

            <button
              onClick={() => onNavigate('about')}
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 hover:text-amber-700 transition-colors pt-2"
            >
              Learn about the preservation initiative
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

          {/* Visual placeholder */}
          <div className="relative">

            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-[#e7dccb] border border-[#d9c8b5] shadow-xl">

              <img
                src="/images/satra/satra-main.jpg"
                alt="Medhijan Shri Shri Gajala Satra"
                className="w-full h-full object-cover"
              />

            </div>

            <div className="absolute -bottom-5 left-5 right-5 sm:right-auto sm:w-[70%] bg-[#241a11]/95 backdrop-blur-sm text-amber-100 rounded-2xl p-5 border border-amber-700/30 shadow-xl">

              <div className="flex items-start gap-3">

                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />

                <div>
                  <p className="font-serif font-bold text-sm">
                    Medhijan Shri Shri Gajala Satra
                  </p>

                  <p className="text-[11px] text-amber-200/70 mt-1">
                    Sivasagar, Assam
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>


      {/* =========================================================
          COLLECTION HIGHLIGHTS
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-[#f5eee3] border border-[#dfd1c0] rounded-3xl px-6 py-8 sm:px-10">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

            <div>
              <span className="font-serif font-bold text-3xl text-amber-900 block">
                {manuscripts.length}+
              </span>
              <span className="text-xs text-amber-900/60">
                Digitally Catalogued
              </span>
            </div>

            <div>
              <span className="font-serif font-bold text-3xl text-amber-900 block">
                {categories.length}
              </span>
              <span className="text-xs text-amber-900/60">
                Collection Categories
              </span>
            </div>

            <div>
              <span className="font-serif font-bold text-3xl text-amber-900 block">
                {languages.length}
              </span>
              <span className="text-xs text-amber-900/60">
                Languages / Scripts
              </span>
            </div>

            <div>
              <span className="font-serif font-bold text-3xl text-amber-900 block">
                Sanchipat
              </span>
              <span className="text-xs text-amber-900/60">
                Historic Manuscript Tradition
              </span>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================
          FEATURED MANUSCRIPTS
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-amber-200/80 pb-4">

          <div>
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-[0.22em] block mb-2">
              From the Collection
            </span>

            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-amber-950">
              Featured Manuscripts
            </h2>
          </div>

          <button
            onClick={() => onNavigate('catalogue')}
            className="text-xs font-bold text-amber-900 hover:text-amber-700 flex items-center gap-1"
          >
            Browse the Complete Collection
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((manuscript) => (
              <ManuscriptCard
                key={manuscript.id}
                manuscript={manuscript}
                onRead={onRead}
                onViewDetails={(id) => onNavigate('detail', id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#fbf8f1] border border-[#e5dcd0] rounded-2xl p-10 text-center">
            <ScrollText className="w-8 h-8 mx-auto text-amber-700 mb-3" />
            <p className="text-sm text-amber-900/70">
              Manuscripts are currently being catalogued for the digital archive.
            </p>
          </div>
        )}

      </section>


      {/* =========================================================
          CONSERVATION STORY
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-[#241a11] text-amber-100 rounded-3xl p-8 sm:p-12 shadow-xl border border-amber-900/50">

          <div className="max-w-3xl mb-9">

            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.22em]">
              From Recovery to Preservation
            </span>

            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-amber-50 mt-3">
              A Manuscript Conservation Mission
            </h2>

            <p className="text-sm text-amber-200/75 leading-relaxed mt-4">
              Floodwater and prolonged moisture exposed parts of the Satra&apos;s
              manuscript collection to deterioration. Conservation specialists
              are now carefully recovering, separating, cleaning, stabilising
              and documenting fragile manuscript folios before their
              digitisation and long-term preservation.
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {[
              {
                number: '01',
                title: 'Recovery',
                description:
                  'Identification and assessment of manuscripts affected by environmental and flood damage.',
              },
              {
                number: '02',
                title: 'Conservation',
                description:
                  'Careful separation, cleaning, drying and stabilisation of fragile manuscript folios.',
              },
              {
                number: '03',
                title: 'Digitisation',
                description:
                  'Creation of high-quality digital representations after the manuscripts are stabilised.',
              },
              {
                number: '04',
                title: 'Digital Archive',
                description:
                  'Cataloguing and structured preservation of manuscript records for long-term access.',
              },
            ].map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-amber-800/40 bg-white/[0.035] p-5"
              >
                <span className="font-serif text-2xl text-amber-500">
                  {step.number}
                </span>

                <h3 className="font-serif font-bold text-base text-amber-50 mt-3">
                  {step.title}
                </h3>

                <p className="text-[11px] text-amber-200/65 leading-relaxed mt-2">
                  {step.description}
                </p>
              </div>
            ))}

          </div>

          <div className="pt-8">

            <button
              onClick={() => onNavigate('gallery')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-800 hover:bg-amber-700 text-amber-50 text-xs font-bold transition-all"
            >
              <Camera className="w-4 h-4" />
              View the Conservation Journey
            </button>

          </div>

        </div>
      </section>


      {/* =========================================================
          COLLECTION CATEGORIES
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        <div className="text-center max-w-2xl mx-auto">

          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-[0.22em] block">
            Explore the Archive
          </span>

          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-amber-950 mt-2">
            Manuscript Collections
          </h2>

          <p className="text-xs text-amber-900/60 mt-3 leading-relaxed">
            Browse the preserved manuscripts by literary, religious,
            historical and cultural classification.
          </p>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {categories.map((category) => {

            const count = manuscripts.filter(
              (m) => m.category === category.name
            ).length;

            return (
              <div
                key={category.id}
                onClick={() => {
                  onSearchQuery('');
                  onNavigate('catalogue');
                }}
                className="bg-[#fbf8f1] border border-[#e5dcd0] p-6 rounded-2xl hover:border-amber-800/50 hover:shadow-lg transition-all cursor-pointer group"
              >

                <div className="flex items-start justify-between">

                  <div className="w-10 h-10 rounded-xl bg-amber-900/10 text-amber-900 flex items-center justify-center group-hover:bg-amber-900 group-hover:text-amber-50 transition-colors">
                    <Library className="w-5 h-5" />
                  </div>

                  <span className="text-[10px] font-bold text-amber-800 bg-amber-200/50 px-2.5 py-1 rounded-full">
                    {count}
                  </span>

                </div>

                <h3 className="font-serif font-bold text-lg text-amber-950 mt-4">
                  {category.name}
                </h3>

                <p className="text-xs text-amber-900/65 leading-relaxed mt-2">
                  {category.description ||
                    'Historical manuscripts preserved within the Satra collection.'}
                </p>

              </div>
            );
          })}

        </div>
      </section>


      {/* =========================================================
          PHYSICAL + DIGITAL PRESERVATION
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div className="bg-[#efe5d6] border border-[#ddcbb8] rounded-3xl p-8 space-y-4">

            <HeartHandshake className="w-7 h-7 text-amber-800" />

            <h2 className="font-serif font-bold text-2xl text-amber-950">
              Physical Conservation
            </h2>

            <p className="text-xs sm:text-sm text-amber-900/75 leading-relaxed">
              Conservation specialists work directly with damaged manuscripts,
              treating fragile materials with appropriate conservation
              practices before further handling and documentation.
            </p>

            <ul className="space-y-2 text-xs text-amber-900/75">

              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                Manuscript condition assessment
              </li>

              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                Cleaning and stabilisation
              </li>

              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                Reduced handling of fragile originals
              </li>

            </ul>

          </div>


          <div className="bg-[#fbf8f1] border border-[#e5dcd0] rounded-3xl p-8 space-y-4">

            <Archive className="w-7 h-7 text-amber-800" />

            <h2 className="font-serif font-bold text-2xl text-amber-950">
              Digital Preservation
            </h2>

            <p className="text-xs sm:text-sm text-amber-900/75 leading-relaxed">
              The digital platform provides a structured environment for
              manuscript documentation, metadata, digitised documents and
              future scholarly access.
            </p>

            <ul className="space-y-2 text-xs text-amber-900/75">

              <li className="flex gap-2">
                <ScanLine className="w-4 h-4 text-amber-700 shrink-0" />
                Digital manuscript documentation
              </li>

              <li className="flex gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                Structured archival storage
              </li>

              <li className="flex gap-2">
                <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />
                Browser-based manuscript access
              </li>

            </ul>

          </div>

        </div>
      </section>


      {/* =========================================================
          PROJECT COLLABORATION
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="border-t border-amber-200 pt-12 text-center">

          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800">
            Collaborative Preservation Initiative
          </span>

          <h2 className="font-serif font-bold text-2xl text-amber-950 mt-3">
            Heritage Stewardship Meets Digital Technology
          </h2>

          <p className="max-w-3xl mx-auto text-xs sm:text-sm text-amber-900/65 leading-relaxed mt-4">
            The initiative brings together the custodians of Medhijan Shri
            Shri Gajala Satra, manuscript conservation expertise associated
            with Gauhati University and the technical development efforts of
            the Department of Computer Science and Hinton Research Lab,
            Gauhati University.
          </p>

          <button
            onClick={() => onNavigate('about')}
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-amber-900 hover:text-amber-700"
          >
            About the Project and Team
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

      </section>

    </div>
  );
};