import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ManuscriptReader } from './components/ManuscriptReader';
import { HomePage } from './pages/HomePage';
import { CataloguePage } from './pages/CataloguePage';
import { DetailPage } from './pages/DetailPage';
import { AboutPage } from './pages/AboutPage';
import { GalleryPage } from './pages/GalleryPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { Manuscript, Category, Language, FilterState, AdminUser } from './types';
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
  const [selectedManuscriptId, setSelectedManuscriptId] = useState<number | null>(null);
  const [readerManuscript, setReaderManuscript] = useState<Manuscript | null>(null);

  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const loadRequestId = useRef<number>(0);

  // Admin user state
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'ALL',
    language: 'ALL',
    yearFrom: '',
    yearTo: '',
    status: 'PUBLISHED',
    sortBy: 'created_desc',
  });

  // Load initial data
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
      if (adminUser && !getAdminToken()) setAdminUser(null);
      console.error('Failed to load initial data:', e);
    } finally {
      if (requestId === loadRequestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    checkAdminAuth()
      .then(user => {
        if (active) setAdminUser(user);
      })
      .finally(() => {
        if (active) setAuthReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (authReady) loadData();
  }, [filters, adminUser?.id, authReady]);

  const handleNavigate = (tab: string, manuscriptId?: number) => {
    if (manuscriptId) {
      setSelectedManuscriptId(manuscriptId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReader = (id: number) => {
    const found = manuscripts.find(m => m.id === id);
    if (found) {
      setReaderManuscript(found);
    } else {
      // Fetch if not in memory
      fetchManuscriptById(id)
        .then(data => setReaderManuscript(data))
        .catch(err => console.error(err));
    }
  };

  const handleCloseReader = () => {
    setReaderManuscript(null);
  };

  const handleLogoutAdmin = () => {
    loadRequestId.current += 1;
    void adminLogout();
    setAdminUser(null);
    setCurrentTab('home');
  };

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updated }));
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
      {/* Header Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        adminUser={adminUser}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* Main Page Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            manuscripts={manuscripts}
            categories={categories}
            languages={languages}
            onNavigate={handleNavigate}
            onRead={handleOpenReader}
            onSearchQuery={q => handleFilterChange({ search: q })}
          />
        )}

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

        {currentTab === 'detail' && selectedManuscriptId && (
          <DetailPage
            manuscriptId={selectedManuscriptId}
            onRead={handleOpenReader}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'about' && <AboutPage onNavigate={handleNavigate} />}

        {currentTab === 'gallery' && <GalleryPage />}

        {currentTab === 'admin-login' && (
          <AdminLoginPage
            onLoginSuccess={user => {
              setAdminUser(user);
              setCurrentTab('admin');
            }}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            onRead={handleOpenReader}
            onNavigate={handleNavigate}
            onLogoutAdmin={handleLogoutAdmin}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Fullscreen Interactive PDF Manuscript Reader Modal */}
      {readerManuscript && (
        <ManuscriptReader
          manuscript={readerManuscript}
          onClose={handleCloseReader}
        />
      )}
    </div>
  );
}
