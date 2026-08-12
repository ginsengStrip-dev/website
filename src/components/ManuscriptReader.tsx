import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCw,
  Sun,
  Moon,
  BookOpen,
  FileText,
  Share2,
  Sliders,
  Search,
  Check,
  X,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { Manuscript } from '../types';
import { getManuscriptPdfUrl } from '../lib/api';

interface ManuscriptReaderProps {
  manuscript: Manuscript;
  onClose?: () => void;
}

type ReaderTheme = 'parchment' | 'light' | 'dark';
type DisplayMode = 'single' | 'scroll';

export const ManuscriptReader: React.FC<ManuscriptReaderProps> = ({ manuscript, onClose }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(manuscript.pageCount || 4);
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>('parchment');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('single');
  const [pageInput, setPageInput] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pdfUrl = getManuscriptPdfUrl(manuscript.id);

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    const preventContextMenu = (event: MouseEvent) => event.preventDefault();
    const preventProtectedShortcuts = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && ['c', 'p', 's', 'u'].includes(key)) {
        event.preventDefault();
      }
      if (key === 'printscreen') {
        event.preventDefault();
        navigator.clipboard?.writeText('').catch(() => undefined);
      }
    };

    const container = containerRef.current;
    container?.addEventListener('contextmenu', preventContextMenu);
    window.addEventListener('keydown', preventProtectedShortcuts);
    return () => {
      container?.removeEventListener('contextmenu', preventContextMenu);
      window.removeEventListener('keydown', preventProtectedShortcuts);
    };
  }, []);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 20, 250));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 20, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(pageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error('Fullscreen error:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.error(err));
      setIsFullscreen(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Theme styles
  const getThemeBg = () => {
    switch (readerTheme) {
      case 'parchment':
        return 'bg-[#f7f2e7] text-[#2c2217]';
      case 'dark':
        return 'bg-[#18181b] text-[#f4f4f5]';
      case 'light':
        return 'bg-gray-100 text-gray-900';
    }
  };

  const getCanvasBg = () => {
    switch (readerTheme) {
      case 'parchment':
        return 'bg-[#fbf7ee] border-[#e2d5c3] shadow-md';
      case 'dark':
        return 'bg-[#27272a] border-[#3f3f46] text-gray-100 shadow-xl';
      case 'light':
        return 'bg-white border-gray-200 shadow-md';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col font-sans transition-colors duration-200 select-none ${getThemeBg()}`}
    >
      {/* Reader Header / Toolbar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-black/10 backdrop-blur-md bg-opacity-95 z-20">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-black/5 transition-colors flex items-center gap-1.5 text-sm font-medium"
              title="Back to Details"
              id="reader-back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Exit Reader</span>
            </button>
          )}

          <div className="h-5 w-px bg-black/15 mx-1 hidden sm:block" />

          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-700 hidden sm:block" />
            <div>
              <h2 className="text-sm font-semibold truncate max-w-xs sm:max-w-md md:max-w-lg" title={manuscript.title}>
                {manuscript.title}
              </h2>
              <p className="text-xs opacity-75 hidden sm:block">
                {manuscript.author} • {manuscript.language} • {manuscript.year < 0 ? `${Math.abs(manuscript.year)} BCE` : `${manuscript.year} CE`}
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar Center: Page Controls & Zoom */}
        <div className="flex items-center gap-2">
          {/* Page Navigator */}
          <div className="flex items-center bg-black/5 rounded-lg p-1 text-sm font-medium">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1.5 rounded hover:bg-black/10 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <form onSubmit={handlePageInputSubmit} className="flex items-center px-2">
              <input
                type="text"
                value={pageInput}
                onChange={handlePageInputChange}
                onBlur={handlePageInputSubmit}
                className="w-8 text-center bg-transparent border-b border-black/20 focus:border-amber-700 focus:outline-none text-xs font-semibold py-0.5"
              />
              <span className="text-xs opacity-60 ml-1">/ {totalPages}</span>
            </form>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded hover:bg-black/10 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="hidden md:flex items-center bg-black/5 rounded-lg p-1 text-sm font-medium">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded hover:bg-black/10 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-semibold w-12 text-center">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded hover:bg-black/10 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleRotate}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors hidden lg:block"
            title="Rotate Page"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar Right: Themes & Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Selector */}
          <div className="flex items-center bg-black/5 p-1 rounded-lg">
            <button
              onClick={() => setReaderTheme('parchment')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                readerTheme === 'parchment' ? 'bg-amber-800 text-amber-50 shadow-sm' : 'hover:bg-black/5'
              }`}
            >
              Parchment
            </button>
            <button
              onClick={() => setReaderTheme('light')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                readerTheme === 'light' ? 'bg-white text-gray-900 shadow-sm' : 'hover:bg-black/5'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setReaderTheme('dark')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                readerTheme === 'dark' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'hover:bg-black/5'
              }`}
            >
              Dark
            </button>
          </div>

          <button
            onClick={handleShare}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors relative"
            title="Share Manuscript Link"
          >
            {copySuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Reading Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Index / Thumbnails */}
        {showSidebar && (
          <aside className="w-64 border-r border-black/10 bg-black/5 flex flex-col overflow-y-auto p-3 shrink-0 hidden md:flex">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">Folio Index</span>
              <span className="text-xs opacity-60">{totalPages} Pages</span>
            </div>

            <div className="space-y-2">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isSelected = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between text-xs font-medium ${
                      isSelected
                        ? 'border-amber-700 bg-amber-500/10 font-bold text-amber-900 dark:text-amber-300'
                        : 'border-transparent hover:bg-black/5 opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 opacity-60" />
                      <span>Folio {pageNum}</span>
                    </div>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-amber-700" />}
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* PDF Document Canvas View */}
        <main className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center relative">
          <div
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-out',
            }}
            className={`w-full max-w-4xl h-[78vh] rounded-xl border flex flex-col relative overflow-hidden transition-all ${getCanvasBg()}`}
          >
            {/* Embedded Native PDF Viewer Layer */}
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <iframe
                src={`${pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=1`}
                title={manuscript.title}
                className="absolute left-0 top-[-56px] w-full h-[calc(100%+56px)] border-none"
              />
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 grid grid-cols-3 grid-rows-4 overflow-hidden opacity-20"
            >
              {Array.from({ length: 12 }).map((_, index) => (
                <span
                  key={index}
                  className="flex items-center justify-center rotate-[-28deg] text-xs sm:text-sm font-bold uppercase tracking-widest text-red-800 whitespace-nowrap"
                >
                  Protected • {manuscript.title}
                </span>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Footer Navigation Bar */}
      <footer className="px-4 py-2 border-t border-black/10 flex items-center justify-between text-xs opacity-75">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="hover:underline flex items-center gap-1 hidden md:flex"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showSidebar ? 'Hide Index' : 'Show Index'}</span>
          </button>
          <span>•</span>
          <span>Preserved PDF Binary Store</span>
        </div>

        <div className="flex items-center gap-3">
          <span>Keyboard: ← Previous | Next →</span>
        </div>
      </footer>
    </div>
  );
};
