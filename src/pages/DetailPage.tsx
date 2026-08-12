import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Globe,
  Tag,
  ArrowLeft,
  Share2,
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';
import { Manuscript } from '../types';
import { fetchManuscriptById, getManuscriptCoverUrl } from '../lib/api';

interface DetailPageProps {
  manuscriptId: number;
  onRead: (id: number) => void;
  onNavigate: (tab: string, id?: number) => void;
}

export const DetailPage: React.FC<DetailPageProps> = ({
  manuscriptId,
  onRead,
  onNavigate,
}) => {
  const [manuscript, setManuscript] = useState<Manuscript | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    fetchManuscriptById(manuscriptId)
      .then(res => {
        setManuscript(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Manuscript details could not be loaded.');
        setLoading(false);
      });
  }, [manuscriptId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-serif text-amber-900 font-semibold">Retrieving manuscript record...</p>
      </div>
    );
  }

  if (error || !manuscript) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm text-rose-800 font-medium">{error || 'Manuscript not found.'}</p>
        <button
          onClick={() => onNavigate('catalogue')}
          className="px-4 py-2 rounded-xl bg-amber-900 text-amber-50 text-xs font-semibold"
        >
          Back to Catalogue
        </button>
      </div>
    );
  }

  const formattedYear = manuscript.year
    ? manuscript.year < 0
      ? `${Math.abs(manuscript.year)} BCE`
      : `${manuscript.year} CE`
    : 'Undated';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => onNavigate('catalogue')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Manuscript Catalogue</span>
      </button>

      {/* Main Details Hero */}
      <div className="bg-[#fbf8f1] border border-[#e5dcd0] rounded-3xl p-6 sm:p-10 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cover view */}
        <div className="md:col-span-1 space-y-4">
          <div className="h-80 w-full bg-amber-900/10 rounded-2xl border border-amber-900/20 overflow-hidden flex flex-col items-center justify-center relative shadow-inner">
            {manuscript.hasCover ? (
              <img
                src={getManuscriptCoverUrl(manuscript.id)}
                alt={manuscript.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="p-6 text-center space-y-2">
                <BookOpen className="w-16 h-16 text-amber-800/60 mx-auto" />
                <span className="font-serif font-bold text-xs uppercase tracking-widest text-amber-950 block">
                  {manuscript.language || 'Folio'}
                </span>
              </div>
            )}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-amber-950/80 text-amber-100 text-[10px] font-semibold">
              {manuscript.status}
            </div>
          </div>

          {/* Quick CTAs */}
          <button
            onClick={() => onRead(manuscript.id)}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-900 hover:bg-amber-950 text-amber-50 font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            id={`detail-read-btn-${manuscript.id}`}
          >
            <BookOpen className="w-5 h-5 text-amber-200" />
            <span>Read Manuscript Online</span>
          </button>

          <button
            onClick={handleShare}
            className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-amber-50 text-amber-950 text-xs font-semibold border border-amber-300 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4 text-amber-800" />
            <span>{copied ? 'Copied Link!' : 'Share Manuscript Link'}</span>
          </button>
        </div>

        {/* Detailed Metadata Body */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-950 border border-amber-300">
                {manuscript.category || 'General Archive'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-900/10 text-amber-900 border border-amber-900/20">
                {manuscript.language || 'Sanskrit'}
              </span>
              <span className="text-xs text-amber-800 font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedYear}
              </span>
            </div>

            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-amber-950 leading-tight">
              {manuscript.title}
            </h1>

            <p className="text-sm font-medium text-amber-900/90 italic">
              Attributed to: <span className="font-semibold text-amber-950">{manuscript.author || 'Unknown Scribe'}</span>
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2 pt-4 border-t border-amber-200">
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-widest">
              Historical Context & Description
            </h3>
            <p className="text-xs sm:text-sm text-amber-950/90 leading-relaxed font-sans">
              {manuscript.description || 'No extended historical commentary provided.'}
            </p>
          </div>

          {/* Metadata Grid Table */}
          <div className="bg-amber-100/50 rounded-2xl p-4 border border-amber-200/90 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-amber-800/80 font-medium block">Total Folios</span>
              <span className="font-bold text-amber-950 text-sm">{manuscript.pageCount || 'Unknown'} Pages</span>
            </div>

            <div>
              <span className="text-amber-800/80 font-medium block">Digital Format</span>
              <span className="font-bold text-amber-950 text-sm">PDF (BLOB)</span>
            </div>

            <div>
              <span className="text-amber-800/80 font-medium block">Archived Date</span>
              <span className="font-bold text-amber-950 text-sm">
                {new Date(manuscript.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div>
              <span className="text-amber-800/80 font-medium block">Preservation Access</span>
              <span className="font-bold text-emerald-800 text-sm">100% Free Public</span>
            </div>

            <div>
              <span className="text-amber-800/80 font-medium block">Binary Storage</span>
              <span className="font-bold text-amber-950 text-sm">SQLite BLOB Store</span>
            </div>

            <div>
              <span className="text-amber-800/80 font-medium block">File Name</span>
              <span className="font-bold text-amber-950 text-sm truncate block" title={manuscript.fileName}>
                {manuscript.fileName}
              </span>
            </div>
          </div>

          {/* Keywords / Tags */}
          {manuscript.keywords && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-widest block">
                Subject Keywords
              </span>
              <div className="flex flex-wrap gap-1.5">
                {manuscript.keywords.split(',').map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-200/60 text-amber-950 border border-amber-300/80"
                  >
                    #{kw.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
