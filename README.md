# Archivalia

Archivalia is a React and Express manuscript archive. Application records and uploaded files are persisted in SQLite.

## Local development

Requires Node.js 22.5 or newer.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set a strong `JWT_SECRET` and initial admin password.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

The default database is `.data/archive.sqlite`. Set `DATABASE_PATH` to use a different file and `PORT` to use another port.

## Stored data

SQLite stores:

- manuscript metadata, publishing status, and timestamps
- PDF and cover-image bytes as BLOBs
- categories and languages
- administrator accounts with bcrypt password hashes

On the first database startup, existing `.data/*.json`, `.data/pdfs`, and `.data/covers` content is imported transactionally. The legacy files are left in place as a backup and are not read again after the database contains manuscripts.

## Production

Build with `npm run build` and start with `npm start`.

SQLite is a single-file database. Deploy `.data/archive.sqlite` on a persistent volume and run one application instance. For multiple instances or platforms with ephemeral filesystems, use a shared server database such as PostgreSQL before deploying; a local SQLite file will not survive replacement of an ephemeral container.
