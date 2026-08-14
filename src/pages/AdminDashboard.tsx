import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Trash2,
  Edit,
  Globe,
  Tag,
  Search,
  Layers,
  Sparkles,
  Eye,
  LogOut
} from 'lucide-react';
import { Manuscript, ManuscriptStatus, Category, Language, FilterState } from '../types';
import {
  fetchManuscripts,
  fetchCategories,
  fetchLanguages,
  updateManuscriptStatus,
  deleteManuscript,
  createCategory,
  deleteCategory,
  createLanguage,
  deleteLanguage,
} from '../lib/api';
import { AdminManuscriptForm } from './AdminManuscriptForm';
import { AdminGalleryManagement } from './AdminGalleryManagement';

interface AdminDashboardProps {
  onRead: (id: number) => void;
  onNavigate: (tab: string, id?: number) => void;
  onLogoutAdmin: () => void;
}

type AdminTab = 'manuscripts' | 'gallery' | 'categories' | 'languages';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onRead,
  onNavigate,
  onLogoutAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('manuscripts');
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form modal state
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingManuscript, setEditingManuscript] = useState<Manuscript | null>(null);

  // New Category / Language form inputs
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatDesc, setNewCatDesc] = useState<string>('');
  const [newLangName, setNewLangName] = useState<string>('');
  const [newLangCode, setNewLangCode] = useState<string>('');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [mList, cList, lList] = await Promise.all([
        fetchManuscripts(undefined, true),
        fetchCategories(),
        fetchLanguages(),
      ]);
      setManuscripts(mList);
      setCategories(cList);
      setLanguages(lList);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleToggleStatus = async (id: number, currentStatus: ManuscriptStatus) => {
    let nextStatus = ManuscriptStatus.PUBLISHED;
    if (currentStatus === ManuscriptStatus.PUBLISHED) nextStatus = ManuscriptStatus.DRAFT;
    else if (currentStatus === ManuscriptStatus.DRAFT) nextStatus = ManuscriptStatus.PUBLISHED;

    try {
      await updateManuscriptStatus(id, nextStatus);
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleDeleteManuscript = async (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete manuscript "${title}"?`)) {
      try {
        await deleteManuscript(id);
        loadDashboardData();
      } catch (err: any) {
        alert(err.message || 'Delete failed');
      }
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await createCategory(newCatName.trim(), newCatDesc.trim());
      setNewCatName('');
      setNewCatDesc('');
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Delete this category?')) {
      try {
        await deleteCategory(id);
        loadDashboardData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleCreateLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLangName.trim()) return;
    try {
      await createLanguage(newLangName.trim(), newLangCode.trim());
      setNewLangName('');
      setNewLangCode('');
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to create language');
    }
  };

  const handleDeleteLanguage = async (id: string) => {
    if (window.confirm('Delete this language?')) {
      try {
        await deleteLanguage(id);
        loadDashboardData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Stats
  const totalCount = manuscripts.length;
  const publishedCount = manuscripts.filter(m => m.status === ManuscriptStatus.PUBLISHED).length;
  const draftCount = manuscripts.filter(m => m.status === ManuscriptStatus.DRAFT).length;

  const filteredManuscripts = manuscripts.filter(m => {
    const matchesQuery =
      searchQuery === '' ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.author && m.author.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  if (showForm) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <AdminManuscriptForm
          manuscriptToEdit={editingManuscript}
          categories={categories}
          languages={languages}
          onSuccess={() => {
            setShowForm(false);
            setEditingManuscript(null);
            loadDashboardData();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingManuscript(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-900 text-amber-100 flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-amber-950">
              Archival Admin Control Panel
            </h1>
            <p className="text-xs text-amber-900/80 font-medium">
              Manage manuscript uploads, binary PDF stores, categories, and publishing status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'manuscripts' && (
            <button
              onClick={() => {
                setEditingManuscript(null);
                setShowForm(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              id="admin-add-manuscript-btn"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Add New Manuscript</span>
            </button>
          )}

          <button
            onClick={onLogoutAdmin}
            className="p-2.5 rounded-xl border border-rose-300/80 bg-rose-50 hover:bg-rose-100 text-rose-800 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-[#fbf8f1] p-4 rounded-2xl border border-[#e5dcd0] shadow-sm">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Total</span>
          <span className="font-serif font-bold text-2xl text-amber-950">{totalCount}</span>
        </div>

        <div className="bg-[#fbf8f1] p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-sm">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Published</span>
          <span className="font-serif font-bold text-2xl text-emerald-900">{publishedCount}</span>
        </div>

        <div className="bg-[#fbf8f1] p-4 rounded-2xl border border-amber-300 bg-amber-50/40 shadow-sm">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Drafts</span>
          <span className="font-serif font-bold text-2xl text-amber-900">{draftCount}</span>
        </div>

        <div className="bg-[#fbf8f1] p-4 rounded-2xl border border-[#e5dcd0] shadow-sm">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Categories</span>
          <span className="font-serif font-bold text-2xl text-amber-950">{categories.length}</span>
        </div>

        <div className="bg-[#fbf8f1] p-4 rounded-2xl border border-[#e5dcd0] shadow-sm col-span-2 sm:col-span-1">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Languages</span>
          <span className="font-serif font-bold text-2xl text-amber-950">{languages.length}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-amber-200 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('manuscripts')}
          className={`px-4 py-2.5 rounded-t-xl transition-all border-t border-x shrink-0 ${
            activeTab === 'manuscripts'
              ? 'bg-[#fbf8f1] text-amber-950 border-[#e5dcd0] border-b-transparent font-extrabold'
              : 'text-amber-900/60 border-transparent hover:text-amber-950'
          }`}
        >
          Manuscripts ({totalCount})
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2.5 rounded-t-xl transition-all border-t border-x shrink-0 ${
            activeTab === 'gallery'
              ? 'bg-[#fbf8f1] text-amber-950 border-[#e5dcd0] border-b-transparent font-extrabold'
              : 'text-amber-900/60 border-transparent hover:text-amber-950'
          }`}
        >
          Event Gallery
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2.5 rounded-t-xl transition-all border-t border-x shrink-0 ${
            activeTab === 'categories'
              ? 'bg-[#fbf8f1] text-amber-950 border-[#e5dcd0] border-b-transparent font-extrabold'
              : 'text-amber-900/60 border-transparent hover:text-amber-950'
          }`}
        >
          Categories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('languages')}
          className={`px-4 py-2.5 rounded-t-xl transition-all border-t border-x shrink-0 ${
            activeTab === 'languages'
              ? 'bg-[#fbf8f1] text-amber-950 border-[#e5dcd0] border-b-transparent font-extrabold'
              : 'text-amber-900/60 border-transparent hover:text-amber-950'
          }`}
        >
          Languages ({languages.length})
        </button>
      </div>

      {/* TAB 1: MANUSCRIPTS TABLE */}
      {activeTab === 'manuscripts' && (
        <div className="bg-[#fbf8f1] border border-[#e5dcd0] rounded-2xl p-6 shadow-sm space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-amber-800/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by title or author..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#e5dcd0] text-xs text-amber-950 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 w-full sm:w-auto justify-end">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-white border border-[#e5dcd0] rounded-lg px-3 py-1.5 text-xs text-amber-950 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value={ManuscriptStatus.PUBLISHED}>Published</option>
                <option value={ManuscriptStatus.DRAFT}>Draft</option>
                <option value={ManuscriptStatus.ARCHIVED}>Archived</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-[#e5dcd0]">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-900/10 text-amber-950 font-serif font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Title & Author</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Language</th>
                  <th className="p-3.5">Year</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200/60 bg-white/60">
                {filteredManuscripts.map(m => (
                  <tr key={m.id} className="hover:bg-amber-100/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-serif font-bold text-amber-950 text-sm">{m.title}</div>
                      <div className="text-[11px] text-amber-900/70 italic">By {m.author}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-200 text-amber-950 border border-amber-300">
                        {m.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-amber-900 font-medium">{m.language}</td>
                    <td className="p-3.5 text-amber-900 font-semibold">
                      {m.year < 0 ? `${Math.abs(m.year)} BCE` : `${m.year} CE`}
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleStatus(m.id, m.status)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-colors ${
                          m.status === ManuscriptStatus.PUBLISHED
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : m.status === ManuscriptStatus.DRAFT
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-zinc-200 text-zinc-700'
                        }`}
                        title="Click to toggle Draft / Published status"
                      >
                        {m.status}
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onRead(m.id)}
                          className="p-1.5 rounded-lg bg-amber-900 text-amber-100 hover:bg-amber-950 transition-colors"
                          title="Read PDF"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingManuscript(m);
                            setShowForm(true);
                          }}
                          className="p-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors"
                          title="Edit Metadata"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteManuscript(m.id, m.title)}
                          className="p-1.5 rounded-lg bg-rose-100 text-rose-800 hover:bg-rose-200 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'gallery' && <AdminGalleryManagement />}

      {/* TAB 2: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form */}
          <div className="bg-[#fbf8f1] border border-[#e5dcd0] p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-amber-950">Add New Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Category Name (e.g., Alchemy & Metallurgy)"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#e5dcd0] text-xs text-amber-950 focus:outline-none"
              />
              <textarea
                placeholder="Description..."
                value={newCatDesc}
                onChange={e => setNewCatDesc(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#e5dcd0] text-xs text-amber-950 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-bold transition-colors"
              >
                Create Category
              </button>
            </form>
          </div>

          {/* List */}
          <div className="md:col-span-2 bg-[#fbf8f1] border border-[#e5dcd0] p-6 rounded-2xl shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-base text-amber-950">Existing Categories</h3>
            <div className="space-y-2">
              {categories.map(c => (
                <div key={c.id} className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-amber-950 block">{c.name}</span>
                    <span className="text-[11px] text-amber-900/70">{c.description || 'No description'}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LANGUAGES */}
      {activeTab === 'languages' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form */}
          <div className="bg-[#fbf8f1] border border-[#e5dcd0] p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-amber-950">Add Classical Language</h3>
            <form onSubmit={handleCreateLanguage} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Language Name (e.g., Aramaic)"
                value={newLangName}
                onChange={e => setNewLangName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#e5dcd0] text-xs text-amber-950 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Code (e.g., arc)"
                value={newLangCode}
                onChange={e => setNewLangCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#e5dcd0] text-xs text-amber-950 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-bold transition-colors"
              >
                Create Language
              </button>
            </form>
          </div>

          {/* List */}
          <div className="md:col-span-2 bg-[#fbf8f1] border border-[#e5dcd0] p-6 rounded-2xl shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-base text-amber-950">Registered Languages</h3>
            <div className="grid grid-cols-2 gap-3">
              {languages.map(l => (
                <div key={l.id} className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-amber-950 block">{l.name}</span>
                    <span className="text-[10px] text-amber-800 uppercase tracking-widest font-mono">{l.code || 'la'}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteLanguage(l.id)}
                    className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
