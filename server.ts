import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { createServer as createViteServer } from 'vite';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import sharp from 'sharp';
import {
  DATA_DIR,
  countPublicGalleryImagesByYear,
  createCategory,
  createLanguage,
  deleteCategory,
  deleteGalleryEvent,
  deleteGalleryImage,
  deleteLanguage,
  deleteManuscript,
  findAdminByEmail,
  getDatabaseStatus,
  getGalleryEvent,
  getGalleryImage,
  getGalleryImageWithEvent,
  getManuscript,
  getManuscriptCover,
  getManuscriptPdf,
  insertGalleryEvent,
  insertGalleryImages,
  insertInitialManuscripts,
  insertManuscript,
  listAvailableGalleryYears,
  listCategories,
  listGalleryEvents,
  listGalleryImagesForEvent,
  listLanguages,
  listManuscripts,
  listPublicGalleryImagesByYear,
  markPdfPageCountsSynced,
  reorderGalleryImages,
  replaceGalleryImageAsset,
  shouldSeedInitialManuscripts,
  shouldSyncPdfPageCounts,
  updateGalleryEvent,
  updateGalleryImageMetadata,
  updateManuscript,
  type GalleryEventRecord,
  type GalleryEventStatusValue,
  type GalleryImageMetadataUpdate,
  type GalleryImageRecord,
  type GalleryImageWithEventRecord,
  type ManuscriptRecord,
} from './database';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production');
}

const JWT_SECRET = process.env.JWT_SECRET || 'archivalia_manuscript_preservation_secret_key_2026';
const PORT = Number(process.env.PORT) || 3000;
const ADMIN_COOKIE_NAME = 'archivalia_admin_session';

// Types
enum ManuscriptStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

// Sanitize non-WinAnsi characters to prevent pdf-lib encoding exceptions
function sanitizeForWinAnsi(text: string): string {
  if (!text) return '';
  return text
    .replace(/√/g, 'sqrt')
    .replace(/≈/g, '~=')
    .replace(/≠/g, '!=')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/±/g, '+/-')
    .replace(/°/g, ' deg ')
    .replace(/¹/g, '^1')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/“/g, '"')
    .replace(/”/g, '"')
    .replace(/‘/g, "'")
    .replace(/’/g, "'")
    .replace(/…/g, '...')
    // Keep printable ASCII range and basic WinAnsi Latin
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
}

function safeDrawText(page: any, text: string, options: any) {
  const clean = sanitizeForWinAnsi(text);
  if (!clean) return;
  try {
    page.drawText(clean, options);
  } catch (err) {
    // Ultimate fallback: strict printable ASCII only
    const ascii = clean.replace(/[^\x20-\x7E]/g, '');
    if (ascii) {
      page.drawText(ascii, options);
    }
  }
}

