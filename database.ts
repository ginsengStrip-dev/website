import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import bcrypt from 'bcryptjs';

export type ManuscriptStatusValue = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ManuscriptRecord {
  id: number;
  title: string;
  author: string;
  description: string;
  category: string;
  language: string;
  year: number;
  keywords: string;
  pageCount: number;
  fileName: string;
  mimeType: string;
  coverType?: string;
  hasCover: boolean;
  hasPdf: boolean;
  status: ManuscriptStatusValue;
  createdAt: string;
  updatedAt: string;
}

export interface ManuscriptWrite {
  id?: number;
  title: string;
  author: string;
  description: string;
  category: string;
  language: string;
  year: number;
  keywords: string;
  pageCount: number;
  fileName?: string;
  mimeType: string;
  coverType?: string;
  status: ManuscriptStatusValue;
  createdAt?: string;
  updatedAt?: string;
}

export interface InitialManuscript {
  record: ManuscriptWrite & { id: number };
  pdfData: Buffer;
}

export interface ManuscriptFilters {
  search?: string;
  category?: string;
  language?: string;
  yearFrom?: number;
  yearTo?: number;
  status?: string;
  sortBy?: string;
  includeUnpublished?: boolean;
}

export interface CategoryRecord {
  id: string;
  name: string;
  description: string;
  count?: number;
}

export interface LanguageRecord {
  id: string;
  name: string;
  code: string;
  count?: number;
}

export interface AdminRecord {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  passwordHash: string;
}

export type GalleryEventStatusValue = 'ACTIVE' | 'INACTIVE';

export interface GalleryEventRecord {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  eventYear: number;
  status: GalleryEventStatusValue;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryEventWrite {
  title: string;
  description: string;
  eventDate: string;
  eventYear: number;
  status: GalleryEventStatusValue;
}

export interface GalleryImageRecord {
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

export interface GalleryImageWrite {
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
}

export interface GalleryImageMetadataUpdate {
  caption?: string;
  altText?: string;
  displayOrder?: number;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface GalleryImageWithEventRecord extends GalleryImageRecord {
  eventTitle: string;
  eventDescription: string;
  eventDate: string;
  eventYear: number;
  eventStatus: GalleryEventStatusValue;
  eventCreatedAt: string;
  eventUpdatedAt: string;
}

const DEFAULT_CATEGORIES: CategoryRecord[] = [
  { id: '1', name: 'Medical & Ayurveda', description: 'Classical medical treatises, herbalism, and surgical guides' },
  { id: '2', name: 'Astronomy & Mathematics', description: 'Planetary mechanics, geometry, and ancient calculation codices' },
  { id: '3', name: 'Philosophy & Vedic Texts', description: 'Metaphysical treatises, commentaries, and spiritual discourses' },
  { id: '4', name: 'Literature & Poetry', description: 'Epic narratives, classical drama, and poetic compositions' },
  { id: '5', name: 'History & Chronicles', description: 'Royal records, genealogical annals, and travelogues' },
  { id: '6', name: 'Alchemy & Botany', description: 'Metallurgical arts, plant classifications, and natural science' },
];

const DEFAULT_LANGUAGES: LanguageRecord[] = [
  { id: '1', name: 'Sanskrit', code: 'sa' },
  { id: '2', name: 'Tamil', code: 'ta' },
  { id: '3', name: 'Persian', code: 'fa' },
  { id: '4', name: 'Pali', code: 'pi' },
  { id: '5', name: 'Tibetan', code: 'bo' },
  { id: '6', name: 'Latin', code: 'la' },
  { id: '7', name: 'Arabic', code: 'ar' },
  { id: '8', name: 'Old Javanese (Kawi)', code: 'kaw' },
];

export const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.cwd(), process.env.DATA_DIR)
  : path.join(process.cwd(), '.data');

const configuredDatabasePath = process.env.DATABASE_PATH;
export const DATABASE_PATH = configuredDatabasePath === ':memory:'
  ? configuredDatabasePath
  : configuredDatabasePath
    ? path.resolve(process.cwd(), configuredDatabasePath)
    : path.join(DATA_DIR, 'archive.sqlite');

const LEGACY_MANUSCRIPTS_FILE = path.join(DATA_DIR, 'manuscripts.json');
const LEGACY_CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const LEGACY_LANGUAGES_FILE = path.join(DATA_DIR, 'languages.json');
const LEGACY_PDF_DIR = path.join(DATA_DIR, 'pdfs');
const LEGACY_COVER_DIR = path.join(DATA_DIR, 'covers');

fs.mkdirSync(DATA_DIR, { recursive: true });
if (DATABASE_PATH !== ':memory:') {
  fs.mkdirSync(path.dirname(DATABASE_PATH), { recursive: true });
}

const database = new DatabaseSync(DATABASE_PATH);

database.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;

