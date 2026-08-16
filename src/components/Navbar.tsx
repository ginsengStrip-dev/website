import React, { useState } from 'react';
import {
  BookOpen,
  Lock,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Camera,
  Landmark,
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

  const navigateMobile = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  const navItemClass = (tab: string) =>
    `px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
      currentTab === tab
        ? 'bg-amber-900/10 text-amber-950 font-semibold'
        : 'text-amber-900/80 hover:bg-amber-900/5 hover:text-amber-950'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-[#faf6ed]/95 backdrop-blur-md border-b border-[#e5dcd0] text-[#2c2217]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-[72px]">

          {/* =====================================================
              BRAND
          ===================================================== */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="w-11 h-11 rounded-xl bg-amber-900 text-amber-100 flex items-center justify-center shadow-md border border-amber-800 group-hover:bg-amber-800 transition-colors">
              <BookOpen className="w-5 h-5 text-amber-200" />
            </div>

            <div className="leading-tight">

              <div className="font-serif font-bold text-[15px] sm:text-lg tracking-tight text-amber-950">
                Gajala Satra Manuscript Archive
              </div>

              <div className="flex items-center gap-1.5 mt-1">
                <Landmark className="w-3 h-3 text-amber-700" />

                <p className="text-[10px] sm:text-[11px] text-amber-800/75 font-medium tracking-wide">
                  Medhijan Shri Shri Gajala Satra · Sivasagar
                </p>
              </div>

            </div>
          </div>


          {/* =====================================================
              DESKTOP NAVIGATION
          ===================================================== */}
          <nav className="hidden lg:flex items-center gap-1">

            <button
              onClick={() => onNavigate('home')}
              className={navItemClass('home')}
            >
              Home
            </button>

            <button
              onClick={() => onNavigate('catalogue')}
              className={navItemClass('catalogue')}
            >
              Manuscripts
            </button>

            <button
              onClick={() => onNavigate('gallery')}
              className={navItemClass('gallery')}
            >
              Gallery
            </button>

            <button
              onClick={() => onNavigate('conservation')}
              className={navItemClass('conservation')}
            >
              Conservation
            </button>

            <button
              onClick={() => onNavigate('about')}
              className={navItemClass('about')}
            >
              About
            </button>

          </nav>


          {/* =====================================================
              ADMIN ACTIONS - DESKTOP
          ===================================================== */}
          <div className="hidden lg:flex items-center gap-3">

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
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>

                <button
                  onClick={onLogoutAdmin}
                  className="p-2 text-amber-800 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>

              </div>
            ) : (
              <button
                onClick={() => onNavigate('admin-login')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-900/80 hover:bg-amber-100/80 border border-amber-300/60 transition-all flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

          </div>


          {/* =====================================================
              MOBILE MENU BUTTON
          ===================================================== */}
          <div className="lg:hidden">

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-amber-950 hover:bg-amber-200/50 rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

          </div>

        </div>
      </div>


      {/* =========================================================
          MOBILE NAVIGATION
      ========================================================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#faf6ed] border-t border-[#e5dcd0] border-b px-4 pt-3 pb-4">

          <div className="space-y-1">

            <button
              onClick={() => navigateMobile('home')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentTab === 'home'
                  ? 'bg-amber-100 text-amber-950'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => navigateMobile('catalogue')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentTab === 'catalogue'
                  ? 'bg-amber-100 text-amber-950'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              Manuscripts
            </button>

            <button
              onClick={() => navigateMobile('gallery')}
              className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                currentTab === 'gallery'
                  ? 'bg-amber-100 text-amber-950'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              <span>Gallery</span>
              <Camera className="w-4 h-4 text-amber-700" />
            </button>

            <button
              onClick={() => navigateMobile('conservation')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentTab === 'conservation'
                  ? 'bg-amber-100 text-amber-950'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              Conservation Project
            </button>

            <button
              onClick={() => navigateMobile('about')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentTab === 'about'
                  ? 'bg-amber-100 text-amber-950'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              About
            </button>

          </div>


          {/* Admin */}
          <div className="pt-4 mt-3 border-t border-amber-200/70">

            {adminUser ? (
              <div className="flex items-center justify-between gap-3">

                <button
                  onClick={() => navigateMobile('admin')}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-900 text-amber-50 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Dashboard
                </button>

                <button
                  onClick={() => {
                    onLogoutAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-rose-700 bg-rose-50"
                >
                  Logout
                </button>

              </div>
            ) : (
              <button
                onClick={() => navigateMobile('admin-login')}
                className="w-full py-2 rounded-lg text-xs font-semibold border border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                Administrator Login
              </button>
            )}

          </div>

        </div>
      )}
    </header>
  );
};