// Generate realistic PDF binary with pdf-lib for seeded manuscripts
async function createSamplePdf(title: string, author: string, year: number, language: string, contentPages: string[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const regularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  // Cover / Title Page
  const coverPage = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = coverPage.getSize();

  // Decorative double border
  coverPage.drawRectangle({
    x: 25,
    y: 25,
    width: width - 50,
    height: height - 50,
    borderColor: rgb(0.4, 0.25, 0.1),
    borderWidth: 2.5,
  });
  coverPage.drawRectangle({
    x: 32,
    y: 32,
    width: width - 64,
    height: height - 64,
    borderColor: rgb(0.65, 0.45, 0.2),
    borderWidth: 1,
  });

  // Parchment background fill effect
  coverPage.drawRectangle({
    x: 35,
    y: 35,
    width: width - 70,
    height: height - 70,
    color: rgb(0.98, 0.96, 0.91),
  });

  // Title text
  safeDrawText(coverPage, 'DIGITAL MANUSCRIPT PRESERVATION', {
    x: 120,
    y: height - 100,
    size: 13,
    font: timesItalic,
    color: rgb(0.4, 0.25, 0.1),
  });

  safeDrawText(coverPage, title, {
    x: 60,
    y: height - 220,
    size: 24,
    font: timesFont,
    color: rgb(0.2, 0.1, 0.05),
    maxWidth: width - 120,
    lineHeight: 30,
  });

  safeDrawText(coverPage, `Attributed Author / Scribe: ${author}`, {
    x: 60,
    y: height - 320,
    size: 14,
    font: timesItalic,
    color: rgb(0.3, 0.2, 0.1),
  });

  safeDrawText(coverPage, `Language: ${language}  |  Estimated Period: ${year < 0 ? Math.abs(year) + ' BCE' : year + ' CE'}`, {
    x: 60,
    y: height - 350,
    size: 12,
    font: regularFont,
    color: rgb(0.4, 0.3, 0.2),
  });

  // Decorative motif line
  coverPage.drawLine({
    start: { x: 60, y: height - 390 },
    end: { x: width - 60, y: height - 390 },
    thickness: 1,
    color: rgb(0.5, 0.3, 0.15),
  });

  safeDrawText(coverPage, 'ARCHIVAL COLLECTION OF RARE MANUSCRIPTS', {
    x: 125,
    y: 100,
    size: 11,
    font: timesFont,
    color: rgb(0.4, 0.25, 0.1),
  });

  // Add content pages
  for (let i = 0; i < contentPages.length; i++) {
    const page = pdfDoc.addPage([595.28, 841.89]);
    page.drawRectangle({
      x: 35,
      y: 35,
      width: width - 70,
      height: height - 70,
      color: rgb(0.99, 0.98, 0.95),
    });
    page.drawRectangle({
      x: 30,
      y: 30,
      width: width - 60,
      height: height - 60,
      borderColor: rgb(0.7, 0.55, 0.35),
      borderWidth: 1,
    });

    // Page header
    safeDrawText(page, `${title} - Folio ${i + 1}`, {
      x: 50,
      y: height - 60,
      size: 10,
      font: timesItalic,
      color: rgb(0.5, 0.35, 0.2),
    });

    page.drawLine({
      start: { x: 50, y: height - 70 },
      end: { x: width - 50, y: height - 70 },
      thickness: 0.8,
      color: rgb(0.7, 0.55, 0.35),
    });

    // Page text body
    const lines = contentPages[i].split('\n');
    let currentY = height - 100;

    for (const line of lines) {
      if (line.startsWith('CHAPTER') || line.startsWith('FOLIO') || line.startsWith('SECTION')) {
        currentY -= 10;
        safeDrawText(page, line, {
          x: 50,
          y: currentY,
          size: 14,
          font: timesFont,
          color: rgb(0.3, 0.15, 0.05),
        });
        currentY -= 22;
      } else if (line.trim() !== '') {
        safeDrawText(page, line, {
          x: 50,
          y: currentY,
          size: 11,
          font: regularFont,
          color: rgb(0.15, 0.1, 0.05),
          maxWidth: width - 100,
          lineHeight: 16,
        });
        currentY -= 18;
      } else {
        currentY -= 10;
      }
      if (currentY < 80) break;
    }

    // Page number footer
    safeDrawText(page, `- ${i + 1} -`, {
      x: width / 2 - 10,
      y: 50,
      size: 10,
      font: regularFont,
      color: rgb(0.5, 0.35, 0.2),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

// Seed initial manuscripts if database is empty
async function seedInitialManuscripts() {
  if (!shouldSeedInitialManuscripts()) return;

  console.log('Seeding initial rare manuscript collection with generated PDF binaries...');

  const seeds = [
    {
      id: 1,
      title: 'Sushruta Samhita: Ancient Treatise on Surgery & Anatomy',
      author: 'Maharshi Sushruta',
      description: 'One of the foundational texts of Ayurveda detailing over 300 surgical procedures, 120 surgical instruments, rhinoplasty, ophthalmic surgery, and anatomical preservation techniques written in classical Sanskrit.',
      category: 'Medical & Ayurveda',
      language: 'Sanskrit',
      year: 600, // 600 BCE
      keywords: 'Ayurveda, Surgery, Medicine, Anatomy, Rhinoplasty, Ancient India',
      pageCount: 4,
      status: ManuscriptStatus.PUBLISHED,
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
      title: 'Surya Siddhanta: Astronomical Treatise on Celestial Mechanics',
      author: 'Varahamihira (Commentator) / Ancient Astronomical Guild',
      description: 'A monument of Indian mathematical astronomy describing planetary orbits, solar and lunar eclipse calculations, precession of equinoxes, and sine tables.',
      category: 'Astronomy & Mathematics',
      language: 'Sanskrit',
      year: 500, // 500 CE
      keywords: 'Astronomy, Trigonometry, Eclipse, Sine Tables, Planetary Orbits, Cosmos',
      pageCount: 3,
      status: ManuscriptStatus.PUBLISHED,
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
1. Jya(3°45') = 225 minutes of arc
2. Jya(7°30') = 449 minutes of arc
3. Jya(11°15') = 671 minutes of arc
4. Jya(15°00') = 890 minutes of arc
5. Jya(30°00') = 1719 minutes (Half Radius)
6. Jya(45°00') = 2431 minutes
7. Jya(90°00') = 3438 minutes (Full Radius)

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
      title: 'Tirukkural: Classical Tamil Codex on Ethics & Governance',
      author: 'Thiruvalluvar',
      description: 'A masterpiece of Tamil literature comprising 1,330 couplets (Kurals) divided into Virtue (Aram), Wealth/Statecraft (Porul), and Love (Inbam). Preserved on palm leaf manuscripts.',
      category: 'Literature & Poetry',
      language: 'Tamil',
      year: 100, // 100 CE
      keywords: 'Tamil, Ethics, Thiruvalluvar, Governance, Philosophy, Virtue, Palm Leaf',
      pageCount: 3,
      status: ManuscriptStatus.PUBLISHED,
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
      title: 'Shahnameh: The Persian Book of Kings (Illustrated Epic)',
      author: 'Firdowsi Tusi',
      description: 'An epic poem of 50,000 couplets chronicling the mythical, heroic, and historical past of the Persian Empire from creation until the 7th century.',
      category: 'History & Chronicles',
      language: 'Persian',
      year: 1010, // 1010 CE
      keywords: 'Persian, Shahnameh, Epic, Firdowsi, Rostam, Kings, Calligraphy',
      pageCount: 3,
      status: ManuscriptStatus.PUBLISHED,
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
      title: 'Bakhshali Codex: Ancient Mathematical & Zero Treatise',
      author: 'Unknown Northern Indian Mathematician Guild',
      description: 'A Birch-Bark manuscript discovered in 1881 near Peshawar containing the earliest radiocarbon-dated physical evidence of the circular zero symbol used in mathematics.',
      category: 'Astronomy & Mathematics',
      language: 'Sanskrit',
      year: 300, // 300 CE
      keywords: 'Bakhshali, Zero, Mathematics, Algebra, Birch Bark, Square Root Formula',
      pageCount: 3,
      status: ManuscriptStatus.PUBLISHED,
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
    const now = new Date().toISOString();
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
        mimeType: 'application/pdf',
        status: s.status,
        createdAt: now,
        updatedAt: now,
      },
      pdfData: pdfBuffer,
    });
  }
  insertInitialManuscripts(initialManuscripts);

  console.log(`Seeded ${seeds.length} manuscripts with valid PDF binaries successfully.`);
}

function getAdminTokens(req: any): string[] {
  const tokens: string[] = [];
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    tokens.push(authHeader.slice(7));
  }

  const cookieHeader = req.headers.cookie;
  if (typeof cookieHeader === 'string') {
    for (const cookie of cookieHeader.split(';')) {
      const [rawName, ...rawValue] = cookie.trim().split('=');
      if (rawName === ADMIN_COOKIE_NAME && rawValue.length) {
        try {
          tokens.push(decodeURIComponent(rawValue.join('=')));
        } catch {
          // Ignore malformed cookies and continue checking other credentials.
        }
      }
    }
  }
  return [...new Set(tokens)];
}

function resolveAdminRequest(req: any) {
  for (const token of getAdminTokens(req)) {
    let verified: jwt.JwtPayload | string;
    try {
      verified = jwt.verify(token, JWT_SECRET);
    } catch {
      continue;
    }

    if (typeof verified === 'string' || !verified.email) continue;
    const admin = findAdminByEmail(String(verified.email));
    if (admin) {
      return {
        token,
        user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      };
    }
  }
  return undefined;
}

// Authentication Middleware
function authenticateAdminToken(req: any, res: any, next: any) {
  const tokens = getAdminTokens(req);
  if (!tokens.length) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  const authenticated = resolveAdminRequest(req);
  if (!authenticated) {
    res.clearCookie(ADMIN_COOKIE_NAME);
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }

  req.admin = authenticated.user;
  req.adminToken = authenticated.token;
  return next();
}

function sanitizeFileName(value: unknown, fallback: string): string {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  return path.basename(value).replace(/[\r\n"]/g, '_').slice(0, 255) || fallback;
}

function decodeBase64Payload(value: unknown): Buffer | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const base64 = value.includes(',') ? value.slice(value.indexOf(',') + 1) : value;
  return Buffer.from(base64, 'base64');
}

const GALLERY_STORAGE_DIR = path.join(DATA_DIR, 'gallery');
const MAX_GALLERY_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_GALLERY_IMAGES_PER_UPLOAD = 20;
const SUPPORTED_GALLERY_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const SUPPORTED_GALLERY_IMAGE_FORMATS = new Set(['jpeg', 'png', 'webp']);

class GalleryHttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

const galleryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_GALLERY_IMAGE_BYTES,
    files: MAX_GALLERY_IMAGES_PER_UPLOAD,
    fields: 4,
    fieldSize: 256 * 1024,
    parts: MAX_GALLERY_IMAGES_PER_UPLOAD + 4,
  },
  fileFilter: (_req, file, callback) => {
    if (!SUPPORTED_GALLERY_IMAGE_TYPES.has(file.mimetype.toLowerCase())) {
      return callback(new GalleryHttpError(415, 'Only JPEG, PNG, and WebP gallery images are supported.'));
    }
    return callback(null, true);
  },
});

function withGalleryUpload(middleware: any) {
  return (req: any, res: any, next: any) => {
    middleware(req, res, (error: any) => {
      if (!error) return next();
      if (error instanceof GalleryHttpError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      if (error instanceof multer.MulterError) {
        const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        const message = error.code === 'LIMIT_FILE_SIZE'
          ? 'Each gallery image must be 12 MB or smaller.'
          : `Gallery upload failed: ${error.message}`;
        return res.status(status).json({ error: message });
      }
      console.error('Gallery upload middleware failed:', error);
      return res.status(400).json({ error: 'The gallery upload could not be processed.' });
    });
  };
}

function galleryCurrentYear(): number {
  return new Date().getFullYear();
}

function parseGalleryId(value: unknown, label: string): number {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new GalleryHttpError(400, `${label} must be a positive integer.`);
  }
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new GalleryHttpError(400, `${label} must be a positive integer.`);
  }
  return id;
}

function requireGalleryText(value: unknown, label: string, maximumLength: number): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new GalleryHttpError(400, `${label} is required.`);
  }
  const normalized = value.trim();
  if (normalized.length > maximumLength) {
    throw new GalleryHttpError(400, `${label} must be ${maximumLength} characters or fewer.`);
  }
  return normalized;
}

function optionalGalleryText(value: unknown, label: string, maximumLength: number): string {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value !== 'string') {
    throw new GalleryHttpError(400, `${label} must be text.`);
  }
  const normalized = value.trim();
  if (normalized.length > maximumLength) {
    throw new GalleryHttpError(400, `${label} must be ${maximumLength} characters or fewer.`);
  }
  return normalized;
}

function parseGalleryEventDate(value: unknown): { eventDate: string; eventYear: number } {
  if (typeof value !== 'string') {
    throw new GalleryHttpError(400, 'Event date is required.');
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new GalleryHttpError(400, 'Event date must use the YYYY-MM-DD format.');
  }

  const eventYear = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(0);
  parsed.setUTCHours(0, 0, 0, 0);
  parsed.setUTCFullYear(eventYear, month - 1, day);
  if (
    eventYear < 1 ||
    parsed.getUTCFullYear() !== eventYear ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new GalleryHttpError(400, 'Event date is not a valid calendar date.');
  }
  if (eventYear > galleryCurrentYear()) {
    throw new GalleryHttpError(400, `Gallery events cannot be created for a year after ${galleryCurrentYear()}.`);
  }
  return { eventDate: value, eventYear };
}

function parseGalleryEventInput(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new GalleryHttpError(400, 'Gallery event details are required.');
  }
  const input = value as Record<string, unknown>;
  const { eventDate, eventYear } = parseGalleryEventDate(input.eventDate);
  if (input.status !== 'ACTIVE' && input.status !== 'INACTIVE') {
    throw new GalleryHttpError(400, 'Gallery event status must be ACTIVE or INACTIVE.');
  }
  return {
    title: requireGalleryText(input.title, 'Event title', 180),
    description: optionalGalleryText(input.description, 'Event description', 5000),
    eventDate,
    eventYear,
    status: input.status as GalleryEventStatusValue,
  };
}

function hasOwn(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function parseGalleryImageInput(value: unknown, partial = false): GalleryImageMetadataUpdate {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new GalleryHttpError(400, 'Image metadata must be an object.');
  }
  const input = value as Record<string, unknown>;
  const parsed: GalleryImageMetadataUpdate = {};

  if (!partial || hasOwn(input, 'caption')) {
    parsed.caption = requireGalleryText(input.caption, 'Image caption', 500);
  }
  if (!partial || hasOwn(input, 'altText')) {
    parsed.altText = requireGalleryText(input.altText, 'Image alt text', 500);
  }
  if (!partial || hasOwn(input, 'displayOrder')) {
    if (!Number.isInteger(input.displayOrder) || Number(input.displayOrder) < 0 || Number(input.displayOrder) > 1_000_000) {
      throw new GalleryHttpError(400, 'Image display order must be a non-negative integer.');
    }
    parsed.displayOrder = Number(input.displayOrder);
  }
  for (const key of ['isFeatured', 'isActive'] as const) {
    if (!partial || hasOwn(input, key)) {
      if (typeof input[key] !== 'boolean') {
        throw new GalleryHttpError(400, `${key} must be true or false.`);
      }
      parsed[key] = input[key] as boolean;
    }
  }
  return parsed;
}

function parseGalleryPagination(query: any): { offset: number; limit: number } {
  const offset = query.offset === undefined ? 0 : Number(query.offset);
  const limit = query.limit === undefined ? 48 : Number(query.limit);
  if (!Number.isSafeInteger(offset) || offset < 0) {
    throw new GalleryHttpError(400, 'Gallery offset must be a non-negative integer.');
  }
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    throw new GalleryHttpError(400, 'Gallery limit must be between 1 and 100.');
  }
  return { offset, limit };
}

function galleryStorageKey(eventId: number, fileName: string): string {
  return path.posix.join('gallery', String(eventId), fileName);
}

function resolveGalleryStoragePath(storageKey: string): string {
  const normalized = storageKey.replace(/\\/g, '/');
  if (!normalized.startsWith('gallery/') || path.posix.isAbsolute(normalized)) {
    throw new Error('Invalid gallery storage path');
  }
  const absolutePath = path.resolve(DATA_DIR, ...normalized.split('/'));
  const root = path.resolve(GALLERY_STORAGE_DIR);
  const rootPrefix = `${root}${path.sep}`.toLowerCase();
  if (!absolutePath.toLowerCase().startsWith(rootPrefix)) {
    throw new Error('Invalid gallery storage path');
  }
  return absolutePath;
}

interface ProcessedGalleryImage {
  imageUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}

async function processGalleryImage(eventId: number, file: any): Promise<ProcessedGalleryImage> {
  if (!file?.buffer || !Buffer.isBuffer(file.buffer)) {
    throw new GalleryHttpError(400, 'A gallery image file is required.');
  }
  if (!SUPPORTED_GALLERY_IMAGE_TYPES.has(String(file.mimetype || '').toLowerCase())) {
    throw new GalleryHttpError(415, 'Only JPEG, PNG, and WebP gallery images are supported.');
  }

  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(file.buffer, {
      failOn: 'error',
      limitInputPixels: false,
    }).metadata();
  } catch (error: any) {
    const reason = String(error?.message || 'unknown decode error');
    console.warn(`Gallery image validation failed for ${String(file.originalname || 'unnamed image')}: ${reason}`);
    throw new GalleryHttpError(400, 'One of the selected images could not be decoded. Please use a valid JPEG, PNG, or WebP file.');
  }
  if (!metadata.format || !SUPPORTED_GALLERY_IMAGE_FORMATS.has(metadata.format)) {
    throw new GalleryHttpError(415, 'Only decoded JPEG, PNG, and WebP images are supported.');
  }
  if (
    !metadata.width || !metadata.height
  ) {
    throw new GalleryHttpError(400, 'Gallery image dimensions are invalid.');
  }

  const eventDirectory = path.join(GALLERY_STORAGE_DIR, String(eventId));
  await fs.promises.mkdir(eventDirectory, { recursive: true });
  const token = randomUUID();
  const imageUrl = galleryStorageKey(eventId, `${token}-full.webp`);
  const thumbnailUrl = galleryStorageKey(eventId, `${token}-thumb.webp`);
  const fullPath = resolveGalleryStoragePath(imageUrl);
  const thumbnailPath = resolveGalleryStoragePath(thumbnailUrl);

  try {
    const source = sharp(file.buffer, {
      failOn: 'error',
      limitInputPixels: false,
    }).rotate();
    const fullInfo = await source
      .clone()
      .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 88, effort: 4 })
      .toFile(fullPath);
    await source
      .clone()
      .resize({ width: 960, height: 960, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toFile(thumbnailPath);
    return {
      imageUrl,
      thumbnailUrl,
      width: fullInfo.width,
      height: fullInfo.height,
    };
  } catch (error) {
    await deleteStoredGalleryAssets([imageUrl, thumbnailUrl]);
    if (error instanceof GalleryHttpError) throw error;
    throw new GalleryHttpError(400, 'One of the selected gallery images could not be processed.');
  }
}

