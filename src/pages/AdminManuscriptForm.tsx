import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  ArrowLeft,
  Check,
  AlertCircle,
  BookOpen,
  Image as ImageIcon
} from 'lucide-react';
import { Manuscript, ManuscriptFormData, ManuscriptStatus, Category, Language } from '../types';
import { createManuscript, updateManuscript } from '../lib/api';

interface AdminManuscriptFormProps {
  manuscriptToEdit?: Manuscript | null;
  categories: Category[];
  languages: Language[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminManuscriptForm: React.FC<AdminManuscriptFormProps> = ({
  manuscriptToEdit,
  categories,
  languages,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<ManuscriptFormData>({
    title: '',
    author: '',
    description: '',
    category: categories[0]?.name || 'Medical & Ayurveda',
    language: languages[0]?.name || 'Sanskrit',
    year: '',
    keywords: '',
    pageCount: 1,
    status: ManuscriptStatus.DRAFT,
  });

  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [coverFileName, setCoverFileName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (manuscriptToEdit) {
      setFormData({
        title: manuscriptToEdit.title || '',
        author: manuscriptToEdit.author || '',
        description: manuscriptToEdit.description || '',
        category: manuscriptToEdit.category || categories[0]?.name || '',
        language: manuscriptToEdit.language || languages[0]?.name || '',
        year: manuscriptToEdit.year || '',
        keywords: manuscriptToEdit.keywords || '',
        pageCount: manuscriptToEdit.pageCount || 1,
        status: manuscriptToEdit.status || ManuscriptStatus.DRAFT,
      });
      setPdfFileName(manuscriptToEdit.fileName || '');
    }
  }, [manuscriptToEdit, categories, languages]);

  // Handle PDF file selection
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Selected file must be a PDF document.');
      e.target.value = '';
      return;
    }

    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const detectedPageCount = pdf.getPageCount();
      if (detectedPageCount < 1) throw new Error('The PDF has no pages.');

      setFormData(prev => ({ ...prev, pageCount: detectedPageCount }));
      setError(null);
    } catch {
      setError('The selected PDF could not be read. Please choose a valid, unlocked PDF.');
      setPdfFileName('');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData(prev => ({
        ...prev,
        pdfData: result,
        fileName: file.name,
        mimeType: file.type,
      }));
      setPdfFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  // Handle Cover image upload
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData(prev => ({
        ...prev,
        coverData: result,
        coverType: file.type,
      }));
      setCoverFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (manuscriptToEdit) {
        await updateManuscript(manuscriptToEdit.id, formData);
      } else {
        await createManuscript(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save manuscript.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-[#D1CEC7] pb-4">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8A8471] hover:text-[#B08D57] uppercase tracking-wider mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <h1 className="font-serif font-bold text-2xl text-[#2C2C2C]">
            {manuscriptToEdit ? 'Edit Manuscript Record' : 'Upload & Preserve New Manuscript'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-sm bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#FAF8F5] border border-[#D1CEC7] rounded-sm p-6 sm:p-8 shadow-sm space-y-6">
        {/* Basic Metadata */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-base text-[#2C2C2C] border-b border-[#D1CEC7] pb-2">
            1. Manuscript Metadata
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-[#8A8471] uppercase tracking-wider block">
                Manuscript Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Sushruta Samhita: Treatise on Surgery"
                className="w-full px-3.5 py-2.5 rounded-sm bg-white border border-[#D1CEC7] text-sm text-[#2C2C2C] focus:outline-none focus:border-[#B08D57]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#8A8471] uppercase tracking-wider block">
                Attributed Author / Scribe
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={e => setFormData({ ...formData, author: e.target.value })}
                placeholder="e.g. Maharshi Sushruta"
                className="w-full px-3.5 py-2.5 rounded-sm bg-white border border-[#D1CEC7] text-sm text-[#2C2C2C] focus:outline-none focus:border-[#B08D57]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#8A8471] uppercase tracking-wider block">
                Estimated Year (Era)
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: e.target.value === '' ? '' : Number(e.target.value) })}
                placeholder="e.g. -600 (BCE) or 500 (CE)"
                className="w-full px-3.5 py-2.5 rounded-sm bg-white border border-[#D1CEC7] text-sm text-[#2C2C2C] focus:outline-none focus:border-[#B08D57]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#8A8471] uppercase tracking-wider block">
                Category
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-sm bg-white border border-[#D1CEC7] text-sm text-[#2C2C2C] focus:outline-none focus:border-[#B08D57]"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#8A8471] uppercase tracking-wider block">
                Language
              </label>
              <select
                value={formData.language}
                onChange={e => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-sm bg-white border border-[#D1CEC7] text-sm text-[#2C2C2C] focus:outline-none focus:border-[#B08D57]"
              >
                {languages.map(l => (
                  <option key={l.id} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#8A8471] uppercase tracking-wider block">
                Folio / Page Count (Detected Automatically)
              </label>
              <input
                type="number"
                min="1"
                value={formData.pageCount}
                readOnly
                aria-readonly="true"
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#edf0d9] border border-[#D1CEC7] text-sm text-[#2C2C2C] cursor-not-allowed"
              />
              <p className="text-[11px] text-[#8A8471]">
                Upload a PDF and its total number of pages will be used as the folio count.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#8A8471] uppercase tracking-wider block">
                Publishing Status
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as ManuscriptStatus })}
                className="w-full px-3.5 py-2.5 rounded-sm bg-white border border-[#D1CEC7] text-sm text-[#2C2C2C] focus:outline-none focus:border-[#B08D57] font-bold"
              >
                <option value={ManuscriptStatus.DRAFT}>DRAFT (Hidden from Public)</option>
                <option value={ManuscriptStatus.PUBLISHED}>PUBLISHED (Publicly Readable)</option>
                <option value={ManuscriptStatus.ARCHIVED}>ARCHIVED</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-[#8A8471] uppercase tracking-wider block">
                Keywords / Subjects (Comma separated)
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="e.g. Surgery, Anatomy, Medical Herbs, Ancient India"
                className="w-full px-3.5 py-2.5 rounded-sm bg-white border border-[#D1CEC7] text-sm text-[#2C2C2C] focus:outline-none focus:border-[#B08D57]"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-[#8A8471] uppercase tracking-wider block">
                Historical Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed historical background, codex origin, and significance..."
                className="w-full px-3.5 py-2.5 rounded-sm bg-white border border-[#D1CEC7] text-sm text-[#2C2C2C] focus:outline-none focus:border-[#B08D57]"
              />
            </div>
          </div>
        </div>

        {/* Files Upload Section */}
        <div className="space-y-4 pt-4 border-t border-[#D1CEC7]">
          <h3 className="font-serif font-bold text-base text-[#2C2C2C] border-b border-[#D1CEC7] pb-2">
            2. Binary File Upload (SQLite BLOB)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PDF File Upload Box */}
            <div className="p-5 bg-white rounded-sm border-2 border-dashed border-[#D1CEC7] text-center space-y-3">
              <FileText className="w-8 h-8 text-[#B08D57] mx-auto" />
              <div>
                <span className="font-bold text-[#2C2C2C] text-sm block">
                  Manuscript PDF Document
                </span>
                <span className="text-xs text-[#8A8471]">
                  {pdfFileName ? `Selected: ${pdfFileName}` : 'Select a PDF to store as a SQLite BLOB'}
                </span>
              </div>

              <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-[#2C2C2C] hover:bg-[#404040] text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload PDF File</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Cover Image Upload Box */}
            <div className="p-5 bg-white rounded-sm border-2 border-dashed border-[#D1CEC7] text-center space-y-3">
              <ImageIcon className="w-8 h-8 text-[#B08D57] mx-auto" />
              <div>
                <span className="font-bold text-[#2C2C2C] text-sm block">
                  Manuscript Cover Image (Optional)
                </span>
                <span className="text-xs text-[#8A8471]">
                  {coverFileName ? `Selected: ${coverFileName}` : 'Upload cover photo or thumbnail image'}
                </span>
              </div>

              <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-white hover:bg-[#FAF8F5] text-[#2C2C2C] text-xs font-bold uppercase tracking-wider cursor-pointer border border-[#D1CEC7] transition-colors">
                <Upload className="w-3.5 h-3.5 text-[#B08D57]" />
                <span>Upload Cover Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-4 border-t border-[#D1CEC7] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-sm border border-[#D1CEC7] text-[#2C2C2C] text-xs font-bold uppercase tracking-wider hover:bg-[#FAF8F5] transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-sm bg-[#B08D57] hover:bg-[#967645] text-white font-sans font-bold text-xs uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-white" />
            <span>{loading ? 'Saving to Database...' : manuscriptToEdit ? 'Save Changes' : 'Preserve Manuscript'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
