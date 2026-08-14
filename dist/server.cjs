var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_crypto2 = require("crypto");
var import_vite = require("vite");
var import_pdf_lib = require("pdf-lib");
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var import_multer = __toESM(require("multer"), 1);
var import_sharp = __toESM(require("sharp"), 1);

// database.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_crypto = require("crypto");
var import_node_sqlite = require("node:sqlite");
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var DEFAULT_CATEGORIES = [
  { id: "1", name: "Medical & Ayurveda", description: "Classical medical treatises, herbalism, and surgical guides" },
  { id: "2", name: "Astronomy & Mathematics", description: "Planetary mechanics, geometry, and ancient calculation codices" },
  { id: "3", name: "Philosophy & Vedic Texts", description: "Metaphysical treatises, commentaries, and spiritual discourses" },
  { id: "4", name: "Literature & Poetry", description: "Epic narratives, classical drama, and poetic compositions" },
  { id: "5", name: "History & Chronicles", description: "Royal records, genealogical annals, and travelogues" },
  { id: "6", name: "Alchemy & Botany", description: "Metallurgical arts, plant classifications, and natural science" }
];
var DEFAULT_LANGUAGES = [
  { id: "1", name: "Sanskrit", code: "sa" },
  { id: "2", name: "Tamil", code: "ta" },
  { id: "3", name: "Persian", code: "fa" },
  { id: "4", name: "Pali", code: "pi" },
  { id: "5", name: "Tibetan", code: "bo" },
  { id: "6", name: "Latin", code: "la" },
  { id: "7", name: "Arabic", code: "ar" },
  { id: "8", name: "Old Javanese (Kawi)", code: "kaw" }
];
var DATA_DIR = process.env.DATA_DIR ? import_path.default.resolve(process.cwd(), process.env.DATA_DIR) : import_path.default.join(process.cwd(), ".data");
var configuredDatabasePath = process.env.DATABASE_PATH;
var DATABASE_PATH = configuredDatabasePath === ":memory:" ? configuredDatabasePath : configuredDatabasePath ? import_path.default.resolve(process.cwd(), configuredDatabasePath) : import_path.default.join(DATA_DIR, "archive.sqlite");
var LEGACY_MANUSCRIPTS_FILE = import_path.default.join(DATA_DIR, "manuscripts.json");
var LEGACY_CATEGORIES_FILE = import_path.default.join(DATA_DIR, "categories.json");
var LEGACY_LANGUAGES_FILE = import_path.default.join(DATA_DIR, "languages.json");
var LEGACY_PDF_DIR = import_path.default.join(DATA_DIR, "pdfs");
var LEGACY_COVER_DIR = import_path.default.join(DATA_DIR, "covers");
import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
if (DATABASE_PATH !== ":memory:") {
  import_fs.default.mkdirSync(import_path.default.dirname(DATABASE_PATH), { recursive: true });
}
var database = new import_node_sqlite.DatabaseSync(DATABASE_PATH);
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
function inTransaction(operation) {
  database.exec("BEGIN IMMEDIATE");
  try {
    const result = operation();
    database.exec("COMMIT");
    return result;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}
function readLegacyJson(filePath) {
  if (!import_fs.default.existsSync(filePath)) return void 0;
  try {
    return JSON.parse(import_fs.default.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Could not read legacy data from ${filePath}:`, error);
    return void 0;
  }
}
function normalizeStatus(value) {
  return value === "PUBLISHED" || value === "ARCHIVED" ? value : "DRAFT";
}
function seedLookupTablesFromLegacyFiles() {
  const legacyCategories = readLegacyJson(LEGACY_CATEGORIES_FILE);
  const categoryRecords = legacyCategories?.length ? legacyCategories : DEFAULT_CATEGORIES;
  const insertCategory = database.prepare("INSERT OR IGNORE INTO categories (id, name, description) VALUES (?, ?, ?)");
  inTransaction(() => {
    for (const category of categoryRecords) {
      insertCategory.run(String(category.id), category.name, category.description || "");
    }
  });
  const legacyLanguages = readLegacyJson(LEGACY_LANGUAGES_FILE);
  const languageRecords = legacyLanguages?.length ? legacyLanguages : DEFAULT_LANGUAGES;
  const insertLanguage = database.prepare("INSERT OR IGNORE INTO languages (id, name, code) VALUES (?, ?, ?)");
  inTransaction(() => {
    for (const language of languageRecords) {
      insertLanguage.run(String(language.id), language.name, language.code || language.name.toLowerCase().slice(0, 3));
    }
  });
}
function seedAdminAccount() {
  if (process.env.NODE_ENV === "production" && !process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD must be set before creating the production database");
  }
  const email = (process.env.ADMIN_EMAIL || "admin@preservation.org").trim().toLowerCase();
  const existing = database.prepare("SELECT id FROM admin_users WHERE email = ?").get(email);
  if (existing) return;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const passwordHash = import_bcryptjs.default.hashSync(process.env.ADMIN_PASSWORD || "admin123", 12);
  database.prepare(`
    INSERT INTO admin_users (id, email, name, role, password_hash, created_at, updated_at)
    VALUES (?, ?, ?, 'SUPER_ADMIN', ?, ?, ?)
  `).run("admin-1", email, process.env.ADMIN_NAME || "Senior Archival Administrator", passwordHash, now, now);
}
function migrateLegacyManuscripts() {
  const legacyRecords = readLegacyJson(LEGACY_MANUSCRIPTS_FILE);
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
      const pdfPath = import_path.default.join(LEGACY_PDF_DIR, import_path.default.basename(String(record.fileName || "")));
      const coverPath = import_path.default.join(LEGACY_COVER_DIR, `cover_${Number(record.id)}`);
      const pdfData = record.hasPdf !== false && import_fs.default.existsSync(pdfPath) ? import_fs.default.readFileSync(pdfPath) : null;
      const coverData = record.hasCover && import_fs.default.existsSync(coverPath) ? import_fs.default.readFileSync(coverPath) : null;
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const legacyYear = Number(record.year);
      const result = insert.run(
        Number(record.id),
        String(record.title || "Untitled Manuscript"),
        String(record.author || "Unknown Scribe"),
        String(record.description || ""),
        String(record.category || "General Archives"),
        String(record.language || "Sanskrit"),
        record.year !== null && record.year !== void 0 && Number.isFinite(legacyYear) ? legacyYear : 1e3,
        String(record.keywords || ""),
        Math.max(1, Number(record.pageCount) || 1),
        import_path.default.basename(String(record.fileName || `manuscript_${Number(record.id)}.pdf`)),
        String(record.mimeType || "application/pdf"),
        record.coverType ? String(record.coverType) : null,
        pdfData,
        coverData,
        normalizeStatus(record.status),
        String(record.createdAt || now),
        String(record.updatedAt || now)
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
function getMetadata(key) {
  const row = database.prepare("SELECT value FROM app_metadata WHERE key = ?").get(key);
  return row ? String(row.value) : void 0;
}
function setMetadata(key, value) {
  database.prepare(`
    INSERT INTO app_metadata (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}
var LEGACY_IMPORT_KEY = "legacy_import_v1_complete";
var INITIAL_MANUSCRIPTS_KEY = "initial_manuscripts_v1_complete";
var PDF_PAGE_COUNTS_KEY = "pdf_page_counts_v1_complete";
if (getMetadata(LEGACY_IMPORT_KEY) !== "1") {
  seedLookupTablesFromLegacyFiles();
  migrateLegacyManuscripts();
  setMetadata(LEGACY_IMPORT_KEY, "1");
  if (countManuscripts() > 0) setMetadata(INITIAL_MANUSCRIPTS_KEY, "1");
}
seedAdminAccount();
var MANUSCRIPT_COLUMNS = `
  id, title, author, description, category, language, year, keywords, page_count,
  file_name, mime_type, cover_type,
  CASE WHEN pdf_data IS NULL THEN 0 ELSE 1 END AS has_pdf,
  CASE WHEN cover_data IS NULL THEN 0 ELSE 1 END AS has_cover,
  status, created_at, updated_at
`;
function manuscriptFromRow(row) {
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
    coverType: row.cover_type ? String(row.cover_type) : void 0,
    hasPdf: Boolean(row.has_pdf),
    hasCover: Boolean(row.has_cover),
    status: normalizeStatus(row.status),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}
function escapeLike(value) {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}
function countManuscripts() {
  return Number(database.prepare("SELECT COUNT(*) AS count FROM manuscripts").get().count);
}
function shouldSeedInitialManuscripts() {
  return getMetadata(INITIAL_MANUSCRIPTS_KEY) !== "1";
}
function shouldSyncPdfPageCounts() {
  return getMetadata(PDF_PAGE_COUNTS_KEY) !== "1";
}
function markPdfPageCountsSynced() {
  setMetadata(PDF_PAGE_COUNTS_KEY, "1");
}
function insertInitialManuscripts(entries) {
  const insert = database.prepare(`
    INSERT OR IGNORE INTO manuscripts (
      id, title, author, description, category, language, year, keywords, page_count,
      file_name, mime_type, cover_type, pdf_data, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  inTransaction(() => {
    for (const { record, pdfData } of entries) {
      const createdAt = record.createdAt || (/* @__PURE__ */ new Date()).toISOString();
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
        record.updatedAt || createdAt
      );
    }
    setMetadata(INITIAL_MANUSCRIPTS_KEY, "1");
  });
}
function listManuscripts(filters = {}) {
  const conditions = [];
  const values = [];
  if (!filters.includeUnpublished) {
    conditions.push("status = ?");
    values.push("PUBLISHED");
  } else if (filters.status && filters.status !== "ALL") {
    conditions.push("status = ?");
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
  if (filters.category && filters.category !== "ALL") {
    conditions.push("category = ?");
    values.push(filters.category);
  }
  if (filters.language && filters.language !== "ALL") {
    conditions.push("language = ?");
    values.push(filters.language);
  }
  if (filters.yearFrom !== void 0 && Number.isFinite(filters.yearFrom)) {
    conditions.push("year >= ?");
    values.push(filters.yearFrom);
  }
  if (filters.yearTo !== void 0 && Number.isFinite(filters.yearTo)) {
    conditions.push("year <= ?");
    values.push(filters.yearTo);
  }
  const orderBy = filters.sortBy === "year_asc" ? "year ASC" : filters.sortBy === "year_desc" ? "year DESC" : filters.sortBy === "title_asc" ? "title COLLATE NOCASE ASC" : "created_at DESC";
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = database.prepare(`SELECT ${MANUSCRIPT_COLUMNS} FROM manuscripts ${where} ORDER BY ${orderBy}`).all(...values);
  return rows.map(manuscriptFromRow);
}
function getManuscript(id) {
  const row = database.prepare(`SELECT ${MANUSCRIPT_COLUMNS} FROM manuscripts WHERE id = ?`).get(id);
  return row ? manuscriptFromRow(row) : void 0;
}
function getManuscriptPdf(id) {
  const row = database.prepare("SELECT pdf_data, file_name, mime_type FROM manuscripts WHERE id = ?").get(id);
  if (!row?.pdf_data) return void 0;
  return { data: Buffer.from(row.pdf_data), fileName: String(row.file_name), mimeType: String(row.mime_type) };
}
function getManuscriptCover(id) {
  const row = database.prepare("SELECT cover_data, cover_type FROM manuscripts WHERE id = ?").get(id);
  if (!row?.cover_data) return void 0;
  return { data: Buffer.from(row.cover_data), coverType: String(row.cover_type || "image/jpeg") };
}
function insertManuscript(record, pdfData, coverData) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const createdAt = record.createdAt || now;
  const updatedAt = record.updatedAt || createdAt;
  return inTransaction(() => {
    const columns = record.id ? "id, " : "";
    const placeholders = record.id ? "?, " : "";
    const values = record.id ? [record.id] : [];
    values.push(
      record.title,
      record.author,
      record.description,
      record.category,
      record.language,
      record.year,
      record.keywords,
      Math.max(1, record.pageCount),
      record.fileName || "",
      record.mimeType,
      record.coverType || null,
      pdfData || null,
      coverData || null,
      record.status,
      createdAt,
      updatedAt
    );
    const result = database.prepare(`
      INSERT INTO manuscripts (
        ${columns}title, author, description, category, language, year, keywords, page_count,
        file_name, mime_type, cover_type, pdf_data, cover_data, status, created_at, updated_at
      ) VALUES (${placeholders}?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(...values);
    const id = record.id || Number(result.lastInsertRowid);
    if (!record.fileName) {
      database.prepare("UPDATE manuscripts SET file_name = ? WHERE id = ?").run(`manuscript_${id}.pdf`, id);
    }
    const inserted = getManuscript(id);
    if (!inserted) throw new Error("Inserted manuscript could not be read back");
    return inserted;
  });
}
function updateManuscript(record, pdfData, coverData) {
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
    record.id
  );
  const updated = getManuscript(record.id);
  if (!updated) throw new Error("Updated manuscript could not be read back");
  return updated;
}
function deleteManuscript(id) {
  return Number(database.prepare("DELETE FROM manuscripts WHERE id = ?").run(id).changes) > 0;
}
var GALLERY_EVENT_COLUMNS = `
  id, title, description, event_date, event_year, status, created_at, updated_at
`;
var GALLERY_IMAGE_COLUMNS = `
  id, event_id, image_url, thumbnail_url, caption, alt_text, display_order,
  is_featured, is_active, width, height, created_at, updated_at
`;
var GALLERY_IMAGE_WITH_EVENT_COLUMNS = `
  i.id, i.event_id, i.image_url, i.thumbnail_url, i.caption, i.alt_text, i.display_order,
  i.is_featured, i.is_active, i.width, i.height, i.created_at, i.updated_at,
  e.title AS event_title, e.description AS event_description, e.event_date,
  e.event_year, e.status AS event_status, e.created_at AS event_created_at,
  e.updated_at AS event_updated_at
`;
function normalizeGalleryStatus(value) {
  return value === "ACTIVE" ? "ACTIVE" : "INACTIVE";
}
function galleryEventFromRow(row) {
  return {
    id: Number(row.id),
    title: String(row.title),
    description: String(row.description),
    eventDate: String(row.event_date),
    eventYear: Number(row.event_year),
    status: normalizeGalleryStatus(row.status),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}
function galleryImageFromRow(row) {
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
    width: row.width === null || row.width === void 0 ? void 0 : Number(row.width),
    height: row.height === null || row.height === void 0 ? void 0 : Number(row.height),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}
function galleryImageWithEventFromRow(row) {
  return {
    ...galleryImageFromRow(row),
    eventTitle: String(row.event_title),
    eventDescription: String(row.event_description),
    eventDate: String(row.event_date),
    eventYear: Number(row.event_year),
    eventStatus: normalizeGalleryStatus(row.event_status),
    eventCreatedAt: String(row.event_created_at),
    eventUpdatedAt: String(row.event_updated_at)
  };
}
function listGalleryEvents(includeInactive = false) {
  const where = includeInactive ? "" : "WHERE status = 'ACTIVE'";
  const rows = database.prepare(`
    SELECT ${GALLERY_EVENT_COLUMNS}
    FROM gallery_events
    ${where}
    ORDER BY event_date DESC, id DESC
  `).all();
  return rows.map(galleryEventFromRow);
}
function getGalleryEvent(id) {
  const row = database.prepare(`
    SELECT ${GALLERY_EVENT_COLUMNS}
    FROM gallery_events
    WHERE id = ?
  `).get(id);
  return row ? galleryEventFromRow(row) : void 0;
}
function insertGalleryEvent(record) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
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
    now
  );
  const inserted = getGalleryEvent(Number(result.lastInsertRowid));
  if (!inserted) throw new Error("Inserted gallery event could not be read back");
  return inserted;
}
function updateGalleryEvent(id, record) {
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
    (/* @__PURE__ */ new Date()).toISOString(),
    id
  );
  return Number(result.changes) > 0 ? getGalleryEvent(id) : void 0;
}
function deleteGalleryEvent(id) {
  return Number(database.prepare("DELETE FROM gallery_events WHERE id = ?").run(id).changes) > 0;
}
function listGalleryImagesForEvent(eventId, includeInactive = true) {
  const activeCondition = includeInactive ? "" : "AND is_active = 1";
  const rows = database.prepare(`
    SELECT ${GALLERY_IMAGE_COLUMNS}
    FROM gallery_images
    WHERE event_id = ? ${activeCondition}
    ORDER BY display_order ASC, id ASC
  `).all(eventId);
  return rows.map(galleryImageFromRow);
}
function getGalleryImage(id) {
  const row = database.prepare(`
    SELECT ${GALLERY_IMAGE_COLUMNS}
    FROM gallery_images
    WHERE id = ?
  `).get(id);
  return row ? galleryImageFromRow(row) : void 0;
}
function getGalleryImageWithEvent(id) {
  const row = database.prepare(`
    SELECT ${GALLERY_IMAGE_WITH_EVENT_COLUMNS}
    FROM gallery_images i
    INNER JOIN gallery_events e ON e.id = i.event_id
    WHERE i.id = ?
  `).get(id);
  return row ? galleryImageWithEventFromRow(row) : void 0;
}
function insertGalleryImages(records) {
  if (!records.length) return [];
  const insert = database.prepare(`
    INSERT INTO gallery_images (
      event_id, image_url, thumbnail_url, caption, alt_text, display_order,
      is_featured, is_active, width, height, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return inTransaction(() => {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const ids = [];
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
        now
      );
      ids.push(Number(result.lastInsertRowid));
    }
    return ids.map((id) => {
      const image = getGalleryImage(id);
      if (!image) throw new Error("Inserted gallery image could not be read back");
      return image;
    });
  });
}
function updateGalleryImageMetadata(id, changes) {
  const current = getGalleryImage(id);
  if (!current) return void 0;
  const isActive = changes.isActive ?? current.isActive;
  const isFeatured = isActive ? changes.isFeatured ?? current.isFeatured : false;
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
    (/* @__PURE__ */ new Date()).toISOString(),
    id
  );
  return getGalleryImage(id);
}
function replaceGalleryImageAsset(id, imageUrl, thumbnailUrl, width, height) {
  const result = database.prepare(`
    UPDATE gallery_images SET
      image_url = ?, thumbnail_url = ?, width = ?, height = ?, updated_at = ?
    WHERE id = ?
  `).run(
    imageUrl,
    thumbnailUrl,
    width || null,
    height || null,
    (/* @__PURE__ */ new Date()).toISOString(),
    id
  );
  return Number(result.changes) > 0 ? getGalleryImage(id) : void 0;
}
function reorderGalleryImages(eventId, imageIds) {
  return inTransaction(() => {
    const existing = listGalleryImagesForEvent(eventId, true);
    const existingIds = existing.map((image) => image.id);
    const uniqueIds = new Set(imageIds);
    if (imageIds.length !== existingIds.length || uniqueIds.size !== imageIds.length || existingIds.some((id) => !uniqueIds.has(id))) {
      throw new Error("Image order must contain every image in this event exactly once");
    }
    const update = database.prepare(`
      UPDATE gallery_images SET display_order = ?, updated_at = ?
      WHERE id = ? AND event_id = ?
    `);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    imageIds.forEach((id, index) => update.run(index + 1, now, id, eventId));
    return listGalleryImagesForEvent(eventId, true);
  });
}
function deleteGalleryImage(id) {
  return Number(database.prepare("DELETE FROM gallery_images WHERE id = ?").run(id).changes) > 0;
}
function listAvailableGalleryYears(maxYear) {
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
  `).all(maxYear);
  return rows.map((row) => Number(row.event_year));
}
function countPublicGalleryImagesByYear(year) {
  const row = database.prepare(`
    SELECT COUNT(*) AS count
    FROM gallery_images i
    INNER JOIN gallery_events e ON e.id = i.event_id
    WHERE e.event_year = ? AND e.status = 'ACTIVE' AND i.is_active = 1
  `).get(year);
  return Number(row?.count || 0);
}
function listPublicGalleryImagesByYear(year, limit, offset) {
  const rows = database.prepare(`
    SELECT ${GALLERY_IMAGE_WITH_EVENT_COLUMNS}
    FROM gallery_images i
    INNER JOIN gallery_events e ON e.id = i.event_id
    WHERE e.event_year = ? AND e.status = 'ACTIVE' AND i.is_active = 1
    ORDER BY e.event_date DESC, e.id DESC, i.display_order ASC, i.id ASC
    LIMIT ? OFFSET ?
  `).all(year, limit, offset);
  return rows.map(galleryImageWithEventFromRow);
}
function listCategories() {
  const rows = database.prepare(`
    SELECT c.id, c.name, c.description, COUNT(m.id) AS count
    FROM categories c
    LEFT JOIN manuscripts m ON m.category = c.name
    GROUP BY c.id, c.name, c.description
    ORDER BY c.name COLLATE NOCASE
  `).all();
  return rows.map((row) => ({ id: String(row.id), name: String(row.name), description: String(row.description), count: Number(row.count) }));
}
function createCategory(name, description = "") {
  const record = { id: (0, import_crypto.randomUUID)(), name, description };
  database.prepare("INSERT INTO categories (id, name, description) VALUES (?, ?, ?)").run(record.id, record.name, record.description);
  return { ...record, count: 0 };
}
function deleteCategory(id) {
  return Number(database.prepare("DELETE FROM categories WHERE id = ?").run(id).changes) > 0;
}
function listLanguages() {
  const rows = database.prepare(`
    SELECT l.id, l.name, l.code, COUNT(m.id) AS count
    FROM languages l
    LEFT JOIN manuscripts m ON m.language = l.name
    GROUP BY l.id, l.name, l.code
    ORDER BY l.name COLLATE NOCASE
  `).all();
  return rows.map((row) => ({ id: String(row.id), name: String(row.name), code: String(row.code), count: Number(row.count) }));
}
function createLanguage(name, code = "") {
  const record = { id: (0, import_crypto.randomUUID)(), name, code: code || name.toLowerCase().slice(0, 3) };
  database.prepare("INSERT INTO languages (id, name, code) VALUES (?, ?, ?)").run(record.id, record.name, record.code);
  return { ...record, count: 0 };
}
function deleteLanguage(id) {
  return Number(database.prepare("DELETE FROM languages WHERE id = ?").run(id).changes) > 0;
}
function findAdminByEmail(email) {
  const row = database.prepare(`
    SELECT id, email, name, role, password_hash
    FROM admin_users
    WHERE email = ? COLLATE NOCASE
  `).get(email.trim());
  if (!row) return void 0;
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    role: row.role === "ADMIN" ? "ADMIN" : "SUPER_ADMIN",
    passwordHash: String(row.password_hash)
  };
}
function getDatabaseStatus() {
  return {
    engine: "sqlite",
    connected: database.isOpen
  };
}