async function deleteStoredGalleryAssets(storageKeys: Array<string | undefined>): Promise<void> {
  for (const storageKey of storageKeys) {
    if (!storageKey) continue;
    try {
      await fs.promises.unlink(resolveGalleryStoragePath(storageKey));
    } catch (error: any) {
      if (error?.code !== 'ENOENT') {
        console.warn(`Could not remove gallery asset ${storageKey}:`, error);
      }
    }
  }
}

async function removeGalleryEventDirectoryIfEmpty(eventId: number): Promise<void> {
  const eventDirectory = path.join(GALLERY_STORAGE_DIR, String(eventId));
  try {
    await fs.promises.rmdir(eventDirectory);
  } catch (error: any) {
    if (error?.code !== 'ENOENT' && error?.code !== 'ENOTEMPTY') {
      console.warn(`Could not remove gallery event directory ${eventId}:`, error);
    }
  }
}

function galleryImageResponse(image: GalleryImageRecord) {
  const version = encodeURIComponent(image.updatedAt);
  return {
    ...image,
    imageUrl: `/api/gallery/images/${image.id}/file?v=${version}`,
    thumbnailUrl: `/api/gallery/images/${image.id}/thumbnail?v=${version}`,
  };
}

function galleryEventResponse(event: GalleryEventRecord, includeInactiveImages: boolean) {
  const images = listGalleryImagesForEvent(event.id, includeInactiveImages).map(galleryImageResponse);
  return { ...event, images, imageCount: images.length };
}

