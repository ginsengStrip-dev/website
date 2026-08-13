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

On the first database startup, existing `.data/*.json`, `.data/pdfs`, and `.data/covers` content is imported transactionally. The legacy files are left in place as a backup and are not read again after the database contains manuscripts.