// server.ts
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in production");
}
var JWT_SECRET = process.env.JWT_SECRET || "archivalia_manuscript_preservation_secret_key_2026";
var PORT = Number(process.env.PORT) || 3e3;
var ADMIN_COOKIE_NAME = "archivalia_admin_session";
var ManuscriptStatus = /* @__PURE__ */ ((ManuscriptStatus2) => {
  ManuscriptStatus2["DRAFT"] = "DRAFT";
  ManuscriptStatus2["PUBLISHED"] = "PUBLISHED";
  ManuscriptStatus2["ARCHIVED"] = "ARCHIVED";
  return ManuscriptStatus2;
})(ManuscriptStatus || {});
function sanitizeForWinAnsi(text) {
  if (!text) return "";
  return text.replace(/√/g, "sqrt").replace(/≈/g, "~=").replace(/≠/g, "!=").replace(/≤/g, "<=").replace(/≥/g, ">=").replace(/±/g, "+/-").replace(/°/g, " deg ").replace(/¹/g, "^1").replace(/²/g, "^2").replace(/³/g, "^3").replace(/—/g, "-").replace(/–/g, "-").replace(/“/g, '"').replace(/”/g, '"').replace(/‘/g, "'").replace(/’/g, "'").replace(/…/g, "...").replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
}
function safeDrawText(page, text, options) {
  const clean = sanitizeForWinAnsi(text);
  if (!clean) return;
  try {
    page.drawText(clean, options);
  } catch (err) {
    const ascii = clean.replace(/[^\x20-\x7E]/g, "");
    if (ascii) {
      page.drawText(ascii, options);
    }
  }
}
async function createSamplePdf(title, author, year, language, contentPages) {
  const pdfDoc = await import_pdf_lib.PDFDocument.create();
  const timesFont = await pdfDoc.embedFont(import_pdf_lib.StandardFonts.TimesRomanBold);
  const timesItalic = await pdfDoc.embedFont(import_pdf_lib.StandardFonts.TimesRomanItalic);
  const regularFont = await pdfDoc.embedFont(import_pdf_lib.StandardFonts.TimesRoman);
  const coverPage = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = coverPage.getSize();
  coverPage.drawRectangle({
    x: 25,
    y: 25,
    width: width - 50,
    height: height - 50,
    borderColor: (0, import_pdf_lib.rgb)(0.4, 0.25, 0.1),
    borderWidth: 2.5
  });
  coverPage.drawRectangle({
    x: 32,
    y: 32,
    width: width - 64,
    height: height - 64,
    borderColor: (0, import_pdf_lib.rgb)(0.65, 0.45, 0.2),
    borderWidth: 1
  });
  coverPage.drawRectangle({
    x: 35,
    y: 35,
    width: width - 70,
    height: height - 70,
    color: (0, import_pdf_lib.rgb)(0.98, 0.96, 0.91)
  });
  safeDrawText(coverPage, "DIGITAL MANUSCRIPT PRESERVATION", {
    x: 120,
    y: height - 100,
    size: 13,
    font: timesItalic,
    color: (0, import_pdf_lib.rgb)(0.4, 0.25, 0.1)
  });
  safeDrawText(coverPage, title, {
    x: 60,
    y: height - 220,
    size: 24,
    font: timesFont,
    color: (0, import_pdf_lib.rgb)(0.2, 0.1, 0.05),
    maxWidth: width - 120,
    lineHeight: 30
  });
  safeDrawText(coverPage, `Attributed Author / Scribe: ${author}`, {
    x: 60,
    y: height - 320,
    size: 14,
    font: timesItalic,
    color: (0, import_pdf_lib.rgb)(0.3, 0.2, 0.1)
  });
  safeDrawText(coverPage, `Language: ${language}  |  Estimated Period: ${year < 0 ? Math.abs(year) + " BCE" : year + " CE"}`, {
    x: 60,
    y: height - 350,
    size: 12,
    font: regularFont,
    color: (0, import_pdf_lib.rgb)(0.4, 0.3, 0.2)
  });
  coverPage.drawLine({
    start: { x: 60, y: height - 390 },
    end: { x: width - 60, y: height - 390 },
    thickness: 1,
    color: (0, import_pdf_lib.rgb)(0.5, 0.3, 0.15)
  });
  safeDrawText(coverPage, "ARCHIVAL COLLECTION OF RARE MANUSCRIPTS", {
    x: 125,
    y: 100,
    size: 11,
    font: timesFont,
    color: (0, import_pdf_lib.rgb)(0.4, 0.25, 0.1)
  });
  for (let i = 0; i < contentPages.length; i++) {
    const page = pdfDoc.addPage([595.28, 841.89]);
    page.drawRectangle({
      x: 35,
      y: 35,
      width: width - 70,
      height: height - 70,
      color: (0, import_pdf_lib.rgb)(0.99, 0.98, 0.95)
    });
    page.drawRectangle({
      x: 30,
      y: 30,
      width: width - 60,
      height: height - 60,
      borderColor: (0, import_pdf_lib.rgb)(0.7, 0.55, 0.35),
      borderWidth: 1
    });
    safeDrawText(page, `${title} - Folio ${i + 1}`, {
      x: 50,
      y: height - 60,
      size: 10,
      font: timesItalic,
      color: (0, import_pdf_lib.rgb)(0.5, 0.35, 0.2)
    });
    page.drawLine({
      start: { x: 50, y: height - 70 },
      end: { x: width - 50, y: height - 70 },
      thickness: 0.8,
      color: (0, import_pdf_lib.rgb)(0.7, 0.55, 0.35)
    });
    const lines = contentPages[i].split("\n");
    let currentY = height - 100;
    for (const line of lines) {
      if (line.startsWith("CHAPTER") || line.startsWith("FOLIO") || line.startsWith("SECTION")) {
        currentY -= 10;
        safeDrawText(page, line, {
          x: 50,
          y: currentY,
          size: 14,
          font: timesFont,
          color: (0, import_pdf_lib.rgb)(0.3, 0.15, 0.05)
        });
        currentY -= 22;
      } else if (line.trim() !== "") {
        safeDrawText(page, line, {
          x: 50,
          y: currentY,
          size: 11,
          font: regularFont,
          color: (0, import_pdf_lib.rgb)(0.15, 0.1, 0.05),
          maxWidth: width - 100,
          lineHeight: 16
        });
        currentY -= 18;
      } else {
        currentY -= 10;
      }
      if (currentY < 80) break;
    }
    safeDrawText(page, `- ${i + 1} -`, {
      x: width / 2 - 10,
      y: 50,
      size: 10,
      font: regularFont,
      color: (0, import_pdf_lib.rgb)(0.5, 0.35, 0.2)
    });
  }
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
async function seedInitialManuscripts() {
  if (!shouldSeedInitialManuscripts()) return;
  console.log("Seeding initial rare manuscript collection with generated PDF binaries...");
  const seeds = [
    {
      id: 1,
      title: "Sushruta Samhita: Ancient Treatise on Surgery & Anatomy",
      author: "Maharshi Sushruta",
      description: "One of the foundational texts of Ayurveda detailing over 300 surgical procedures, 120 surgical instruments, rhinoplasty, ophthalmic surgery, and anatomical preservation techniques written in classical Sanskrit.",
      category: "Medical & Ayurveda",
      language: "Sanskrit",
      year: 600,
      // 600 BCE
      keywords: "Ayurveda, Surgery, Medicine, Anatomy, Rhinoplasty, Ancient India",
      pageCount: 4,
      status: "PUBLISHED" /* PUBLISHED */,
      content: [
        `CHAPTER I: ON THE ORIGIN OF SURGICAL KNOWLEDGE (SUTRASTHANA)
Om Namo Dhanvantaraye. Thus was spoken by Maharshi Sushruta:
Surgical procedures are considered paramount among the eight branches of medical lore because of their immediate efficacy, precision, and application in physical trauma.

FOLIO 1: THE INSTRUMENTS OF THE SURGEON (YANTRA & SHASTRA)
The instruments prescribed by the masters of medicine are twenty-four varieties of sharp instruments (Shastra) and one hundred and one blunt instruments (Yantra).
These instruments must be forged from high-grade iron, tempered with decoctions of plant ash, and maintained with razor sharpness suited to split a human hair longitudinally.

SECTION II: ANATOMICAL DISSECTION AND PRESERVATION
To understand the inner channels (Srotas) and vital nodes (Marma), the deceased body shall be wrapped in sacred grass, placed in a slow-flowing river inside a shaded cage for seven nights, and dissected layer by layer using soft brushes of bamboo bark.`,
        `CHAPTER II: THE EIGHT SURGICAL PROCEDURES (ASHTA-VIDHA SHASTRA-KARMA)
The eight fundamental operative actions are:
1. Chedana (Excision) - Removal of diseased tissue or growths.
2. Bhedana (Incision) - Opening of abscesses and deep-seated swellings.
3. Lekhana (Scraping) - Cleansing of slough and necrotic margins.
4. Vedhana (Puncturing) - Paracentesis of fluid collections in chest or abdomen.
5. Eshana (Probing) - Tracing sinus tracts and fistula trajectories.
6. Aharya (Extraction) - Removal of foreign bodies, teeth, or urinary calculi.
7. Visravana (Fluid Drainage) - Therapeutic bloodletting and pus evacuation.
8. Seevana (Suturing) - Closure of incised wounds using threads of silk, hemp, or ant jaws.`,
        `CHAPTER III: RHINOPLASTY & RECONSTRUCTIVE SURGERY (NASASANDHANA)
When the nose of a person has been severed or damaged by injury:
First, measure the exact dimension of the severed nose with a leaf.
Cut a patch of skin from the patient's cheek corresponding precisely to the leaf measure, keeping it attached by a small pedicle of flesh to preserve blood flow.

Scarify the stub of the severed nose with a sharp lancet.
Promptly fold the living skin flap over the wound, suture it neatly with fine silk thread, and insert two hollow reeds into the nostrils to ensure uninterrupted breathing.
Dust the skin graft with crushed red sandalwood, liquorice, and pure turmeric powder. Apply clean sesame oil and bandage with cotton gauze.`,
        `CHAPTER IV: HERBAL PHARMACOPOEIA AND HEALING BALMS
Post-operative management demands pure cleanliness and botanical wound ointments:
- Jatyadi Ghrita: Clarified butter infused with jasmine leaves, neem, turmeric, and copper bhasma for rapid wound granulation.
- Triphala Decoction: Cold infusion of Haritaki, Bibhitaki, and Amalaki used for daily antiseptic wound irrigation.
- Triphala Guggulu: Systemic anti-inflammatory pills administered morning and evening with warm milk.

May all living beings be free from physical suffering and attain long life through the sacred science of Sushruta.`
      ]
    },
    {
      id: 2,
      title: "Surya Siddhanta: Astronomical Treatise on Celestial Mechanics",
      author: "Varahamihira (Commentator) / Ancient Astronomical Guild",
      description: "A monument of Indian mathematical astronomy describing planetary orbits, solar and lunar eclipse calculations, precession of equinoxes, and sine tables.",
      category: "Astronomy & Mathematics",
      language: "Sanskrit",
      year: 500,
      // 500 CE
      keywords: "Astronomy, Trigonometry, Eclipse, Sine Tables, Planetary Orbits, Cosmos",
      pageCount: 3,
      status: "PUBLISHED" /* PUBLISHED */,
      content: [
        `CHAPTER I: THE MEASURE OF TIME AND CELESTIAL YUGAS
In the vast cosmic wheel (Kalachakra), time is divided into subtle and gross units:
- 1 Prana = Time duration of one breath (4 solar seconds).
- 6 Pranas = 1 Vinadi (24 seconds).
- 60 Vinadis = 1 Nadi or Ghatika (24 minutes).
- 60 Nadis = 1 Sidereal Day and Night (60 Ghatis = 24 Hours).

FOLIO 1: THE GREAT REVOLUTION OF PLANETS (MAHAYUGA)
In one Mahayuga of 4,320,000 solar years:
- The Sun completes 4,320,000 sidereal revolutions around the Zodiac.
- The Moon completes 57,753,336 revolutions.
- Mars completes 2,296,832 revolutions.
- Mercury completes 17,937,060 heliocentric cycles.
- Jupiter completes 364,220 revolutions.
- Saturn completes 146,568 revolutions.`,
        `CHAPTER II: SINE TABLES & TRIGONOMETRIC RADIUS (JYA & KOTI-JYA)
For precise planetary positioning, the quadrant of a circle (90 degrees or 5400 minutes of arc) is divided into 24 equal steps of 225 minutes of arc.

SINE VALUES (JYA) FOR CIRCLE RADIUS (R = 3438 minutes):
1. Jya(3\xB045') = 225 minutes of arc
2. Jya(7\xB030') = 449 minutes of arc
3. Jya(11\xB015') = 671 minutes of arc
4. Jya(15\xB000') = 890 minutes of arc
5. Jya(30\xB000') = 1719 minutes (Half Radius)
6. Jya(45\xB000') = 2431 minutes
7. Jya(90\xB000') = 3438 minutes (Full Radius)

Using these sine differences (Jya-Sutra), the exact apparent velocity and retrogradation (Vakra) of Mars, Jupiter, and Saturn are derived for any given night.`,
        `CHAPTER III: CALCULATING SOLAR AND LUNAR ECLIPSES
An eclipse occurs when the Moon enters the dark cone of Earth's shadow (Bha-chhaya) or when the Moon passes directly between Earth and the Sun's disk.

CALCULATION OF ECLIPSE DURATION (STHITI):
Subtract the true latitude of the Moon (Vikshepa) from the sum of the radii of the Sun and Moon disks.
Multiply by 60 and divide by the difference in daily motion between Sun and Moon.
The resulting Ghatikas give the exact moment of shadow contact (Grasa) and mid-eclipse (Madhya-grahana).`
      ]
    },
    {
      id: 3,
      title: "Tirukkural: Classical Tamil Codex on Ethics & Governance",
      author: "Thiruvalluvar",
      description: "A masterpiece of Tamil literature comprising 1,330 couplets (Kurals) divided into Virtue (Aram), Wealth/Statecraft (Porul), and Love (Inbam). Preserved on palm leaf manuscripts.",
      category: "Literature & Poetry",
      language: "Tamil",
      year: 100,
      // 100 CE
      keywords: "Tamil, Ethics, Thiruvalluvar, Governance, Philosophy, Virtue, Palm Leaf",
      pageCount: 3,
      status: "PUBLISHED" /* PUBLISHED */,
      content: [
        `BOOK I: ON VIRTUE AND MORAL RIGHTEOUSNESS (ARATHUPPAL)

KURAL 1: PRAISE OF THE SUPREME INTELLECT
Agara mudala ezhuthellaam aadhi
Bhagavan mudhatre ulagu.
(As the letter 'A' is the origin and first of all letters in speech, so the Primordial Being is the origin of the universe.)

KURAL 31: THE MAJESTY OF VIRTUE
Sirappeenum selvamum eenum araminnung
Oongu aakkam evano uyirku.
(Righteous virtue yields both worldly honor and inner wealth; what greater gain can a human soul acquire?)

FOLIO 2: TRUTH AND HYPOCRISY
Kural 291: Speak no words that carry deceit or malice; true speech is that which harbors no trace of harm to any living creature.`,
        `BOOK II: ON GOVERNANCE, ECONOMY, AND CITIZENSHIP (PORUTPAL)

KURAL 381: THE QUALITIES OF A NOBLE LEADER
Padai kudi koozh amaichu natpu aran aarum
Udayan arasarul eru.
(He is a lion among rulers who possesses these six elements in abundance: a disciplined defense, industrious citizenry, bountiful food supplies, wise ministers, loyal allies, and strong fortresses.)

KURAL 391: ON LEARNING AND EDUCATION
Karka kasadara karpavai katrapin
Nirka adharku thaga.
(Learn thoroughly whatever you choose to learn; once learned, let your conduct strictly reflect that wisdom.)

FOLIO 3: THE DIGNITY OF AGRICULTURE
Kural 1031: Agriculture is the pivot of the world; though farmers labor endlessly, all other professions depend upon their harvest for sustenance.`,
        `EPILOGUE ON MANUSCRIPT PRESERVATION
Written upon seasoned palmyra palm leaves (Oolai Chuvadi) using a iron stylus (Ezhuthaani) and blackened with lampblack and lemongrass oil to preserve against moisture and insects.

Preserved in temple libraries and guild archives across Tamilakam for over two millennia.`
      ]
    },
    {
      id: 4,
      title: "Shahnameh: The Persian Book of Kings (Illustrated Epic)",
      author: "Firdowsi Tusi",
      description: "An epic poem of 50,000 couplets chronicling the mythical, heroic, and historical past of the Persian Empire from creation until the 7th century.",
      category: "History & Chronicles",
      language: "Persian",
      year: 1010,
      // 1010 CE
      keywords: "Persian, Shahnameh, Epic, Firdowsi, Rostam, Kings, Calligraphy",
      pageCount: 3,
      status: "PUBLISHED" /* PUBLISHED */,
      content: [
        `CHAPTER I: PRELUDE AND INVOCATION TO REASON (IN THE NAME OF GOD)
Bename khodavande jan o fard,
Padidavare mah o mehro separd.
(In the name of the Lord of Life and Wisdom, Creator of the Moon, the Sun, and the revolving Heavens.)

FOLIO 1: THE PRAISE OF WISDOM (KHIRAD)
Wisdom is the brightest gift endowed upon mankind.
He who possesses wisdom guards his honor, protects the vulnerable, and turns away from temporal vanity.

SECTION II: THE REIGN OF KING JAMSHID
During the glorious reign of Jamshid, weapons of iron were forged, garments of silk were woven, and medicine flourished throughout Persia.
The festival of Nowruz (Spring Equinox) was established as a eternal tribute to renewal and peace.`,
        `CHAPTER II: THE HEROIC DEEDS OF ROSTAM & SIMURGH
When Zal was born with white hair, he was raised by the mythical bird Simurgh upon Mount Alborz.
Simurgh bestowed upon Zal a feather of magic: "When danger threatens your household, burn this feather, and I shall fly across the sky to aid you."

FOLIO 2: THE SEVEN LABORS OF ROSTAM (HAFT KHAN)
To rescue King Kay Kavus, Rostam mounted his mighty steed Rakhsh and endured seven formidable trials:
1. Slaying the fierce lion in the desert night.
2. Crossing the waterless arid expanse.
3. Defeating the venomous dragon of the mountains.
4. Overcoming the enchantress of darkness.
5. Capturing the giant champion Olad.
6. Battle with the White Demon (Div-e Sepid) in the cavern of Mazandaran.`,
        `CHAPTER III: FIRDOWSI'S DEDICATION TO PRESERVING LANGUAGE
I have labored thirty years in hardship and toil,
Reviving the Persian spirit and language with my pen.
A monument of poetry I have erected that shall not decay,
Neither by winter wind nor centuries of rain.`
      ]
    },
    {
      id: 5,
      title: "Bakhshali Codex: Ancient Mathematical & Zero Treatise",
      author: "Unknown Northern Indian Mathematician Guild",
      description: "A Birch-Bark manuscript discovered in 1881 near Peshawar containing the earliest radiocarbon-dated physical evidence of the circular zero symbol used in mathematics.",
      category: "Astronomy & Mathematics",
      language: "Sanskrit",
      year: 300,
      // 300 CE
      keywords: "Bakhshali, Zero, Mathematics, Algebra, Birch Bark, Square Root Formula",
      pageCount: 3,
      status: "PUBLISHED" /* PUBLISHED */,
      content: [
        `FOLIO 1: DISCOVERY AND BIRCH BARK CONDITION
The manuscript consists of 70 fragile leaves of Birch Bark (Bhurjapatra) inscribed with black ink (Masi) made from charcoal and gum arabic.

SECTION I: THE CIRCULAR ZERO SYMBOL (SHUNYA-BINDUI)
Throughout the Bakhshali text, a solid dot and hollow circle are used systematically to denote:
1. The number zero as a position holder in decimal place-value numeration.
2. The unknown quantity (X) in linear and quadratic equation problems.

EXAMPLE STATEMENT:
"Add 5 to the unknown dot (Shunya), multiply by 3, subtract 6, and the result is 24."
Equation: 3(x + 5) - 6 = 24  ==>  3x + 9 = 24  ==>  x = 5.`,
        `FOLIO 2: SQUARE ROOT APPROXIMATION FORMULA
For calculating non-perfect square root sqrt(N) where N = A^2 + b:

BAKHSHALI FORMULA:
sqrt(N) ~= A + (b / 2A) - [ (b / 2A)^2 / (2(A + b / 2A)) ]

EXAMPLE: Compute sqrt(41)
Let N = 41 = 6^2 + 5  (A = 6, b = 5)
1st Step: 6 + (5 / 12) = 6.416666...
2nd Correction: 6.416666 - [ (5/12)^2 / 2(6.416666) ] = 6.403124...
True Value sqrt(41) = 6.403124237...
Remarkably accurate to 6 decimal places!`,
        `FOLIO 3: COMMERCIAL PROBLEMS AND PROGRESSIONS
The codex contains real-world arithmetic problems involving merchant interest rates, gold purity alloys, simultaneous linear equations, and arithmetic progressions.

Preserved in the digital archive for global scholars of history of science.`
      ]
    }
  ];
  const initialManuscripts = [];
  for (const s of seeds) {
    const pdfBuffer = await createSamplePdf(s.title, s.author, s.year, s.language, s.content);
    const pdfFileName = `manuscript_${s.id}.pdf`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    initialManuscripts.push({
      record: {
        id: s.id,
        title: s.title,
        author: s.author,
        description: s.description,
        category: s.category,
        language: s.language,
        year: s.year,
        keywords: s.keywords,
        pageCount: s.pageCount,
        fileName: pdfFileName,
        mimeType: "application/pdf",
        status: s.status,
        createdAt: now,
        updatedAt: now
      },
      pdfData: pdfBuffer
    });
  }
  insertInitialManuscripts(initialManuscripts);
  console.log(`Seeded ${seeds.length} manuscripts with valid PDF binaries successfully.`);
}
function getAdminTokens(req) {
  const tokens = [];
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    tokens.push(authHeader.slice(7));
  }
  const cookieHeader = req.headers.cookie;
  if (typeof cookieHeader === "string") {
    for (const cookie of cookieHeader.split(";")) {
      const [rawName, ...rawValue] = cookie.trim().split("=");
      if (rawName === ADMIN_COOKIE_NAME && rawValue.length) {
        try {
          tokens.push(decodeURIComponent(rawValue.join("=")));
        } catch {
        }
      }
    }
  }
  return [...new Set(tokens)];
}
function resolveAdminRequest(req) {
  for (const token of getAdminTokens(req)) {
    let verified;
    try {
      verified = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    } catch {
      continue;
    }
    if (typeof verified === "string" || !verified.email) continue;
    const admin = findAdminByEmail(String(verified.email));
    if (admin) {
      return {
        token,
        user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role }
      };
    }
  }
  return void 0;
}
function authenticateAdminToken(req, res, next) {
  const tokens = getAdminTokens(req);
  if (!tokens.length) {
    return res.status(401).json({ error: "Access denied. No authentication token provided." });
  }
  const authenticated = resolveAdminRequest(req);
  if (!authenticated) {
    res.clearCookie(ADMIN_COOKIE_NAME);
    return res.status(403).json({ error: "Invalid or expired token." });
  }
  req.admin = authenticated.user;
  req.adminToken = authenticated.token;
  return next();
}
function sanitizeFileName(value, fallback) {
  if (typeof value !== "string" || !value.trim()) return fallback;
  return import_path2.default.basename(value).replace(/[\r\n"]/g, "_").slice(0, 255) || fallback;
}
function decodeBase64Payload(value) {
  if (typeof value !== "string" || !value.trim()) return void 0;
  const base64 = value.includes(",") ? value.slice(value.indexOf(",") + 1) : value;
  return Buffer.from(base64, "base64");
}
var GALLERY_STORAGE_DIR = import_path2.default.join(DATA_DIR, "gallery");
var MAX_GALLERY_IMAGE_BYTES = 12 * 1024 * 1024;
var MAX_GALLERY_IMAGES_PER_UPLOAD = 20;
var SUPPORTED_GALLERY_IMAGE_TYPES = /* @__PURE__ */ new Set(["image/jpeg", "image/png", "image/webp"]);
var SUPPORTED_GALLERY_IMAGE_FORMATS = /* @__PURE__ */ new Set(["jpeg", "png", "webp"]);
var GalleryHttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
};
var galleryUpload = (0, import_multer.default)({
  storage: import_multer.default.memoryStorage(),
  limits: {
    fileSize: MAX_GALLERY_IMAGE_BYTES,
    files: MAX_GALLERY_IMAGES_PER_UPLOAD,
    fields: 4,
    fieldSize: 256 * 1024,
    parts: MAX_GALLERY_IMAGES_PER_UPLOAD + 4
  },
  fileFilter: (_req, file, callback) => {
    if (!SUPPORTED_GALLERY_IMAGE_TYPES.has(file.mimetype.toLowerCase())) {
      return callback(new GalleryHttpError(415, "Only JPEG, PNG, and WebP gallery images are supported."));
    }
    return callback(null, true);
  }
});
function withGalleryUpload(middleware) {
  return (req, res, next) => {
    middleware(req, res, (error) => {
      if (!error) return next();
      if (error instanceof GalleryHttpError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      if (error instanceof import_multer.default.MulterError) {
        const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        const message = error.code === "LIMIT_FILE_SIZE" ? "Each gallery image must be 12 MB or smaller." : `Gallery upload failed: ${error.message}`;
        return res.status(status).json({ error: message });
      }
      console.error("Gallery upload middleware failed:", error);
      return res.status(400).json({ error: "The gallery upload could not be processed." });
    });
  };
}
function galleryCurrentYear() {
  return (/* @__PURE__ */ new Date()).getFullYear();
}
function parseGalleryId(value, label) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new GalleryHttpError(400, `${label} must be a positive integer.`);
  }
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new GalleryHttpError(400, `${label} must be a positive integer.`);
  }
  return id;
}
function requireGalleryText(value, label, maximumLength) {
  if (typeof value !== "string" || !value.trim()) {
    throw new GalleryHttpError(400, `${label} is required.`);
  }
  const normalized = value.trim();
  if (normalized.length > maximumLength) {
    throw new GalleryHttpError(400, `${label} must be ${maximumLength} characters or fewer.`);
  }
  return normalized;
}
function optionalGalleryText(value, label, maximumLength) {
  if (value === void 0 || value === null || value === "") return "";
  if (typeof value !== "string") {
    throw new GalleryHttpError(400, `${label} must be text.`);
  }
  const normalized = value.trim();
  if (normalized.length > maximumLength) {
    throw new GalleryHttpError(400, `${label} must be ${maximumLength} characters or fewer.`);
  }
  return normalized;
}
function parseGalleryEventDate(value) {
  if (typeof value !== "string") {
    throw new GalleryHttpError(400, "Event date is required.");
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new GalleryHttpError(400, "Event date must use the YYYY-MM-DD format.");
  }
  const eventYear = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = /* @__PURE__ */ new Date(0);
  parsed.setUTCHours(0, 0, 0, 0);
  parsed.setUTCFullYear(eventYear, month - 1, day);
  if (eventYear < 1 || parsed.getUTCFullYear() !== eventYear || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    throw new GalleryHttpError(400, "Event date is not a valid calendar date.");
  }
  if (eventYear > galleryCurrentYear()) {
    throw new GalleryHttpError(400, `Gallery events cannot be created for a year after ${galleryCurrentYear()}.`);
  }
  return { eventDate: value, eventYear };
}
function parseGalleryEventInput(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new GalleryHttpError(400, "Gallery event details are required.");
  }
  const input = value;
  const { eventDate, eventYear } = parseGalleryEventDate(input.eventDate);
  if (input.status !== "ACTIVE" && input.status !== "INACTIVE") {
    throw new GalleryHttpError(400, "Gallery event status must be ACTIVE or INACTIVE.");
  }
  return {
    title: requireGalleryText(input.title, "Event title", 180),
    description: optionalGalleryText(input.description, "Event description", 5e3),
    eventDate,
    eventYear,
    status: input.status
  };
}
function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}
function parseGalleryImageInput(value, partial = false) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new GalleryHttpError(400, "Image metadata must be an object.");
  }
  const input = value;
  const parsed = {};
  if (!partial || hasOwn(input, "caption")) {
    parsed.caption = requireGalleryText(input.caption, "Image caption", 500);
  }
  if (!partial || hasOwn(input, "altText")) {
    parsed.altText = requireGalleryText(input.altText, "Image alt text", 500);
  }
  if (!partial || hasOwn(input, "displayOrder")) {
    if (!Number.isInteger(input.displayOrder) || Number(input.displayOrder) < 0 || Number(input.displayOrder) > 1e6) {
      throw new GalleryHttpError(400, "Image display order must be a non-negative integer.");
    }
    parsed.displayOrder = Number(input.displayOrder);
  }
  for (const key of ["isFeatured", "isActive"]) {
    if (!partial || hasOwn(input, key)) {
      if (typeof input[key] !== "boolean") {
        throw new GalleryHttpError(400, `${key} must be true or false.`);
      }
      parsed[key] = input[key];
    }
  }
  return parsed;
}
function parseGalleryPagination(query) {
  const offset = query.offset === void 0 ? 0 : Number(query.offset);
  const limit = query.limit === void 0 ? 48 : Number(query.limit);
  if (!Number.isSafeInteger(offset) || offset < 0) {
    throw new GalleryHttpError(400, "Gallery offset must be a non-negative integer.");
  }
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    throw new GalleryHttpError(400, "Gallery limit must be between 1 and 100.");
  }
  return { offset, limit };
}
function galleryStorageKey(eventId, fileName) {
  return import_path2.default.posix.join("gallery", String(eventId), fileName);
}
function resolveGalleryStoragePath(storageKey) {
  const normalized = storageKey.replace(/\\/g, "/");
  if (!normalized.startsWith("gallery/") || import_path2.default.posix.isAbsolute(normalized)) {
    throw new Error("Invalid gallery storage path");
  }
  const absolutePath = import_path2.default.resolve(DATA_DIR, ...normalized.split("/"));
  const root = import_path2.default.resolve(GALLERY_STORAGE_DIR);
  const rootPrefix = `${root}${import_path2.default.sep}`.toLowerCase();
  if (!absolutePath.toLowerCase().startsWith(rootPrefix)) {
    throw new Error("Invalid gallery storage path");
  }
  return absolutePath;
}
async function processGalleryImage(eventId, file) {
  if (!file?.buffer || !Buffer.isBuffer(file.buffer)) {
    throw new GalleryHttpError(400, "A gallery image file is required.");
  }
  if (!SUPPORTED_GALLERY_IMAGE_TYPES.has(String(file.mimetype || "").toLowerCase())) {
    throw new GalleryHttpError(415, "Only JPEG, PNG, and WebP gallery images are supported.");
  }
  let metadata;
  try {
    metadata = await (0, import_sharp.default)(file.buffer, {
      failOn: "error",
      limitInputPixels: false
    }).metadata();
  } catch (error) {
    const reason = String(error?.message || "unknown decode error");
    console.warn(`Gallery image validation failed for ${String(file.originalname || "unnamed image")}: ${reason}`);
    throw new GalleryHttpError(400, "One of the selected images could not be decoded. Please use a valid JPEG, PNG, or WebP file.");
  }
  if (!metadata.format || !SUPPORTED_GALLERY_IMAGE_FORMATS.has(metadata.format)) {
    throw new GalleryHttpError(415, "Only decoded JPEG, PNG, and WebP images are supported.");
  }
  if (!metadata.width || !metadata.height) {
    throw new GalleryHttpError(400, "Gallery image dimensions are invalid.");
  }
  const eventDirectory = import_path2.default.join(GALLERY_STORAGE_DIR, String(eventId));
  await import_fs2.default.promises.mkdir(eventDirectory, { recursive: true });
  const token = (0, import_crypto2.randomUUID)();
  const imageUrl = galleryStorageKey(eventId, `${token}-full.webp`);
  const thumbnailUrl = galleryStorageKey(eventId, `${token}-thumb.webp`);
  const fullPath = resolveGalleryStoragePath(imageUrl);
  const thumbnailPath = resolveGalleryStoragePath(thumbnailUrl);
  try {
    const source = (0, import_sharp.default)(file.buffer, {
      failOn: "error",
      limitInputPixels: false
    }).rotate();
    const fullInfo = await source.clone().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 88, effort: 4 }).toFile(fullPath);
    await source.clone().resize({ width: 960, height: 960, fit: "inside", withoutEnlargement: true }).webp({ quality: 80, effort: 4 }).toFile(thumbnailPath);
    return {
      imageUrl,
      thumbnailUrl,
      width: fullInfo.width,
      height: fullInfo.height
    };
  } catch (error) {
    await deleteStoredGalleryAssets([imageUrl, thumbnailUrl]);
    if (error instanceof GalleryHttpError) throw error;
    throw new GalleryHttpError(400, "One of the selected gallery images could not be processed.");
  }
}
async function deleteStoredGalleryAssets(storageKeys) {
  for (const storageKey of storageKeys) {
    if (!storageKey) continue;
    try {
      await import_fs2.default.promises.unlink(resolveGalleryStoragePath(storageKey));
    } catch (error) {
      if (error?.code !== "ENOENT") {
        console.warn(`Could not remove gallery asset ${storageKey}:`, error);
      }
    }
  }
}
async function removeGalleryEventDirectoryIfEmpty(eventId) {
  const eventDirectory = import_path2.default.join(GALLERY_STORAGE_DIR, String(eventId));
  try {
    await import_fs2.default.promises.rmdir(eventDirectory);
  } catch (error) {
    if (error?.code !== "ENOENT" && error?.code !== "ENOTEMPTY") {
      console.warn(`Could not remove gallery event directory ${eventId}:`, error);
    }
  }
}
function galleryImageResponse(image) {
  const version = encodeURIComponent(image.updatedAt);
  return {
    ...image,
    imageUrl: `/api/gallery/images/${image.id}/file?v=${version}`,
    thumbnailUrl: `/api/gallery/images/${image.id}/thumbnail?v=${version}`
  };
}
function galleryEventResponse(event, includeInactiveImages) {
  const images = listGalleryImagesForEvent(event.id, includeInactiveImages).map(galleryImageResponse);
  return { ...event, images, imageCount: images.length };
}
function buildGalleryYearResponse(year, offset, limit) {
  const rows = listPublicGalleryImagesByYear(year, limit, offset);
  const eventsById = /* @__PURE__ */ new Map();
  for (const row of rows) {
    let event = eventsById.get(row.eventId);
    if (!event) {
      event = {
        id: row.eventId,
        title: row.eventTitle,
        description: row.eventDescription,
        eventDate: row.eventDate,
        eventYear: row.eventYear,
        status: row.eventStatus,
        createdAt: row.eventCreatedAt,
        updatedAt: row.eventUpdatedAt,
        images: []
      };
      eventsById.set(row.eventId, event);
    }
    event.images.push(galleryImageResponse(row));
  }
  const events = [...eventsById.values()].map((event) => ({ ...event, imageCount: event.images.length }));
  const totalImages = countPublicGalleryImagesByYear(year);
  return {
    year,
    events,
    totalImages,
    hasMore: offset + rows.length < totalImages
  };
}
function sendGalleryRouteError(res, error, operation) {
  if (error instanceof GalleryHttpError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  console.error(`Gallery ${operation} failed:`, error);
  return res.status(500).json({ error: `Failed to ${operation}.` });
}
async function serveGalleryAsset(req, res, thumbnail) {
  try {
    const id = parseGalleryId(req.params.id, "Gallery image ID");
    const image = getGalleryImageWithEvent(id);
    const isPublic = image?.eventStatus === "ACTIVE" && image.isActive;
    if (!image || !isPublic && !resolveAdminRequest(req)) {
      return res.status(404).send("Gallery image not found");
    }
    const assetPath = resolveGalleryStoragePath(thumbnail ? image.thumbnailUrl : image.imageUrl);
    const stats = await import_fs2.default.promises.stat(assetPath);
    if (!stats.isFile()) return res.status(404).send("Gallery image not found");
    res.setHeader("Content-Type", "image/webp");
    res.setHeader("Content-Length", stats.size);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Cache-Control",
      isPublic ? "public, max-age=31536000, immutable" : "private, no-store"
    );
    return res.sendFile(assetPath);
  } catch (error) {
    if (error instanceof GalleryHttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    if (error?.code === "ENOENT") return res.status(404).send("Gallery image not found");
    console.error("Gallery image delivery failed:", error);
    return res.status(500).send("Gallery image could not be delivered");
  }
}
async function detectPdfPageCount(pdfData) {
  const pdf = await import_pdf_lib.PDFDocument.load(pdfData);
  const pageCount = pdf.getPageCount();
  if (pageCount < 1) throw new Error("The uploaded PDF has no pages");
  return pageCount;
}
async function syncExistingPdfPageCounts() {
  if (!shouldSyncPdfPageCounts()) return;
  const manuscripts = listManuscripts({ includeUnpublished: true });
  for (const manuscript of manuscripts) {
    const pdf = getManuscriptPdf(manuscript.id);
    if (!pdf) continue;
    try {
      const detectedPageCount = await detectPdfPageCount(pdf.data);
      if (detectedPageCount !== manuscript.pageCount) {
        updateManuscript({ ...manuscript, pageCount: detectedPageCount });
      }
    } catch (error) {
      console.warn(`Could not detect pages for manuscript ${manuscript.id}:`, error);
    }
  }
  markPdfPageCountsSynced();
}
async function startServer() {
  await seedInitialManuscripts();
  await syncExistingPdfPageCounts();
  await import_fs2.default.promises.mkdir(GALLERY_STORAGE_DIR, { recursive: true });
  const app = (0, import_express.default)();
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", database: getDatabaseStatus() });
  });
  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    const admin = typeof email === "string" ? findAdminByEmail(email) : void 0;
    if (admin && typeof password === "string" && import_bcryptjs2.default.compareSync(password, admin.passwordHash)) {
      const user = { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
      const token = import_jsonwebtoken.default.sign(
        user,
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.cookie(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1e3
      });
      return res.json({ token, user });
    }
    return res.status(401).json({ error: "Invalid admin credentials." });
  });
  app.get("/api/admin/me", authenticateAdminToken, (req, res) => {
    res.cookie(ADMIN_COOKIE_NAME, req.adminToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1e3
    });
    res.json({ user: req.admin });
  });
  app.post("/api/admin/logout", (_req, res) => {
    res.clearCookie(ADMIN_COOKIE_NAME);
    res.json({ success: true });
  });
  app.get("/api/categories", (_req, res) => {
    res.json(listCategories());
  });
  app.post("/api/categories", authenticateAdminToken, (req, res) => {
    const { name, description } = req.body;
    if (typeof name !== "string" || !name.trim()) return res.status(400).json({ error: "Category name is required" });
    try {
      return res.status(201).json(createCategory(name.trim(), typeof description === "string" ? description.trim() : ""));
    } catch {
      return res.status(409).json({ error: "A category with this name already exists" });
    }
  });
  app.delete("/api/categories/:id", authenticateAdminToken, (req, res) => {
    if (!deleteCategory(req.params.id)) return res.status(404).json({ error: "Category not found" });
    return res.json({ success: true });
  });
  app.get("/api/languages", (_req, res) => {
    res.json(listLanguages());
  });
  app.post("/api/languages", authenticateAdminToken, (req, res) => {
    const { name, code } = req.body;
    if (typeof name !== "string" || !name.trim()) return res.status(400).json({ error: "Language name is required" });
    try {
      return res.status(201).json(createLanguage(name.trim(), typeof code === "string" ? code.trim() : ""));
    } catch {
      return res.status(409).json({ error: "A language with this name already exists" });
    }
  });
  app.delete("/api/languages/:id", authenticateAdminToken, (req, res) => {
    if (!deleteLanguage(req.params.id)) return res.status(404).json({ error: "Language not found" });
    return res.json({ success: true });
  });
  app.get("/api/gallery/years", (_req, res) => {
    return res.json({ years: listAvailableGalleryYears(galleryCurrentYear()) });
  });
  app.get("/api/gallery", (req, res) => {
    try {
      const yearValue = req.query.year;
      if (typeof yearValue !== "string" || !/^\d{4}$/.test(yearValue)) {
        throw new GalleryHttpError(400, "A valid four-digit gallery year is required.");
      }
      const year = Number(yearValue);
      if (year < 1 || year > galleryCurrentYear()) {
        throw new GalleryHttpError(400, `Gallery year must not be later than ${galleryCurrentYear()}.`);
      }
      const { offset, limit } = parseGalleryPagination(req.query);
      return res.json(buildGalleryYearResponse(year, offset, limit));
    } catch (error) {
      return sendGalleryRouteError(res, error, "load gallery");
    }
  });
  app.get("/api/gallery/current", (_req, res) => {
    try {
      const year = galleryCurrentYear();
      return res.json(buildGalleryYearResponse(year, 0, 24));
    } catch (error) {
      return sendGalleryRouteError(res, error, "load the current-year gallery");
    }
  });
  app.get("/api/gallery/events", (req, res) => {
    const sendEvents = (includeInactive) => {
      const events = listGalleryEvents(includeInactive).map((event) => galleryEventResponse(event, includeInactive));
      return res.json(events);
    };
    if (req.query.isAdmin === "true") {
      return authenticateAdminToken(req, res, () => sendEvents(true));
    }
    return sendEvents(false);
  });
  app.get("/api/gallery/events/:id", (req, res) => {
    try {
      const id = parseGalleryId(req.params.id, "Gallery event ID");
      const event = getGalleryEvent(id);
      const isAdmin = Boolean(resolveAdminRequest(req));
      if (!event || event.status !== "ACTIVE" && !isAdmin) {
        return res.status(404).json({ error: "Gallery event not found" });
      }
      return res.json(galleryEventResponse(event, isAdmin));
    } catch (error) {
      return sendGalleryRouteError(res, error, "load gallery event");
    }
  });
  app.post("/api/gallery/events", authenticateAdminToken, (req, res) => {
    try {
      const event = insertGalleryEvent(parseGalleryEventInput(req.body));
      return res.status(201).json({ ...event, images: [], imageCount: 0 });
    } catch (error) {
      return sendGalleryRouteError(res, error, "create gallery event");
    }
  });
  app.put("/api/gallery/events/:id", authenticateAdminToken, (req, res) => {
    try {
      const id = parseGalleryId(req.params.id, "Gallery event ID");
      if (!getGalleryEvent(id)) return res.status(404).json({ error: "Gallery event not found" });
      const updated = updateGalleryEvent(id, parseGalleryEventInput(req.body));
      if (!updated) return res.status(404).json({ error: "Gallery event not found" });
      return res.json(galleryEventResponse(updated, true));
    } catch (error) {
      return sendGalleryRouteError(res, error, "update gallery event");
    }
  });
  app.delete("/api/gallery/events/:id", authenticateAdminToken, async (req, res) => {
    try {
      const id = parseGalleryId(req.params.id, "Gallery event ID");
      const event = getGalleryEvent(id);
      if (!event) return res.status(404).json({ error: "Gallery event not found" });
      const images = listGalleryImagesForEvent(id, true);
      if (!deleteGalleryEvent(id)) return res.status(404).json({ error: "Gallery event not found" });
      await deleteStoredGalleryAssets(images.flatMap((image) => [image.imageUrl, image.thumbnailUrl]));
      await removeGalleryEventDirectoryIfEmpty(id);
      return res.json({ success: true });
    } catch (error) {
      return sendGalleryRouteError(res, error, "delete gallery event");
    }
  });
  app.post(
    "/api/gallery/events/:id/images",
    authenticateAdminToken,
    withGalleryUpload(galleryUpload.array("images", MAX_GALLERY_IMAGES_PER_UPLOAD)),
    async (req, res) => {
      const processed = [];
      try {
        const eventId = parseGalleryId(req.params.id, "Gallery event ID");
        if (!getGalleryEvent(eventId)) return res.status(404).json({ error: "Gallery event not found" });
        const files = Array.isArray(req.files) ? req.files : [];
        if (!files.length) throw new GalleryHttpError(400, "Select at least one gallery image.");
        let rawMetadata;
        try {
          rawMetadata = JSON.parse(String(req.body?.metadata || ""));
        } catch {
          throw new GalleryHttpError(400, "Gallery image metadata must be valid JSON.");
        }
        if (!Array.isArray(rawMetadata) || rawMetadata.length !== files.length) {
          throw new GalleryHttpError(400, "Metadata must be supplied for every uploaded image.");
        }
        const metadata = rawMetadata.map((value) => parseGalleryImageInput(value, false));
        for (const file of files) {
          processed.push(await processGalleryImage(eventId, file));
        }
        const inserted = insertGalleryImages(processed.map((asset, index) => ({
          eventId,
          imageUrl: asset.imageUrl,
          thumbnailUrl: asset.thumbnailUrl,
          caption: metadata[index].caption,
          altText: metadata[index].altText,
          displayOrder: metadata[index].displayOrder,
          isFeatured: Boolean(metadata[index].isFeatured && metadata[index].isActive),
          isActive: metadata[index].isActive,
          width: asset.width,
          height: asset.height
        })));
        return res.status(201).json(inserted.map(galleryImageResponse));
      } catch (error) {
        await deleteStoredGalleryAssets(processed.flatMap((asset) => [asset.imageUrl, asset.thumbnailUrl]));
        return sendGalleryRouteError(res, error, "upload gallery images");
      }
    }
  );
  app.put("/api/gallery/images/:id", authenticateAdminToken, (req, res) => {
    try {
      const id = parseGalleryId(req.params.id, "Gallery image ID");
      if (!getGalleryImage(id)) return res.status(404).json({ error: "Gallery image not found" });
      const changes = parseGalleryImageInput(req.body, true);
      const updated = updateGalleryImageMetadata(id, changes);
      if (!updated) return res.status(404).json({ error: "Gallery image not found" });
      return res.json(galleryImageResponse(updated));
    } catch (error) {
      return sendGalleryRouteError(res, error, "update gallery image");
    }
  });
  app.post(
    "/api/gallery/images/:id/replace",
    authenticateAdminToken,
    withGalleryUpload(galleryUpload.single("image")),
    async (req, res) => {
      let processed;
      try {
        const id = parseGalleryId(req.params.id, "Gallery image ID");
        const current = getGalleryImage(id);
        if (!current) return res.status(404).json({ error: "Gallery image not found" });
        if (!req.file) throw new GalleryHttpError(400, "Select a replacement gallery image.");
        processed = await processGalleryImage(current.eventId, req.file);
        const updated = replaceGalleryImageAsset(
          id,
          processed.imageUrl,
          processed.thumbnailUrl,
          processed.width,
          processed.height
        );
        if (!updated) {
          await deleteStoredGalleryAssets([processed.imageUrl, processed.thumbnailUrl]);
          return res.status(404).json({ error: "Gallery image not found" });
        }
        await deleteStoredGalleryAssets([current.imageUrl, current.thumbnailUrl]);
        return res.json(galleryImageResponse(updated));
      } catch (error) {
        if (processed) await deleteStoredGalleryAssets([processed.imageUrl, processed.thumbnailUrl]);
        return sendGalleryRouteError(res, error, "replace gallery image");
      }
    }
  );
  app.put("/api/gallery/events/:id/images/reorder", authenticateAdminToken, (req, res) => {
    try {
      const eventId = parseGalleryId(req.params.id, "Gallery event ID");
      if (!getGalleryEvent(eventId)) return res.status(404).json({ error: "Gallery event not found" });
      const imageIds = req.body?.imageIds;
      if (!Array.isArray(imageIds) || imageIds.some((id) => !Number.isSafeInteger(id) || Number(id) < 1)) {
        throw new GalleryHttpError(400, "imageIds must be an array of positive integer IDs.");
      }
      const existingIds = listGalleryImagesForEvent(eventId, true).map((image) => image.id);
      const suppliedIds = new Set(imageIds);
      if (suppliedIds.size !== imageIds.length || imageIds.length !== existingIds.length || existingIds.some((id) => !suppliedIds.has(id))) {
        throw new GalleryHttpError(400, "Image order must contain every image in this event exactly once.");
      }
      return res.json(reorderGalleryImages(eventId, imageIds).map(galleryImageResponse));
    } catch (error) {
      return sendGalleryRouteError(res, error, "reorder gallery images");
    }
  });
  app.delete("/api/gallery/images/:id", authenticateAdminToken, async (req, res) => {
    try {
      const id = parseGalleryId(req.params.id, "Gallery image ID");
      const image = getGalleryImage(id);
      if (!image) return res.status(404).json({ error: "Gallery image not found" });
      if (!deleteGalleryImage(id)) return res.status(404).json({ error: "Gallery image not found" });
      await deleteStoredGalleryAssets([image.imageUrl, image.thumbnailUrl]);
      await removeGalleryEventDirectoryIfEmpty(image.eventId);
      return res.json({ success: true });
    } catch (error) {
      return sendGalleryRouteError(res, error, "delete gallery image");
    }
  });
  app.get("/api/gallery/images/:id/file", (req, res) => serveGalleryAsset(req, res, false));
  app.get("/api/gallery/images/:id/thumbnail", (req, res) => serveGalleryAsset(req, res, true));
  app.get("/api/manuscripts", (req, res, next) => {
    const { search, category, language, yearFrom, yearTo, status, sortBy, isAdmin } = req.query;
    const includeUnpublished = isAdmin === "true";
    const sendRecords = () => res.json(listManuscripts({
      search: typeof search === "string" ? search : void 0,
      category: typeof category === "string" ? category : void 0,
      language: typeof language === "string" ? language : void 0,
      yearFrom: typeof yearFrom === "string" && yearFrom !== "" ? Number(yearFrom) : void 0,
      yearTo: typeof yearTo === "string" && yearTo !== "" ? Number(yearTo) : void 0,
      status: typeof status === "string" ? status : void 0,
      sortBy: typeof sortBy === "string" ? sortBy : void 0,
      includeUnpublished
    }));
    if (includeUnpublished) {
      return authenticateAdminToken(req, res, sendRecords);
    }
    return sendRecords();
  });
  app.get("/api/manuscripts/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const m = getManuscript(id);
    if (!m || m.status !== "PUBLISHED" /* PUBLISHED */ && !resolveAdminRequest(req)) {
      return res.status(404).json({ error: "Manuscript not found" });
    }
    res.json(m);
  });
  app.get("/api/manuscripts/:id/pdf", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const manuscript = getManuscript(id);
    if (!manuscript || manuscript.status !== "PUBLISHED" /* PUBLISHED */ && !resolveAdminRequest(req)) {
      return res.status(404).send("PDF binary data not found in store");
    }
    const pdf = getManuscriptPdf(id);
    if (!pdf) {
      return res.status(404).send("PDF binary data not found in store");
    }
    res.setHeader("Content-Type", pdf.mimeType || "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(pdf.fileName)}"`);
    res.setHeader("Cache-Control", "no-store, private");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Length", pdf.data.length);
    return res.send(pdf.data);
  });
  app.get("/api/manuscripts/:id/cover", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const manuscript = getManuscript(id);
    if (!manuscript || manuscript.status !== "PUBLISHED" /* PUBLISHED */ && !resolveAdminRequest(req)) {
      return res.status(404).send("Cover image not found");
    }
    const cover = getManuscriptCover(id);
    if (!cover) {
      return res.status(404).send("Cover image not found");
    }
    res.setHeader("Content-Type", cover.coverType);
    res.setHeader("Content-Length", cover.data.length);
    return res.send(cover.data);
  });
  app.post("/api/manuscripts", authenticateAdminToken, async (req, res) => {
    try {
      const {
        title,
        author,
        description,
        category,
        language,
        year,
        keywords,
        status,
        coverData,
        coverType,
        pdfData,
        fileName,
        mimeType
      } = req.body;
      if (!title) {
        return res.status(400).json({ error: "Manuscript title is required" });
      }
      if (status && !Object.values(ManuscriptStatus).includes(status)) {
        return res.status(400).json({ error: "Invalid manuscript status" });
      }
      const actualFileName = fileName ? sanitizeFileName(fileName, "manuscript.pdf") : void 0;
      let pdfBuffer = decodeBase64Payload(pdfData);
      const coverBuffer = decodeBase64Payload(coverData);
      if (!pdfBuffer) {
        pdfBuffer = await createSamplePdf(
          title,
          author || "Unknown Scribe",
          Number(year) || 1200,
          language || "Sanskrit",
          [`CHAPTER I: MANUSCRIPT PRESERVATION RECORD
Title: ${title}
Author: ${author || "Unknown"}
Description: ${description || "Preserved document"}`]
        );
      }
      const detectedPageCount = await detectPdfPageCount(pdfBuffer);
      const newRecord = insertManuscript({
        title: String(title).trim(),
        author: author || "Unknown Scribe",
        description: description || "",
        category: category || "General Archives",
        language: language || "Sanskrit",
        year: Number(year) || 1e3,
        keywords: keywords || "",
        pageCount: detectedPageCount,
        fileName: actualFileName,
        mimeType: mimeType || "application/pdf",
        coverType: coverType || "image/jpeg",
        status: status || "DRAFT" /* DRAFT */
      }, pdfBuffer, coverBuffer);
      return res.status(201).json(newRecord);
    } catch (e) {
      console.error("Error creating manuscript:", e);
      return res.status(500).json({ error: e.message || "Failed to create manuscript" });
    }
  });
  app.put("/api/manuscripts/:id", authenticateAdminToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const current = getManuscript(id);
    if (!current) {
      return res.status(404).json({ error: "Manuscript not found" });
    }
    try {
      const {
        title,
        author,
        description,
        category,
        language,
        year,
        keywords,
        status,
        coverData,
        coverType,
        pdfData,
        fileName,
        mimeType
      } = req.body;
      if (status !== void 0 && !Object.values(ManuscriptStatus).includes(status)) {
        return res.status(400).json({ error: "Invalid manuscript status" });
      }
      const uploadedPdfBuffer = decodeBase64Payload(pdfData);
      const detectedPageCount = uploadedPdfBuffer ? await detectPdfPageCount(uploadedPdfBuffer) : current.pageCount;
      const record = {
        ...current,
        title: title !== void 0 ? title : current.title,
        author: author !== void 0 ? author : current.author,
        description: description !== void 0 ? description : current.description,
        category: category !== void 0 ? category : current.category,
        language: language !== void 0 ? language : current.language,
        year: year !== void 0 ? Number(year) : current.year,
        keywords: keywords !== void 0 ? keywords : current.keywords,
        pageCount: detectedPageCount,
        fileName: fileName !== void 0 ? sanitizeFileName(fileName, current.fileName) : current.fileName,
        mimeType: mimeType !== void 0 ? mimeType : current.mimeType,
        coverType: coverType !== void 0 ? coverType : current.coverType,
        status: status !== void 0 ? status : current.status,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const updated = updateManuscript(record, uploadedPdfBuffer, decodeBase64Payload(coverData));
      return res.json(updated);
    } catch (e) {
      console.error("Error updating manuscript:", e);
      return res.status(500).json({ error: e.message || "Failed to update manuscript" });
    }
  });
  app.patch("/api/manuscripts/:id/status", authenticateAdminToken, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    const m = getManuscript(id);
    if (!m) return res.status(404).json({ error: "Manuscript not found" });
    if (!Object.values(ManuscriptStatus).includes(status)) {
      return res.status(400).json({ error: "Invalid manuscript status" });
    }
    const updated = updateManuscript({ ...m, status, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    res.json(updated);
  });
  app.delete("/api/manuscripts/:id", authenticateAdminToken, (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!deleteManuscript(id)) return res.status(404).json({ error: "Manuscript not found" });
    res.json({ success: true, message: "Manuscript deleted successfully" });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening at http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