function buildGalleryYearResponse(year: number, offset: number, limit: number) {
  const rows = listPublicGalleryImagesByYear(year, limit, offset);
  const eventsById = new Map<number, any>();
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
        images: [],
      };
      eventsById.set(row.eventId, event);
    }
    event.images.push(galleryImageResponse(row));
  }
  const events = [...eventsById.values()].map(event => ({ ...event, imageCount: event.images.length }));
  const totalImages = countPublicGalleryImagesByYear(year);
  return {
    year,
    events,
    totalImages,
    hasMore: offset + rows.length < totalImages,
  };
}

function sendGalleryRouteError(res: any, error: unknown, operation: string) {
  if (error instanceof GalleryHttpError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  console.error(`Gallery ${operation} failed:`, error);
  return res.status(500).json({ error: `Failed to ${operation}.` });
}

async function serveGalleryAsset(req: any, res: any, thumbnail: boolean) {
  try {
    const id = parseGalleryId(req.params.id, 'Gallery image ID');
    const image = getGalleryImageWithEvent(id);
    const isPublic = image?.eventStatus === 'ACTIVE' && image.isActive;
    if (!image || (!isPublic && !resolveAdminRequest(req))) {
      return res.status(404).send('Gallery image not found');
    }

    const assetPath = resolveGalleryStoragePath(thumbnail ? image.thumbnailUrl : image.imageUrl);
    const stats = await fs.promises.stat(assetPath);
    if (!stats.isFile()) return res.status(404).send('Gallery image not found');

    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'Cache-Control',
      isPublic ? 'public, max-age=31536000, immutable' : 'private, no-store',
    );
    return res.sendFile(assetPath);
  } catch (error: any) {
    if (error instanceof GalleryHttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    if (error?.code === 'ENOENT') return res.status(404).send('Gallery image not found');
    console.error('Gallery image delivery failed:', error);
    return res.status(500).send('Gallery image could not be delivered');
  }
}

async function detectPdfPageCount(pdfData: Buffer): Promise<number> {
  const pdf = await PDFDocument.load(pdfData);
  const pageCount = pdf.getPageCount();
  if (pageCount < 1) throw new Error('The uploaded PDF has no pages');
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
  await fs.promises.mkdir(GALLERY_STORAGE_DIR, { recursive: true });

  const app = express();

  // Support large JSON payloads for base64 uploaded binary files (PDFs and cover images)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // --- API ROUTES ---

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', database: getDatabaseStatus() });
  });

  // Admin Login
  app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    const admin = typeof email === 'string' ? findAdminByEmail(email) : undefined;

    if (admin && typeof password === 'string' && bcrypt.compareSync(password, admin.passwordHash)) {
      const user = { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
      const token = jwt.sign(
        user,
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      res.cookie(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.json({ token, user });
    }
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  });

  app.get('/api/admin/me', authenticateAdminToken, (req: any, res) => {
    res.cookie(ADMIN_COOKIE_NAME, req.adminToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ user: req.admin });
  });

  app.post('/api/admin/logout', (_req, res) => {
    res.clearCookie(ADMIN_COOKIE_NAME);
    res.json({ success: true });
  });

  // Get Categories & Languages
  app.get('/api/categories', (_req, res) => {
    res.json(listCategories());
  });

  app.post('/api/categories', authenticateAdminToken, (req, res) => {
    const { name, description } = req.body;
    if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ error: 'Category name is required' });
    try {
      return res.status(201).json(createCategory(name.trim(), typeof description === 'string' ? description.trim() : ''));
    } catch {
      return res.status(409).json({ error: 'A category with this name already exists' });
    }
  });

  app.delete('/api/categories/:id', authenticateAdminToken, (req, res) => {
    if (!deleteCategory(req.params.id)) return res.status(404).json({ error: 'Category not found' });
    return res.json({ success: true });
  });

  app.get('/api/languages', (_req, res) => {
    res.json(listLanguages());
  });

  app.post('/api/languages', authenticateAdminToken, (req, res) => {
    const { name, code } = req.body;
    if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ error: 'Language name is required' });
    try {
      return res.status(201).json(createLanguage(name.trim(), typeof code === 'string' ? code.trim() : ''));
    } catch {
      return res.status(409).json({ error: 'A language with this name already exists' });
    }
  });

  app.delete('/api/languages/:id', authenticateAdminToken, (req, res) => {
    if (!deleteLanguage(req.params.id)) return res.status(404).json({ error: 'Language not found' });
    return res.json({ success: true });
  });

  // --- YEAR-WISE EVENT GALLERY ---

  app.get('/api/gallery/years', (_req, res) => {
    return res.json({ years: listAvailableGalleryYears(galleryCurrentYear()) });
  });

  app.get('/api/gallery', (req, res) => {
    try {
      const yearValue = req.query.year;
      if (typeof yearValue !== 'string' || !/^\d{4}$/.test(yearValue)) {
        throw new GalleryHttpError(400, 'A valid four-digit gallery year is required.');
      }
      const year = Number(yearValue);
      if (year < 1 || year > galleryCurrentYear()) {
        throw new GalleryHttpError(400, `Gallery year must not be later than ${galleryCurrentYear()}.`);
      }
      const { offset, limit } = parseGalleryPagination(req.query);
      return res.json(buildGalleryYearResponse(year, offset, limit));
    } catch (error) {
      return sendGalleryRouteError(res, error, 'load gallery');
    }
  });

  app.get('/api/gallery/current', (_req, res) => {
    try {
      const year = galleryCurrentYear();
      return res.json(buildGalleryYearResponse(year, 0, 24));
    } catch (error) {
      return sendGalleryRouteError(res, error, 'load the current-year gallery');
    }
  });

  app.get('/api/gallery/events', (req, res) => {
    const sendEvents = (includeInactive: boolean) => {
      const events = listGalleryEvents(includeInactive)
        .map(event => galleryEventResponse(event, includeInactive));
      return res.json(events);
    };

    if (req.query.isAdmin === 'true') {
      return authenticateAdminToken(req, res, () => sendEvents(true));
    }
    return sendEvents(false);
  });

  app.get('/api/gallery/events/:id', (req, res) => {
    try {
      const id = parseGalleryId(req.params.id, 'Gallery event ID');
      const event = getGalleryEvent(id);
      const isAdmin = Boolean(resolveAdminRequest(req));
      if (!event || (event.status !== 'ACTIVE' && !isAdmin)) {
        return res.status(404).json({ error: 'Gallery event not found' });
      }
      return res.json(galleryEventResponse(event, isAdmin));
    } catch (error) {
      return sendGalleryRouteError(res, error, 'load gallery event');
    }
  });

  app.post('/api/gallery/events', authenticateAdminToken, (req, res) => {
    try {
      const event = insertGalleryEvent(parseGalleryEventInput(req.body));
      return res.status(201).json({ ...event, images: [], imageCount: 0 });
    } catch (error) {
      return sendGalleryRouteError(res, error, 'create gallery event');
    }
  });

  app.put('/api/gallery/events/:id', authenticateAdminToken, (req, res) => {
    try {
      const id = parseGalleryId(req.params.id, 'Gallery event ID');
      if (!getGalleryEvent(id)) return res.status(404).json({ error: 'Gallery event not found' });
      const updated = updateGalleryEvent(id, parseGalleryEventInput(req.body));
      if (!updated) return res.status(404).json({ error: 'Gallery event not found' });
      return res.json(galleryEventResponse(updated, true));
    } catch (error) {
      return sendGalleryRouteError(res, error, 'update gallery event');
    }
  });

  app.delete('/api/gallery/events/:id', authenticateAdminToken, async (req, res) => {
    try {
      const id = parseGalleryId(req.params.id, 'Gallery event ID');
      const event = getGalleryEvent(id);
      if (!event) return res.status(404).json({ error: 'Gallery event not found' });
      const images = listGalleryImagesForEvent(id, true);
      if (!deleteGalleryEvent(id)) return res.status(404).json({ error: 'Gallery event not found' });
      await deleteStoredGalleryAssets(images.flatMap(image => [image.imageUrl, image.thumbnailUrl]));
      await removeGalleryEventDirectoryIfEmpty(id);
      return res.json({ success: true });
    } catch (error) {
      return sendGalleryRouteError(res, error, 'delete gallery event');
    }
  });

  app.post(
    '/api/gallery/events/:id/images',
    authenticateAdminToken,
    withGalleryUpload(galleryUpload.array('images', MAX_GALLERY_IMAGES_PER_UPLOAD)),
    async (req: any, res) => {
      const processed: ProcessedGalleryImage[] = [];
      try {
        const eventId = parseGalleryId(req.params.id, 'Gallery event ID');
        if (!getGalleryEvent(eventId)) return res.status(404).json({ error: 'Gallery event not found' });
        const files = Array.isArray(req.files) ? req.files : [];
        if (!files.length) throw new GalleryHttpError(400, 'Select at least one gallery image.');

        let rawMetadata: unknown;
        try {
          rawMetadata = JSON.parse(String(req.body?.metadata || ''));
        } catch {
          throw new GalleryHttpError(400, 'Gallery image metadata must be valid JSON.');
        }
        if (!Array.isArray(rawMetadata) || rawMetadata.length !== files.length) {
          throw new GalleryHttpError(400, 'Metadata must be supplied for every uploaded image.');
        }
        const metadata = rawMetadata.map(value => parseGalleryImageInput(value, false));

        for (const file of files) {
          processed.push(await processGalleryImage(eventId, file));
        }
        const inserted = insertGalleryImages(processed.map((asset, index) => ({
          eventId,
          imageUrl: asset.imageUrl,
          thumbnailUrl: asset.thumbnailUrl,
          caption: metadata[index].caption!,
          altText: metadata[index].altText!,
          displayOrder: metadata[index].displayOrder!,
          isFeatured: Boolean(metadata[index].isFeatured && metadata[index].isActive),
          isActive: metadata[index].isActive!,
          width: asset.width,
          height: asset.height,
        })));
        return res.status(201).json(inserted.map(galleryImageResponse));
      } catch (error) {
        await deleteStoredGalleryAssets(processed.flatMap(asset => [asset.imageUrl, asset.thumbnailUrl]));
        return sendGalleryRouteError(res, error, 'upload gallery images');
      }
    },
  );

  app.put('/api/gallery/images/:id', authenticateAdminToken, (req, res) => {
    try {
      const id = parseGalleryId(req.params.id, 'Gallery image ID');
      if (!getGalleryImage(id)) return res.status(404).json({ error: 'Gallery image not found' });
      const changes = parseGalleryImageInput(req.body, true);
      const updated = updateGalleryImageMetadata(id, changes);
      if (!updated) return res.status(404).json({ error: 'Gallery image not found' });
      return res.json(galleryImageResponse(updated));
    } catch (error) {
      return sendGalleryRouteError(res, error, 'update gallery image');
    }
  });

  app.post(
    '/api/gallery/images/:id/replace',
    authenticateAdminToken,
    withGalleryUpload(galleryUpload.single('image')),
    async (req: any, res) => {
      let processed: ProcessedGalleryImage | undefined;
      try {
        const id = parseGalleryId(req.params.id, 'Gallery image ID');
        const current = getGalleryImage(id);
        if (!current) return res.status(404).json({ error: 'Gallery image not found' });
        if (!req.file) throw new GalleryHttpError(400, 'Select a replacement gallery image.');

        processed = await processGalleryImage(current.eventId, req.file);
        const updated = replaceGalleryImageAsset(
          id,
          processed.imageUrl,
          processed.thumbnailUrl,
          processed.width,
          processed.height,
        );
        if (!updated) {
          await deleteStoredGalleryAssets([processed.imageUrl, processed.thumbnailUrl]);
          return res.status(404).json({ error: 'Gallery image not found' });
        }
        await deleteStoredGalleryAssets([current.imageUrl, current.thumbnailUrl]);
        return res.json(galleryImageResponse(updated));
      } catch (error) {
        if (processed) await deleteStoredGalleryAssets([processed.imageUrl, processed.thumbnailUrl]);
        return sendGalleryRouteError(res, error, 'replace gallery image');
      }
    },
  );

  app.put('/api/gallery/events/:id/images/reorder', authenticateAdminToken, (req, res) => {
    try {
      const eventId = parseGalleryId(req.params.id, 'Gallery event ID');
      if (!getGalleryEvent(eventId)) return res.status(404).json({ error: 'Gallery event not found' });
      const imageIds = req.body?.imageIds;
      if (
        !Array.isArray(imageIds) ||
        imageIds.some((id: unknown) => !Number.isSafeInteger(id) || Number(id) < 1)
      ) {
        throw new GalleryHttpError(400, 'imageIds must be an array of positive integer IDs.');
      }
      const existingIds = listGalleryImagesForEvent(eventId, true).map(image => image.id);
      const suppliedIds = new Set<number>(imageIds);
      if (
        suppliedIds.size !== imageIds.length ||
        imageIds.length !== existingIds.length ||
        existingIds.some(id => !suppliedIds.has(id))
      ) {
        throw new GalleryHttpError(400, 'Image order must contain every image in this event exactly once.');
      }
      return res.json(reorderGalleryImages(eventId, imageIds).map(galleryImageResponse));
    } catch (error) {
      return sendGalleryRouteError(res, error, 'reorder gallery images');
    }
  });

  app.delete('/api/gallery/images/:id', authenticateAdminToken, async (req, res) => {
    try {
      const id = parseGalleryId(req.params.id, 'Gallery image ID');
      const image = getGalleryImage(id);
      if (!image) return res.status(404).json({ error: 'Gallery image not found' });
      if (!deleteGalleryImage(id)) return res.status(404).json({ error: 'Gallery image not found' });
      await deleteStoredGalleryAssets([image.imageUrl, image.thumbnailUrl]);
      await removeGalleryEventDirectoryIfEmpty(image.eventId);
      return res.json({ success: true });
    } catch (error) {
      return sendGalleryRouteError(res, error, 'delete gallery image');
    }
  });

  app.get('/api/gallery/images/:id/file', (req, res) => serveGalleryAsset(req, res, false));
  app.get('/api/gallery/images/:id/thumbnail', (req, res) => serveGalleryAsset(req, res, true));

  // List Manuscripts
  app.get('/api/manuscripts', (req, res, next) => {
    const { search, category, language, yearFrom, yearTo, status, sortBy, isAdmin } = req.query;
    const includeUnpublished = isAdmin === 'true';

    const sendRecords = () => res.json(listManuscripts({
      search: typeof search === 'string' ? search : undefined,
      category: typeof category === 'string' ? category : undefined,
      language: typeof language === 'string' ? language : undefined,
      yearFrom: typeof yearFrom === 'string' && yearFrom !== '' ? Number(yearFrom) : undefined,
      yearTo: typeof yearTo === 'string' && yearTo !== '' ? Number(yearTo) : undefined,
      status: typeof status === 'string' ? status : undefined,
      sortBy: typeof sortBy === 'string' ? sortBy : undefined,
      includeUnpublished,
    }));

    if (includeUnpublished) {
      return authenticateAdminToken(req, res, sendRecords);
    }

    return sendRecords();
  });

  // Get single manuscript details
  app.get('/api/manuscripts/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const m = getManuscript(id);

    if (!m || (m.status !== ManuscriptStatus.PUBLISHED && !resolveAdminRequest(req))) {
      return res.status(404).json({ error: 'Manuscript not found' });
    }

    res.json(m);
  });

  // GET Manuscript PDF binary from SQLite BLOB storage
  app.get('/api/manuscripts/:id/pdf', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const manuscript = getManuscript(id);
    if (!manuscript || (manuscript.status !== ManuscriptStatus.PUBLISHED && !resolveAdminRequest(req))) {
      return res.status(404).send('PDF binary data not found in store');
    }
    const pdf = getManuscriptPdf(id);
    if (!pdf) {
      return res.status(404).send('PDF binary data not found in store');
    }

    res.setHeader('Content-Type', pdf.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(pdf.fileName)}"`);
    res.setHeader('Cache-Control', 'no-store, private');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Length', pdf.data.length);
    return res.send(pdf.data);
  });

  // GET Manuscript Cover Image Binary Stream
  app.get('/api/manuscripts/:id/cover', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const manuscript = getManuscript(id);
    if (!manuscript || (manuscript.status !== ManuscriptStatus.PUBLISHED && !resolveAdminRequest(req))) {
      return res.status(404).send('Cover image not found');
    }
    const cover = getManuscriptCover(id);
    if (!cover) {
      return res.status(404).send('Cover image not found');
    }

    res.setHeader('Content-Type', cover.coverType);
    res.setHeader('Content-Length', cover.data.length);
    return res.send(cover.data);
  });

  // Create new manuscript (Admin only)
  app.post('/api/manuscripts', authenticateAdminToken, async (req, res) => {
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
        mimeType,
      } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Manuscript title is required' });
      }

      if (status && !Object.values(ManuscriptStatus).includes(status)) {
        return res.status(400).json({ error: 'Invalid manuscript status' });
      }

      const actualFileName = fileName ? sanitizeFileName(fileName, 'manuscript.pdf') : undefined;
      let pdfBuffer = decodeBase64Payload(pdfData);
      const coverBuffer = decodeBase64Payload(coverData);

      if (!pdfBuffer) {
        // Generate a sample valid PDF if no PDF was uploaded
        pdfBuffer = await createSamplePdf(
          title,
          author || 'Unknown Scribe',
          Number(year) || 1200,
          language || 'Sanskrit',
          [`CHAPTER I: MANUSCRIPT PRESERVATION RECORD\nTitle: ${title}\nAuthor: ${author || 'Unknown'}\nDescription: ${description || 'Preserved document'}`]
        );
      }

      const detectedPageCount = await detectPdfPageCount(pdfBuffer);

      const newRecord = insertManuscript({
        title: String(title).trim(),
        author: author || 'Unknown Scribe',
        description: description || '',
        category: category || 'General Archives',
        language: language || 'Sanskrit',
        year: Number(year) || 1000,
        keywords: keywords || '',
        pageCount: detectedPageCount,
        fileName: actualFileName,
        mimeType: mimeType || 'application/pdf',
        coverType: coverType || 'image/jpeg',
        status: status || ManuscriptStatus.DRAFT,
      }, pdfBuffer, coverBuffer);

      return res.status(201).json(newRecord);
    } catch (e: any) {
      console.error('Error creating manuscript:', e);
      return res.status(500).json({ error: e.message || 'Failed to create manuscript' });
    }
  });

  // Edit manuscript (Admin only)
  app.put('/api/manuscripts/:id', authenticateAdminToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const current = getManuscript(id);

    if (!current) {
      return res.status(404).json({ error: 'Manuscript not found' });
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
        mimeType,
      } = req.body;

      if (status !== undefined && !Object.values(ManuscriptStatus).includes(status)) {
        return res.status(400).json({ error: 'Invalid manuscript status' });
      }

      const uploadedPdfBuffer = decodeBase64Payload(pdfData);
      const detectedPageCount = uploadedPdfBuffer
        ? await detectPdfPageCount(uploadedPdfBuffer)
        : current.pageCount;

      const record: ManuscriptRecord = {
        ...current,
        title: title !== undefined ? title : current.title,
        author: author !== undefined ? author : current.author,
        description: description !== undefined ? description : current.description,
        category: category !== undefined ? category : current.category,
        language: language !== undefined ? language : current.language,
        year: year !== undefined ? Number(year) : current.year,
        keywords: keywords !== undefined ? keywords : current.keywords,
        pageCount: detectedPageCount,
        fileName: fileName !== undefined ? sanitizeFileName(fileName, current.fileName) : current.fileName,
        mimeType: mimeType !== undefined ? mimeType : current.mimeType,
        coverType: coverType !== undefined ? coverType : current.coverType,
        status: status !== undefined ? status : current.status,
        updatedAt: new Date().toISOString(),
      };

      const updated = updateManuscript(record, uploadedPdfBuffer, decodeBase64Payload(coverData));
      return res.json(updated);
    } catch (e: any) {
      console.error('Error updating manuscript:', e);
      return res.status(500).json({ error: e.message || 'Failed to update manuscript' });
    }
  });

  // Toggle/Update Status (Admin only)
  app.patch('/api/manuscripts/:id/status', authenticateAdminToken, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    const m = getManuscript(id);
    if (!m) return res.status(404).json({ error: 'Manuscript not found' });

    if (!Object.values(ManuscriptStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid manuscript status' });
    }

    const updated = updateManuscript({ ...m, status, updatedAt: new Date().toISOString() });

    res.json(updated);
  });

  // Delete manuscript (Admin only)
  app.delete('/api/manuscripts/:id', authenticateAdminToken, (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!deleteManuscript(id)) return res.status(404).json({ error: 'Manuscript not found' });

    res.json({ success: true, message: 'Manuscript deleted successfully' });
  });

  // --- VITE DEV / PRODUCTION MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
