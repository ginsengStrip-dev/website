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
var import_path2 = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_pdf_lib = require("pdf-lib");
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);

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

  CREATE INDEX IF NOT EXISTS idx_manuscripts_status ON manuscripts(status);
  CREATE INDEX IF NOT EXISTS idx_manuscripts_category ON manuscripts(category);
  CREATE INDEX IF NOT EXISTS idx_manuscripts_language ON manuscripts(language);
  CREATE INDEX IF NOT EXISTS idx_manuscripts_year ON manuscripts(year);
  CREATE INDEX IF NOT EXISTS idx_manuscripts_created_at ON manuscripts(created_at DESC);

  PRAGMA user_version = 2;
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
async function startServer() {
  await seedInitialManuscripts();
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
        pageCount,
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
      const newRecord = insertManuscript({
        title: String(title).trim(),
        author: author || "Unknown Scribe",
        description: description || "",
        category: category || "General Archives",
        language: language || "Sanskrit",
        year: Number(year) || 1e3,
        keywords: keywords || "",
        pageCount: Math.max(1, Number(pageCount) || 1),
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
        pageCount,
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
      const record = {
        ...current,
        title: title !== void 0 ? title : current.title,
        author: author !== void 0 ? author : current.author,
        description: description !== void 0 ? description : current.description,
        category: category !== void 0 ? category : current.category,
        language: language !== void 0 ? language : current.language,
        year: year !== void 0 ? Number(year) : current.year,
        keywords: keywords !== void 0 ? keywords : current.keywords,
        pageCount: pageCount !== void 0 ? Math.max(1, Number(pageCount) || 1) : current.pageCount,
        fileName: fileName !== void 0 ? sanitizeFileName(fileName, current.fileName) : current.fileName,
        mimeType: mimeType !== void 0 ? mimeType : current.mimeType,
        coverType: coverType !== void 0 ? coverType : current.coverType,
        status: status !== void 0 ? status : current.status,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const updated = updateManuscript(record, decodeBase64Payload(pdfData), decodeBase64Payload(coverData));
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
