import React from 'react';
import { BookOpen, ShieldCheck, Layers, Award, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (tab: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-200/80 text-amber-950 text-xs font-bold uppercase tracking-widest border border-amber-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-800" />
          <span>Preservation Mission</span>
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-5xl text-amber-950">
          Digital Manuscript Preservation Initiative
        </h1>
        <p className="text-sm sm:text-base text-amber-900/80 max-w-2xl mx-auto leading-relaxed font-sans">
          Connecting ancient wisdom with modern digital accessibility through binary database preservation and global open reading access.
        </p>
      </div>

      <div className="bg-[#fbf8f1] border border-[#e5dcd0] rounded-3xl p-8 sm:p-10 shadow-lg space-y-6">
        <h2 className="font-serif font-bold text-2xl text-amber-950 border-b border-amber-200/80 pb-3">
          1. Objectives of the Archivalia Project
        </h2>
        <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
          Millions of priceless historical codices across Asia, North Africa, Europe, and the Americas face physical decay from environmental humidity, paper acidity, and ink erosion. The Archivalia initiative provides a unified web platform to digitize manuscripts into non-degradable binary byte stores, making them freely accessible for reading online without requiring user registration or fees.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-amber-100/60 p-4 rounded-2xl border border-amber-200 space-y-2">
            <ShieldCheck className="w-6 h-6 text-amber-800" />
            <h3 className="font-serif font-bold text-sm text-amber-950">SQLite BLOB Storage</h3>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              PDF binaries are stored directly in the database as byte arrays, ensuring immutable data integrity and instantaneous stream retrieval.
            </p>
          </div>

          <div className="bg-amber-100/60 p-4 rounded-2xl border border-amber-200 space-y-2">
            <BookOpen className="w-6 h-6 text-amber-800" />
            <h3 className="font-serif font-bold text-sm text-amber-950">In-Browser PDF Reader</h3>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              Users can inspect folios directly inside their web browser with page navigation, zoom, rotation, parchment themes, and search.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#241a11] text-amber-100 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        <h2 className="font-serif font-bold text-2xl text-amber-50 border-b border-amber-800/60 pb-3">
          2. Open Scholar Philosophy
        </h2>
        <p className="text-xs sm:text-sm text-amber-200/80 leading-relaxed">
          Knowledge belongs to all humanity. In our inaugural release, all published manuscripts can be searched, filtered, and read online in full resolution without paywalls, subscriptions, or account creation barriers.
        </p>

        <div className="pt-2">
          <button
            onClick={() => onNavigate('catalogue')}
            className="px-6 py-3 rounded-xl bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif font-bold text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <span>Explore The Manuscript Collection</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
