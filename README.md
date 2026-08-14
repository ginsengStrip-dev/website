# Archivalia

Archivalia is a React and Express manuscript archive. Application records and uploaded files are persisted in SQLite.

## Local development

Requires Node.js 22.5 or newer.

1. Install dependencies with `npm.cmd install`.
2. Run `npm.cmd run dev`.
3. Open `http://localhost:3000`.

The default database is `.data/archive.sqlite`. Set `DATABASE_PATH` to use a different file and `PORT` to use another port.

## Stored data

SQLite stores:

- manuscript metadata, publishing status, and timestamps
- PDF and cover-image bytes as BLOBs
- categories and languages
- administrator accounts with bcrypt password hashes

The Event Gallery keeps relational event and image metadata in the same SQLite database. Optimized WebP display images and thumbnails are stored under `.data/gallery`, with only relative storage paths saved in SQLite.

On the first database startup, existing `.data/*.json`, `.data/pdfs`, and `.data/covers` content is imported transactionally. The legacy files are left in place as a backup and are not read again after the database contains manuscripts.

## Production

Build with `npm.cmd run build` and start with `npm.cmd start`.

Deploy the complete `.data` directory on persistent storage and run one application instance. Backups must include both `.data/archive.sqlite` and `.data/gallery`. For multiple instances or ephemeral hosting, move the database and Gallery assets to shared services first.

