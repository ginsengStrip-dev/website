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

export type GalleryEventStatus = 'ACTIVE' | 'INACTIVE';

export interface GalleryImage {
  id: number;
  eventId: number;
  imageUrl: string;
  thumbnailUrl: string;
  caption: string;
  altText: string;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryEvent {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  eventYear: number;
  status: GalleryEventStatus;
  createdAt: string;
  updatedAt: string;
  images: GalleryImage[];
  imageCount?: number;
}

export interface GalleryEventInput {
  title: string;
  description?: string;
  eventDate: string;
  status: GalleryEventStatus;
}

export interface GalleryImageInput {
  caption: string;
  altText: string;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
}

export interface GalleryYearResponse {
  year: number;
  events: GalleryEvent[];
  totalImages: number;
  hasMore: boolean;
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
