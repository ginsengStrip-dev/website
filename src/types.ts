export enum ManuscriptStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface Manuscript {
  id: number;
  title: string;
  author?: string;
  description?: string;
  category?: string;
  language?: string;
  year?: number;
  keywords?: string;
  pageCount?: number;
  fileName: string;
  mimeType: string;
  coverType?: string;
  hasCover?: boolean;
  hasPdf?: boolean;
  status: ManuscriptStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ManuscriptFormData {
  title: string;
  author: string;
  description: string;
  category: string;
  language: string;
  year: number | '';
  keywords: string;
  pageCount: number | '';
  status: ManuscriptStatus;
  coverData?: string; // Base64 or data URL
  coverType?: string;
  pdfData?: string;   // Base64 string
  fileName?: string;
  mimeType?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  count?: number;
}

export interface Language {
  id: string;
  name: string;
  code?: string;
  count?: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

export interface FilterState {
  search: string;
  category: string;
  language: string;
  yearFrom: string;
  yearTo: string;
  status: string;
  sortBy: 'year_asc' | 'year_desc' | 'title_asc' | 'created_desc';
}
