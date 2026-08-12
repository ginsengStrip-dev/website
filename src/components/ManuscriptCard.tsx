import React from 'react';
import { BookOpen, Calendar, Globe, Tag, FileText, ArrowRight } from 'lucide-react';
import { Manuscript } from '../types';
import { getManuscriptCoverUrl } from '../lib/api';

interface ManuscriptCardProps {
  manuscript: Manuscript;
  onRead: (id: number) => void;
  onViewDetails: (id: number) => void;
  layout?: 'grid' | 'list';
}

export const ManuscriptCard: React.FC<ManuscriptCardProps> = ({
  manuscript,
  onRead,
  onViewDetails,
  layout = 'grid',
}) => {
  const formattedYear = manuscript.year
    ? manuscript.year < 0
      ? `${Math.abs(manuscript.year)} BCE`
      : `${manuscript.year} CE`
    : 'Undated';

  if (layout === 'list') {
    return (
      <div className="bg-[#fbf8f1] border border-[#e8ded0] rounded-xl p-5 hover:border-amber-700/50 hover:shadow-lg transition-all group flex flex-col sm:flex-row gap-5 items-start sm:items-center">
        {/* Thumbnail / Cover Placeholder */}
        <div
          onClick={() => onViewDetails(manuscript.id)}
          className="w-full sm:w-28 h-36 bg-amber-900/10 rounded-lg border border-amber-900/20 flex flex-col items-center justify-center shrink-0 cursor-pointer overflow-hidden relative group-hover:scale-105 transition-transform"
        >
          {manuscript.hasCover ? (
            <img
              src={getManuscriptCoverUrl(manuscript.id)}
              alt={manuscript.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="p-3 text-center">
              <BookOpen className="w-8 h-8 text-amber-800/60 mx-auto mb-1" />
              <span className="text-[10px] font-serif font-bold text-amber-950/70 uppercase tracking-widest block line-clamp-1">
                {manuscript.language || 'Folio'}
              </span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-200/80 text-amber-950 border border-amber-300">
              {manuscript.category || 'Uncategorized'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-900/10 text-amber-900 border border-amber-900/20">
              {manuscript.language || 'Unknown'}
            </span>
            <span className="text-xs text-amber-800/80 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedYear}
            </span>
          </div>

          <h3
            onClick={() => onViewDetails(manuscript.id)}
            className="font-serif font-bold text-lg text-amber-950 group-hover:text-amber-800 transition-colors cursor-pointer line-clamp-1"
          >
            {manuscript.title}
          </h3>

          <p className="text-xs font-medium text-amber-900/80 italic">
            Attributed to {manuscript.author || 'Unknown Scribe'}
          </p>

          <p className="text-xs text-amber-900/70 line-clamp-2 leading-relaxed">
            {manuscript.description || 'No description provided for this manuscript.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={() => onRead(manuscript.id)}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            id={`read-btn-${manuscript.id}`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-200" />
            <span>Read Manuscript</span>
          </button>
        </div>
      </div>
    );
  }

  // Grid Layout
  return (
    <div className="bg-[#fbf8f1] border border-[#e8ded0] rounded-xl overflow-hidden hover:border-amber-700/50 hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Cover Header View */}
      <div
        onClick={() => onViewDetails(manuscript.id)}
        className="h-48 bg-gradient-to-br from-amber-900/15 via-amber-800/10 to-amber-900/20 relative flex items-center justify-center cursor-pointer overflow-hidden border-b border-[#e8ded0]"
      >
        {manuscript.hasCover ? (
          <img
            src={getManuscriptCoverUrl(manuscript.id)}
            alt={manuscript.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-center p-6 space-y-2">
            <div className="w-12 h-12 rounded-full bg-amber-900/15 border border-amber-900/20 flex items-center justify-center mx-auto text-amber-900 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-amber-800" />
            </div>
            <p className="font-serif font-bold text-xs text-amber-950 uppercase tracking-widest line-clamp-1">
              {manuscript.category || 'Historical Codex'}
            </p>
          </div>
        )}

        {/* Category & Language Pills */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#faf6ed]/90 backdrop-blur-sm text-amber-950 border border-amber-300 shadow-sm">
            {manuscript.language || 'Sanskrit'}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-950/80 text-amber-100 backdrop-blur-sm">
            {formattedYear}
          </span>
        </div>
      </div>

      {/* Body Information */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider mb-1">
            {manuscript.category || 'General Manuscript'}
          </div>

          <h3
            onClick={() => onViewDetails(manuscript.id)}
            className="font-serif font-bold text-base text-amber-950 group-hover:text-amber-800 transition-colors cursor-pointer line-clamp-2 leading-snug"
          >
            {manuscript.title}
          </h3>

          <p className="text-xs text-amber-900/80 font-medium italic mt-1">
            By {manuscript.author || 'Unknown Scribe'}
          </p>

          <p className="text-xs text-amber-900/70 mt-2 line-clamp-3 leading-relaxed">
            {manuscript.description || 'No description recorded for this manuscript.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-amber-200/60 flex items-center gap-2">
          <button
            onClick={() => onRead(manuscript.id)}
            className="flex-1 py-2 px-3 rounded-lg bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            id={`grid-read-btn-${manuscript.id}`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-200" />
            <span>Read Manuscript</span>
          </button>
        </div>
      </div>
    </div>
  );
};