  CREATE TABLE IF NOT EXISTS app_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    description TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS languages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    code TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'SUPER_ADMIN')),
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS manuscripts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    language TEXT NOT NULL DEFAULT '',
    year INTEGER NOT NULL,
    keywords TEXT NOT NULL DEFAULT '',
    page_count INTEGER NOT NULL DEFAULT 1 CHECK (page_count > 0),
    file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL DEFAULT 'application/pdf',
    cover_type TEXT,
    pdf_data BLOB,
    cover_data BLOB,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS gallery_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    event_date TEXT NOT NULL,
    event_year INTEGER NOT NULL CHECK (event_year BETWEEN 1 AND 9999),
    status TEXT NOT NULL DEFAULT 'INACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    CHECK (event_year = CAST(substr(event_date, 1, 4) AS INTEGER))
  );

  CREATE TABLE IF NOT EXISTS gallery_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    caption TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
    is_featured INTEGER NOT NULL DEFAULT 0 CHECK (is_featured IN (0, 1)),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    width INTEGER CHECK (width IS NULL OR width > 0),
    height INTEGER CHECK (height IS NULL OR height > 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (event_id) REFERENCES gallery_events(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_manuscripts_status ON manuscripts(status);
  CREATE INDEX IF NOT EXISTS idx_manuscripts_category ON manuscripts(category);
  CREATE INDEX IF NOT EXISTS idx_manuscripts_language ON manuscripts(language);
  CREATE INDEX IF NOT EXISTS idx_manuscripts_year ON manuscripts(year);
  CREATE INDEX IF NOT EXISTS idx_manuscripts_created_at ON manuscripts(created_at DESC);

  CREATE INDEX IF NOT EXISTS idx_gallery_events_year ON gallery_events(event_year DESC);
  CREATE INDEX IF NOT EXISTS idx_gallery_events_status_year_date
    ON gallery_events(status, event_year DESC, event_date DESC, id DESC);
  CREATE INDEX IF NOT EXISTS idx_gallery_images_event_order
    ON gallery_images(event_id, display_order, id);
  CREATE INDEX IF NOT EXISTS idx_gallery_images_active_event
    ON gallery_images(is_active, event_id);
  CREATE INDEX IF NOT EXISTS idx_gallery_images_featured
    ON gallery_images(is_featured, event_id) WHERE is_active = 1;

  PRAGMA user_version = 3;
`);

function inTransaction<T>(operation: () => T): T {
  database.exec('BEGIN IMMEDIATE');
  try {
    const result = operation();
    database.exec('COMMIT');
    return result;
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

function readLegacyJson<T>(filePath: string): T | undefined {
  if (!fs.existsSync(filePath)) return undefined;

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch (error) {
    console.error(`Could not read legacy data from ${filePath}:`, error);
    return undefined;
  }
}

function normalizeStatus(value: unknown): ManuscriptStatusValue {
  return value === 'PUBLISHED' || value === 'ARCHIVED' ? value : 'DRAFT';
}

function seedLookupTablesFromLegacyFiles() {
  const legacyCategories = readLegacyJson<CategoryRecord[]>(LEGACY_CATEGORIES_FILE);
  const categoryRecords = legacyCategories?.length ? legacyCategories : DEFAULT_CATEGORIES;
  const insertCategory = database.prepare('INSERT OR IGNORE INTO categories (id, name, description) VALUES (?, ?, ?)');
  inTransaction(() => {
    for (const category of categoryRecords) {
      insertCategory.run(String(category.id), category.name, category.description || '');
    }
  });

  const legacyLanguages = readLegacyJson<LanguageRecord[]>(LEGACY_LANGUAGES_FILE);
  const languageRecords = legacyLanguages?.length ? legacyLanguages : DEFAULT_LANGUAGES;
  const insertLanguage = database.prepare('INSERT OR IGNORE INTO languages (id, name, code) VALUES (?, ?, ?)');
  inTransaction(() => {
    for (const language of languageRecords) {
      insertLanguage.run(String(language.id), language.name, language.code || language.name.toLowerCase().slice(0, 3));
    }
  });
}

function seedAdminAccount() {
  if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD must be set before creating the production database');
  }

  const email = (process.env.ADMIN_EMAIL || 'admin@preservation.org').trim().toLowerCase();
  const existing = database.prepare('SELECT id FROM admin_users WHERE email = ?').get(email);
  if (existing) return;

  const now = new Date().toISOString();
  const passwordHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 12);
  database.prepare(`
    INSERT INTO admin_users (id, email, name, role, password_hash, created_at, updated_at)
    VALUES (?, ?, ?, 'SUPER_ADMIN', ?, ?, ?)
  `).run('admin-1', email, process.env.ADMIN_NAME || 'Senior Archival Administrator', passwordHash, now, now);
}

function migrateLegacyManuscripts(): number {
  const legacyRecords = readLegacyJson<any[]>(LEGACY_MANUSCRIPTS_FILE);
  if (!legacyRecords?.length) return 0;

  const insert = database.prepare(`
    INSERT OR IGNORE INTO manuscripts (
      id, title, author, description, category, language, year, keywords, page_count,
      file_name, mime_type, cover_type, pdf_data, cover_data, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const migratedCount = inTransaction(() => {
    let inserted = 0;
    for (const record of legacyRecords) {
      const pdfPath = path.join(LEGACY_PDF_DIR, path.basename(String(record.fileName || '')));
      const coverPath = path.join(LEGACY_COVER_DIR, `cover_${Number(record.id)}`);
      const pdfData = record.hasPdf !== false && fs.existsSync(pdfPath) ? fs.readFileSync(pdfPath) : null;
      const coverData = record.hasCover && fs.existsSync(coverPath) ? fs.readFileSync(coverPath) : null;
      const now = new Date().toISOString();

      const legacyYear = Number(record.year);
      const result = insert.run(
        Number(record.id),
        String(record.title || 'Untitled Manuscript'),
        String(record.author || 'Unknown Scribe'),
        String(record.description || ''),
        String(record.category || 'General Archives'),
        String(record.language || 'Sanskrit'),
        record.year !== null && record.year !== undefined && Number.isFinite(legacyYear) ? legacyYear : 1000,
        String(record.keywords || ''),
        Math.max(1, Number(record.pageCount) || 1),
        path.basename(String(record.fileName || `manuscript_${Number(record.id)}.pdf`)),
        String(record.mimeType || 'application/pdf'),
        record.coverType ? String(record.coverType) : null,
        pdfData,
        coverData,
        normalizeStatus(record.status),
        String(record.createdAt || now),
        String(record.updatedAt || now),
      );
      inserted += Number(result.changes);
    }
    return inserted;
  });

  if (migratedCount > 0) {
    console.log(`Migrated ${migratedCount} manuscripts and their binary files into SQLite.`);
  }
  return migratedCount;
}

function getMetadata(key: string): string | undefined {
  const row = database.prepare('SELECT value FROM app_metadata WHERE key = ?').get(key) as any;
  return row ? String(row.value) : undefined;
}

function setMetadata(key: string, value: string) {
  database.prepare(`
    INSERT INTO app_metadata (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}

const LEGACY_IMPORT_KEY = 'legacy_import_v1_complete';
const INITIAL_MANUSCRIPTS_KEY = 'initial_manuscripts_v1_complete';
const PDF_PAGE_COUNTS_KEY = 'pdf_page_counts_v1_complete';

if (getMetadata(LEGACY_IMPORT_KEY) !== '1') {
  seedLookupTablesFromLegacyFiles();
  migrateLegacyManuscripts();
  setMetadata(LEGACY_IMPORT_KEY, '1');
  if (countManuscripts() > 0) setMetadata(INITIAL_MANUSCRIPTS_KEY, '1');
}
seedAdminAccount();

const MANUSCRIPT_COLUMNS = `
  id, title, author, description, category, language, year, keywords, page_count,
  file_name, mime_type, cover_type,
  CASE WHEN pdf_data IS NULL THEN 0 ELSE 1 END AS has_pdf,
  CASE WHEN cover_data IS NULL THEN 0 ELSE 1 END AS has_cover,
  status, created_at, updated_at
`;

function manuscriptFromRow(row: any): ManuscriptRecord {
  return {
    id: Number(row.id),
    title: String(row.title),
    author: String(row.author),
    description: String(row.description),
    category: String(row.category),
    language: String(row.language),
    year: Number(row.year),
    keywords: String(row.keywords),
    pageCount: Number(row.page_count),
    fileName: String(row.file_name),
    mimeType: String(row.mime_type),
    coverType: row.cover_type ? String(row.cover_type) : undefined,
    hasPdf: Boolean(row.has_pdf),
    hasCover: Boolean(row.has_cover),
    status: normalizeStatus(row.status),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, match => `\\${match}`);
}

export function countManuscripts(): number {
  return Number((database.prepare('SELECT COUNT(*) AS count FROM manuscripts').get() as any).count);
}

export function shouldSeedInitialManuscripts(): boolean {
  return getMetadata(INITIAL_MANUSCRIPTS_KEY) !== '1';
}

export function shouldSyncPdfPageCounts(): boolean {
  return getMetadata(PDF_PAGE_COUNTS_KEY) !== '1';
}

export function markPdfPageCountsSynced() {
  setMetadata(PDF_PAGE_COUNTS_KEY, '1');
}

export function insertInitialManuscripts(entries: InitialManuscript[]) {
  const insert = database.prepare(`
    INSERT OR IGNORE INTO manuscripts (
      id, title, author, description, category, language, year, keywords, page_count,
      file_name, mime_type, cover_type, pdf_data, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  inTransaction(() => {
    for (const { record, pdfData } of entries) {
      const createdAt = record.createdAt || new Date().toISOString();
      insert.run(
        record.id,
        record.title,
        record.author,
        record.description,
        record.category,
        record.language,
        record.year,
        record.keywords,
        Math.max(1, record.pageCount),
        record.fileName || `manuscript_${record.id}.pdf`,
        record.mimeType,
        record.coverType || null,
        pdfData,
        record.status,
        createdAt,
        record.updatedAt || createdAt,
      );
    }
    setMetadata(INITIAL_MANUSCRIPTS_KEY, '1');
  });
}

export function listManuscripts(filters: ManuscriptFilters = {}): ManuscriptRecord[] {
  const conditions: string[] = [];
  const values: SQLInputValue[] = [];

  if (!filters.includeUnpublished) {
    conditions.push('status = ?');
    values.push('PUBLISHED');
  } else if (filters.status && filters.status !== 'ALL') {
    conditions.push('status = ?');
    values.push(filters.status);
  }

  if (filters.search?.trim()) {
    const search = `%${escapeLike(filters.search.trim())}%`;
    conditions.push(`(
      title LIKE ? ESCAPE '\\' COLLATE NOCASE OR
      author LIKE ? ESCAPE '\\' COLLATE NOCASE OR
      description LIKE ? ESCAPE '\\' COLLATE NOCASE OR
      keywords LIKE ? ESCAPE '\\' COLLATE NOCASE
    )`);
    values.push(search, search, search, search);
  }

  if (filters.category && filters.category !== 'ALL') {
    conditions.push('category = ?');
    values.push(filters.category);
  }

  if (filters.language && filters.language !== 'ALL') {
    conditions.push('language = ?');
    values.push(filters.language);
  }

  if (filters.yearFrom !== undefined && Number.isFinite(filters.yearFrom)) {
    conditions.push('year >= ?');
    values.push(filters.yearFrom);
  }

  if (filters.yearTo !== undefined && Number.isFinite(filters.yearTo)) {
    conditions.push('year <= ?');
    values.push(filters.yearTo);
  }

  const orderBy = filters.sortBy === 'year_asc'
    ? 'year ASC'
    : filters.sortBy === 'year_desc'
      ? 'year DESC'
      : filters.sortBy === 'title_asc'
        ? 'title COLLATE NOCASE ASC'
        : 'created_at DESC';
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = database.prepare(`SELECT ${MANUSCRIPT_COLUMNS} FROM manuscripts ${where} ORDER BY ${orderBy}`).all(...values);
  return rows.map(manuscriptFromRow);
}

export function getManuscript(id: number): ManuscriptRecord | undefined {
  const row = database.prepare(`SELECT ${MANUSCRIPT_COLUMNS} FROM manuscripts WHERE id = ?`).get(id);
  return row ? manuscriptFromRow(row) : undefined;
}

export function getManuscriptPdf(id: number): { data: Buffer; fileName: string; mimeType: string } | undefined {
  const row = database.prepare('SELECT pdf_data, file_name, mime_type FROM manuscripts WHERE id = ?').get(id) as any;
  if (!row?.pdf_data) return undefined;
  return { data: Buffer.from(row.pdf_data), fileName: String(row.file_name), mimeType: String(row.mime_type) };
}

export function getManuscriptCover(id: number): { data: Buffer; coverType: string } | undefined {
  const row = database.prepare('SELECT cover_data, cover_type FROM manuscripts WHERE id = ?').get(id) as any;
  if (!row?.cover_data) return undefined;
  return { data: Buffer.from(row.cover_data), coverType: String(row.cover_type || 'image/jpeg') };
}

export function insertManuscript(record: ManuscriptWrite, pdfData?: Buffer, coverData?: Buffer): ManuscriptRecord {
  const now = new Date().toISOString();
  const createdAt = record.createdAt || now;
  const updatedAt = record.updatedAt || createdAt;

  return inTransaction(() => {
    const columns = record.id ? 'id, ' : '';
    const placeholders = record.id ? '?, ' : '';
    const values: SQLInputValue[] = record.id ? [record.id] : [];
    values.push(
      record.title,
      record.author,
      record.description,
      record.category,
      record.language,
      record.year,
      record.keywords,
      Math.max(1, record.pageCount),
      record.fileName || '',
      record.mimeType,
      record.coverType || null,
      pdfData || null,
      coverData || null,
      record.status,
      createdAt,
      updatedAt,
    );

    const result = database.prepare(`
      INSERT INTO manuscripts (
        ${columns}title, author, description, category, language, year, keywords, page_count,
        file_name, mime_type, cover_type, pdf_data, cover_data, status, created_at, updated_at
      ) VALUES (${placeholders}?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(...values);

    const id = record.id || Number(result.lastInsertRowid);
    if (!record.fileName) {
      database.prepare('UPDATE manuscripts SET file_name = ? WHERE id = ?').run(`manuscript_${id}.pdf`, id);
    }

    const inserted = getManuscript(id);
    if (!inserted) throw new Error('Inserted manuscript could not be read back');
    return inserted;
  });
}

export function updateManuscript(record: ManuscriptRecord, pdfData?: Buffer, coverData?: Buffer): ManuscriptRecord {
  database.prepare(`
    UPDATE manuscripts SET
      title = ?, author = ?, description = ?, category = ?, language = ?, year = ?,
      keywords = ?, page_count = ?, file_name = ?, mime_type = ?, cover_type = ?,
      pdf_data = COALESCE(?, pdf_data), cover_data = COALESCE(?, cover_data),
      status = ?, updated_at = ?
    WHERE id = ?
  `).run(
    record.title,
    record.author,
    record.description,
    record.category,
    record.language,
    record.year,
    record.keywords,
    Math.max(1, record.pageCount),
    record.fileName,
    record.mimeType,
    record.coverType || null,
    pdfData || null,
    coverData || null,
    record.status,
    record.updatedAt,
    record.id,
  );

  const updated = getManuscript(record.id);
  if (!updated) throw new Error('Updated manuscript could not be read back');
  return updated;
}

export function deleteManuscript(id: number): boolean {
  return Number(database.prepare('DELETE FROM manuscripts WHERE id = ?').run(id).changes) > 0;
}

const GALLERY_EVENT_COLUMNS = `
  id, title, description, event_date, event_year, status, created_at, updated_at
`;

const GALLERY_IMAGE_COLUMNS = `
  id, event_id, image_url, thumbnail_url, caption, alt_text, display_order,
  is_featured, is_active, width, height, created_at, updated_at
`;

const GALLERY_IMAGE_WITH_EVENT_COLUMNS = `
  i.id, i.event_id, i.image_url, i.thumbnail_url, i.caption, i.alt_text, i.display_order,
  i.is_featured, i.is_active, i.width, i.height, i.created_at, i.updated_at,
  e.title AS event_title, e.description AS event_description, e.event_date,
  e.event_year, e.status AS event_status, e.created_at AS event_created_at,
  e.updated_at AS event_updated_at
`;

function normalizeGalleryStatus(value: unknown): GalleryEventStatusValue {
  return value === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
}

function galleryEventFromRow(row: any): GalleryEventRecord {
  return {
    id: Number(row.id),
    title: String(row.title),
    description: String(row.description),
    eventDate: String(row.event_date),
    eventYear: Number(row.event_year),
    status: normalizeGalleryStatus(row.status),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function galleryImageFromRow(row: any): GalleryImageRecord {
  return {
    id: Number(row.id),
    eventId: Number(row.event_id),
    imageUrl: String(row.image_url),
    thumbnailUrl: String(row.thumbnail_url),
    caption: String(row.caption),
    altText: String(row.alt_text),
    displayOrder: Number(row.display_order),
    isFeatured: Boolean(row.is_featured),
    isActive: Boolean(row.is_active),
    width: row.width === null || row.width === undefined ? undefined : Number(row.width),
    height: row.height === null || row.height === undefined ? undefined : Number(row.height),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function galleryImageWithEventFromRow(row: any): GalleryImageWithEventRecord {
  return {
    ...galleryImageFromRow(row),
    eventTitle: String(row.event_title),
    eventDescription: String(row.event_description),
    eventDate: String(row.event_date),
    eventYear: Number(row.event_year),
    eventStatus: normalizeGalleryStatus(row.event_status),
    eventCreatedAt: String(row.event_created_at),
    eventUpdatedAt: String(row.event_updated_at),
  };
}

export function listGalleryEvents(includeInactive = false): GalleryEventRecord[] {
  const where = includeInactive ? '' : "WHERE status = 'ACTIVE'";
  const rows = database.prepare(`
    SELECT ${GALLERY_EVENT_COLUMNS}
    FROM gallery_events
    ${where}
    ORDER BY event_date DESC, id DESC
  `).all() as any[];
  return rows.map(galleryEventFromRow);
}

export function getGalleryEvent(id: number): GalleryEventRecord | undefined {
  const row = database.prepare(`
    SELECT ${GALLERY_EVENT_COLUMNS}
    FROM gallery_events
    WHERE id = ?
  `).get(id);
  return row ? galleryEventFromRow(row) : undefined;
}

export function insertGalleryEvent(record: GalleryEventWrite): GalleryEventRecord {
  const now = new Date().toISOString();
  const result = database.prepare(`
    INSERT INTO gallery_events (
      title, description, event_date, event_year, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    record.title,
    record.description,
    record.eventDate,
    record.eventYear,
    record.status,
    now,
    now,
  );

  const inserted = getGalleryEvent(Number(result.lastInsertRowid));
  if (!inserted) throw new Error('Inserted gallery event could not be read back');
  return inserted;
}

export function updateGalleryEvent(id: number, record: GalleryEventWrite): GalleryEventRecord | undefined {
  const result = database.prepare(`
    UPDATE gallery_events SET
      title = ?, description = ?, event_date = ?, event_year = ?, status = ?, updated_at = ?
    WHERE id = ?
  `).run(
    record.title,
    record.description,
    record.eventDate,
    record.eventYear,
    record.status,
    new Date().toISOString(),
    id,
  );
  return Number(result.changes) > 0 ? getGalleryEvent(id) : undefined;
}

export function deleteGalleryEvent(id: number): boolean {
  return Number(database.prepare('DELETE FROM gallery_events WHERE id = ?').run(id).changes) > 0;
}

export function listGalleryImagesForEvent(eventId: number, includeInactive = true): GalleryImageRecord[] {
  const activeCondition = includeInactive ? '' : 'AND is_active = 1';
  const rows = database.prepare(`
    SELECT ${GALLERY_IMAGE_COLUMNS}
    FROM gallery_images
    WHERE event_id = ? ${activeCondition}
    ORDER BY display_order ASC, id ASC
  `).all(eventId) as any[];
  return rows.map(galleryImageFromRow);
}

export function getGalleryImage(id: number): GalleryImageRecord | undefined {
  const row = database.prepare(`
    SELECT ${GALLERY_IMAGE_COLUMNS}
    FROM gallery_images
    WHERE id = ?
  `).get(id);
  return row ? galleryImageFromRow(row) : undefined;
}

export function getGalleryImageWithEvent(id: number): GalleryImageWithEventRecord | undefined {
  const row = database.prepare(`
    SELECT ${GALLERY_IMAGE_WITH_EVENT_COLUMNS}
    FROM gallery_images i
    INNER JOIN gallery_events e ON e.id = i.event_id
    WHERE i.id = ?
  `).get(id);
  return row ? galleryImageWithEventFromRow(row) : undefined;
}

export function insertGalleryImages(records: GalleryImageWrite[]): GalleryImageRecord[] {
  if (!records.length) return [];
  const insert = database.prepare(`
    INSERT INTO gallery_images (
      event_id, image_url, thumbnail_url, caption, alt_text, display_order,
      is_featured, is_active, width, height, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  return inTransaction(() => {
    const now = new Date().toISOString();
    const ids: number[] = [];
    for (const record of records) {
      const result = insert.run(
        record.eventId,
        record.imageUrl,
        record.thumbnailUrl,
        record.caption,
        record.altText,
        record.displayOrder,
        record.isFeatured ? 1 : 0,
        record.isActive ? 1 : 0,
        record.width || null,
        record.height || null,
        now,
        now,
      );
      ids.push(Number(result.lastInsertRowid));
    }

    return ids.map(id => {
      const image = getGalleryImage(id);
      if (!image) throw new Error('Inserted gallery image could not be read back');
      return image;
    });
  });
}

export function updateGalleryImageMetadata(
  id: number,
  changes: GalleryImageMetadataUpdate,
): GalleryImageRecord | undefined {
  const current = getGalleryImage(id);
  if (!current) return undefined;

  const isActive = changes.isActive ?? current.isActive;
  const isFeatured = isActive ? (changes.isFeatured ?? current.isFeatured) : false;
  database.prepare(`
    UPDATE gallery_images SET
      caption = ?, alt_text = ?, display_order = ?, is_featured = ?, is_active = ?, updated_at = ?
    WHERE id = ?
  `).run(
    changes.caption ?? current.caption,
    changes.altText ?? current.altText,
    changes.displayOrder ?? current.displayOrder,
    isFeatured ? 1 : 0,
    isActive ? 1 : 0,
    new Date().toISOString(),
    id,
  );
  return getGalleryImage(id);
}

export function replaceGalleryImageAsset(
  id: number,
  imageUrl: string,
  thumbnailUrl: string,
  width?: number,
  height?: number,
): GalleryImageRecord | undefined {
  const result = database.prepare(`
    UPDATE gallery_images SET
      image_url = ?, thumbnail_url = ?, width = ?, height = ?, updated_at = ?
    WHERE id = ?
  `).run(
    imageUrl,
    thumbnailUrl,
    width || null,
    height || null,
    new Date().toISOString(),
    id,
  );
  return Number(result.changes) > 0 ? getGalleryImage(id) : undefined;
}

export function reorderGalleryImages(eventId: number, imageIds: number[]): GalleryImageRecord[] {
  return inTransaction(() => {
    const existing = listGalleryImagesForEvent(eventId, true);
    const existingIds = existing.map(image => image.id);
    const uniqueIds = new Set(imageIds);
    if (
      imageIds.length !== existingIds.length ||
      uniqueIds.size !== imageIds.length ||
      existingIds.some(id => !uniqueIds.has(id))
    ) {
      throw new Error('Image order must contain every image in this event exactly once');
    }

    const update = database.prepare(`
      UPDATE gallery_images SET display_order = ?, updated_at = ?
      WHERE id = ? AND event_id = ?
    `);
    const now = new Date().toISOString();
    imageIds.forEach((id, index) => update.run(index + 1, now, id, eventId));
    return listGalleryImagesForEvent(eventId, true);
  });
}

export function deleteGalleryImage(id: number): boolean {
  return Number(database.prepare('DELETE FROM gallery_images WHERE id = ?').run(id).changes) > 0;
}

export function listAvailableGalleryYears(maxYear: number): number[] {
  const rows = database.prepare(`
    SELECT DISTINCT e.event_year
    FROM gallery_events e
    WHERE e.status = 'ACTIVE'
      AND e.event_year <= ?
      AND EXISTS (
        SELECT 1 FROM gallery_images i
        WHERE i.event_id = e.id AND i.is_active = 1
      )
    ORDER BY e.event_year DESC
  `).all(maxYear) as any[];
  return rows.map(row => Number(row.event_year));
}

export function countPublicGalleryImagesByYear(year: number): number {
  const row = database.prepare(`
    SELECT COUNT(*) AS count
    FROM gallery_images i
    INNER JOIN gallery_events e ON e.id = i.event_id
    WHERE e.event_year = ? AND e.status = 'ACTIVE' AND i.is_active = 1
  `).get(year) as any;
  return Number(row?.count || 0);
}

export function listPublicGalleryImagesByYear(
  year: number,
  limit: number,
  offset: number,
): GalleryImageWithEventRecord[] {
  const rows = database.prepare(`
    SELECT ${GALLERY_IMAGE_WITH_EVENT_COLUMNS}
    FROM gallery_images i
    INNER JOIN gallery_events e ON e.id = i.event_id
    WHERE e.event_year = ? AND e.status = 'ACTIVE' AND i.is_active = 1
    ORDER BY e.event_date DESC, e.id DESC, i.display_order ASC, i.id ASC
    LIMIT ? OFFSET ?
  `).all(year, limit, offset) as any[];
  return rows.map(galleryImageWithEventFromRow);
}

export function listCategories(): CategoryRecord[] {
  const rows = database.prepare(`
    SELECT c.id, c.name, c.description, COUNT(m.id) AS count
    FROM categories c
    LEFT JOIN manuscripts m ON m.category = c.name
    GROUP BY c.id, c.name, c.description
    ORDER BY c.name COLLATE NOCASE
  `).all() as any[];
  return rows.map(row => ({ id: String(row.id), name: String(row.name), description: String(row.description), count: Number(row.count) }));
}

export function createCategory(name: string, description = ''): CategoryRecord {
  const record = { id: randomUUID(), name, description };
  database.prepare('INSERT INTO categories (id, name, description) VALUES (?, ?, ?)').run(record.id, record.name, record.description);
  return { ...record, count: 0 };
}

export function deleteCategory(id: string): boolean {
  return Number(database.prepare('DELETE FROM categories WHERE id = ?').run(id).changes) > 0;
}

export function listLanguages(): LanguageRecord[] {
  const rows = database.prepare(`
    SELECT l.id, l.name, l.code, COUNT(m.id) AS count
    FROM languages l
    LEFT JOIN manuscripts m ON m.language = l.name
    GROUP BY l.id, l.name, l.code
    ORDER BY l.name COLLATE NOCASE
  `).all() as any[];
  return rows.map(row => ({ id: String(row.id), name: String(row.name), code: String(row.code), count: Number(row.count) }));
}

export function createLanguage(name: string, code = ''): LanguageRecord {
  const record = { id: randomUUID(), name, code: code || name.toLowerCase().slice(0, 3) };
  database.prepare('INSERT INTO languages (id, name, code) VALUES (?, ?, ?)').run(record.id, record.name, record.code);
  return { ...record, count: 0 };
}

export function deleteLanguage(id: string): boolean {
  return Number(database.prepare('DELETE FROM languages WHERE id = ?').run(id).changes) > 0;
}

export function findAdminByEmail(email: string): AdminRecord | undefined {
  const row = database.prepare(`
    SELECT id, email, name, role, password_hash
    FROM admin_users
    WHERE email = ? COLLATE NOCASE
  `).get(email.trim()) as any;

  if (!row) return undefined;
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    role: row.role === 'ADMIN' ? 'ADMIN' : 'SUPER_ADMIN',
    passwordHash: String(row.password_hash),
  };
}

export function getDatabaseStatus() {
  return {
    engine: 'sqlite',
    connected: database.isOpen,
  };
}
