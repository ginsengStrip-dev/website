import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Lock,
  User,
  LogOut,
  Menu,
  X,
  Compass,
  FileText,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { AdminUser } from '../types';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, manuscriptId?: number) => void;
  adminUser: AdminUser | null;
  onLogoutAdmin: () => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  adminUser,
  onLogoutAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-40 bg-[#faf6ed]/95 backdrop-blur-md border-b border-[#e5dcd0] text-[#2c2217]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 rounded-xl bg-amber-900 text-amber-100 flex items-center justify-center shadow-md border border-amber-800">
              <BookOpen className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="font-serif font-bold text-lg tracking-tight text-amber-950 flex items-center gap-2">
                ARCHIVALIA
                <span className="text-[10px] font-sans font-medium px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-900 border border-amber-300">
                  Preservation
                </span>
              </div>
              <p className="text-[11px] text-amber-800/80 font-medium tracking-wide">
                Digital Manuscript Preservation & Online Library
              </p>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'home'
                  ? 'bg-amber-900/10 text-amber-950 font-semibold'
                  : 'text-amber-900/80 hover:bg-amber-900/5 hover:text-amber-950'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onNavigate('catalogue')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'catalogue'
                  ? 'bg-amber-900/10 text-amber-950 font-semibold'
                  : 'text-amber-900/80 hover:bg-amber-900/5 hover:text-amber-950'
              }`}
            >
              Manuscript Catalogue
            </button>

            <button
              onClick={() => onNavigate('about')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'about'
                  ? 'bg-amber-900/10 text-amber-950 font-semibold'
                  : 'text-amber-900/80 hover:bg-amber-900/5 hover:text-amber-950'
              }`}
            >
              Preservation Project
            </button>
          </nav>

          {/* Admin / Authentication Actions */}
          <div className="hidden md:flex items-center gap-3">
            {adminUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    currentTab === 'admin'
                      ? 'bg-amber-900 text-amber-50 border-amber-900 shadow-sm'
                      : 'bg-amber-100/70 text-amber-950 border-amber-300/80 hover:bg-amber-200/80'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Admin Panel</span>
                </button>

                <button
                  onClick={onLogoutAdmin}
                  className="p-2 text-amber-800 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Logout Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('admin-login')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-amber-900 hover:bg-amber-100/80 border border-amber-300/70 transition-all flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>Admin Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-amber-950 hover:bg-amber-200/50 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#faf6ed] border-b border-[#e5dcd0] px-4 pt-2 pb-4 space-y-2">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-amber-950 hover:bg-amber-100"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('catalogue');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-amber-950 hover:bg-amber-100"
          >
            Manuscript Catalogue
          </button>
          <button
            onClick={() => {
              onNavigate('about');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-amber-950 hover:bg-amber-100"
          >
            Preservation Project
          </button>

          <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
            {adminUser ? (
              <div className="flex items-center justify-between w-full">
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-900 text-amber-50 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    onLogoutAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 bg-rose-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onNavigate('admin-login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-amber-900 text-amber-50 flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
