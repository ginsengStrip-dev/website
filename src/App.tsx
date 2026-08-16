import React, { useState, useEffect, useRef } from 'react';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ManuscriptReader } from './components/ManuscriptReader';

import { HomePage } from './pages/HomePage';
import { CataloguePage } from './pages/CataloguePage';
import { DetailPage } from './pages/DetailPage';
import { ConservationPage } from './pages/ConservationPage';
import { GalleryPage } from './pages/GalleryPage';
import { AboutPage } from './pages/AboutPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';

import {
  Manuscript,
  Category,
  Language,
  FilterState,
  AdminUser,
} from './types';

import {
  fetchManuscripts,
  fetchManuscriptById,
  fetchCategories,
  fetchLanguages,
  checkAdminAuth,
  getAdminToken,
  adminLogout,
} from './lib/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');

  const [selectedManuscriptId, setSelectedManuscriptId] =
    useState<number | null>(null);

  const [readerManuscript, setReaderManuscript] =
    useState<Manuscript | null>(null);

  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [authReady, setAuthReady] = useState<boolean>(false);

  const loadRequestId = useRef<number>(0);

  // =========================================================
  // ADMIN USER
  // =========================================================
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // =========================================================
  // CATALOGUE FILTERS
  // =========================================================
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'ALL',
    language: 'ALL',
    yearFrom: '',
    yearTo: '',
    status: 'PUBLISHED',
    sortBy: 'created_desc',
  });

  // =========================================================
  // LOAD MANUSCRIPT / CATEGORY / LANGUAGE DATA
  // =========================================================
  const loadData = async () => {
    const requestId = ++loadRequestId.current;

    setLoading(true);

    try {
      const [mList, cList, lList] = await Promise.all([
        fetchManuscripts(filters, adminUser !== null),
        fetchCategories(),
        fetchLanguages(),
      ]);

      if (requestId !== loadRequestId.current) return;

      setManuscripts(mList);
      setCategories(cList);
      setLanguages(lList);
    } catch (e) {
      if (adminUser && !getAdminToken()) {
        setAdminUser(null);
      }

      console.error('Failed to load initial data:', e);
    } finally {
      if (requestId === loadRequestId.current) {
        setLoading(false);
      }
    }
  };

  // =========================================================
  // ADMIN AUTH INITIAL CHECK
  // =========================================================
  useEffect(() => {
    let active = true;

    checkAdminAuth()
      .then(user => {
        if (active) {
          setAdminUser(user);
        }
      })
      .finally(() => {
        if (active) {
          setAuthReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // =========================================================
  // RELOAD DATA WHEN FILTER / ADMIN STATE CHANGES
  // =========================================================
  useEffect(() => {
    if (authReady) {
      loadData();
    }
  }, [filters, adminUser?.id, authReady]);

  // =========================================================
  // NAVIGATION
  // =========================================================
  const handleNavigate = (
    tab: string,
    manuscriptId?: number
  ) => {
    if (manuscriptId !== undefined) {
      setSelectedManuscriptId(manuscriptId);
    }

    setCurrentTab(tab);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // =========================================================
  // PDF READER
  // =========================================================
  const handleOpenReader = (id: number) => {
    const found = manuscripts.find(m => m.id === id);

    if (found) {
      setReaderManuscript(found);
      return;
    }

    fetchManuscriptById(id)
      .then(data => setReaderManuscript(data))
      .catch(err => {
        console.error('Failed to open manuscript:', err);
      });
  };

  const handleCloseReader = () => {
    setReaderManuscript(null);
  };

  // =========================================================
  // ADMIN LOGOUT
  // =========================================================
  const handleLogoutAdmin = () => {
    loadRequestId.current += 1;

    void adminLogout();

    setAdminUser(null);
    setCurrentTab('home');
  };

  // =========================================================
  // CATALOGUE FILTER HANDLERS
  // =========================================================
  const handleFilterChange = (
    updated: Partial<FilterState>
  ) => {
    setFilters(prev => ({
      ...prev,
      ...updated,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'ALL',
      language: 'ALL',
      yearFrom: '',
      yearTo: '',
      status: 'PUBLISHED',
      sortBy: 'created_desc',
    });
  };

  return (
    <div className="min-h-screen bg-[#faf6ed] text-[#2c2217] flex flex-col font-sans selection:bg-amber-800 selection:text-amber-50">

      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        adminUser={adminUser}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}
      <main className="flex-1">

        {/* HOME */}
        {currentTab === 'home' && (
          <HomePage
            manuscripts={manuscripts}
            categories={categories}
            languages={languages}
            onNavigate={handleNavigate}
            onRead={handleOpenReader}
            onSearchQuery={query =>
              handleFilterChange({
                search: query,
              })
            }
          />
        )}

        {/* MANUSCRIPT CATALOGUE */}
        {currentTab === 'catalogue' && (
          <CataloguePage
            manuscripts={manuscripts}
            categories={categories}
            languages={languages}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onRead={handleOpenReader}
            onNavigate={handleNavigate}
          />
        )}

        {/* MANUSCRIPT DETAIL */}
        {currentTab === 'detail' &&
          selectedManuscriptId !== null && (
            <DetailPage
              manuscriptId={selectedManuscriptId}
              onRead={handleOpenReader}
              onNavigate={handleNavigate}
            />
          )}

        {/* =================================================
            CONSERVATION PAGE
        ================================================= */}
        {currentTab === 'conservation' && (
          <ConservationPage
            onNavigate={handleNavigate}
          />
        )}

        {/* =================================================
            GALLERY PAGE
        ================================================= */}
        {currentTab === 'gallery' && (
          <GalleryPage
            onNavigate={handleNavigate}
          />
        )}

        {/* ABOUT */}
        {currentTab === 'about' && (
          <AboutPage
            onNavigate={handleNavigate}
          />
        )}

        {/* ADMIN LOGIN */}
        {currentTab === 'admin-login' && (
          <AdminLoginPage
            onLoginSuccess={user => {
              setAdminUser(user);
              setCurrentTab('admin');
            }}
            onNavigate={handleNavigate}
          />
        )}

        {/* ADMIN DASHBOARD */}
        {currentTab === 'admin' && (
          <AdminDashboard
            onRead={handleOpenReader}
            onNavigate={handleNavigate}
            onLogoutAdmin={handleLogoutAdmin}
          />
        )}

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <Footer
        onNavigate={handleNavigate}
      />

      {/* =====================================================
          FULLSCREEN PDF READER
      ===================================================== */}
      {readerManuscript && (
        <ManuscriptReader
          manuscript={readerManuscript}
          onClose={handleCloseReader}
        />
      )}

    </div>
  );
}