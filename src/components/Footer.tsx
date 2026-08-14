import React from 'react';
import { BookOpen, ShieldCheck, Heart, Sparkles, Globe, Mail } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#241b12] text-[#e8ded0] pt-12 pb-8 border-t border-[#3d2f21] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-700 text-amber-100 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-lg text-amber-200 tracking-tight">
                ARCHIVALIA
              </span>
            </div>
            <p className="text-xs text-amber-200/70 leading-relaxed">
              Dedicated to the digital preservation, cataloging, and open online reading of ancient manuscripts and rare primary codices across civilizations.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-amber-200 uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-amber-200/80">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-amber-100 transition-colors">
                  Home Page
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalogue')} className="hover:text-amber-100 transition-colors">
                  Manuscript Catalogue
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('gallery')} className="hover:text-amber-100 transition-colors">
                  Event Gallery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-amber-100 transition-colors">
                  Preservation Initiative
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin-login')} className="hover:text-amber-100 transition-colors">
                  Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Core Categories */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-amber-200 uppercase tracking-wider">
              Specialized Collections
            </h4>
            <ul className="space-y-2 text-xs text-amber-200/80">
              <li>Ayurvedic & Medical Treatises</li>
              <li>Astronomy & Mathematical Codices</li>
              <li>Classical Poetry & Epics</li>
              <li>Ethical & Political Treatises</li>
            </ul>
          </div>

          {/* Preservation Mission */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-amber-200 uppercase tracking-wider">
              Free Open Access
            </h4>
            <p className="text-xs text-amber-200/70 leading-relaxed">
              All manuscripts in this digital archive are digitized into raw PDF binaries and made available for free, unrestricted public scholarly research.
            </p>
            <div className="text-xs font-mono text-amber-400 bg-amber-950/80 p-2.5 rounded-lg border border-amber-900">
              SQLite BLOB Store Active
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-amber-900/50 flex flex-col sm:flex-row items-center justify-between text-xs text-amber-200/60 gap-3">
          <p>© {new Date().getFullYear()} Archivalia Manuscript Preservation Initiative. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Global Open Access
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Protected
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
