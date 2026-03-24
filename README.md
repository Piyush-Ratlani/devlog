# DevLog

A full-stack developer activity tracker built with TypeScript, NestJS, PostgreSQL, and React.

## Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Recharts, Vite
- **Backend:** NestJS, TypeScript, PostgreSQL, Prisma ORM
- **Auth:** JWT with refresh tokens
- **AI:** Claude API for weekly summary generation
- **Deploy:** Railway (backend + DB), Vercel (frontend)
- **CI:** GitHub Actions

## Features

- Log daily work entries with hours, project, tags, and mood
- Filter entries by date range and tags
- Dashboard with weekly hours chart, tag frequency, and mood trends
- AI-generated weekly summary with highlights and risks

## API Endpoints

### Auth


| Method | Endpoint             | Auth   | Description                                  |
| ------ | -------------------- | ------ | -------------------------------------------- |
| POST   | `/api/auth/register` | No     | Register a new user                          |
| POST   | `/api/auth/login`    | No     | Login, receive access token + refresh cookie |
| POST   | `/api/auth/refresh`  | Cookie | Get new access token via refresh token       |
| POST   | `/api/auth/logout`   | Cookie | Logout and invalidate refresh token          |


### Entries


| Method | Endpoint           | Auth   | Description                        |
| ------ | ------------------ | ------ | ---------------------------------- |
| POST   | `/api/entries`     | Bearer | Create a new log entry             |
| GET    | `/api/entries`     | Bearer | Get all entries (supports filters) |
| DELETE | `/api/entries/:id` | Bearer | Delete an entry                    |


### Filters (GET /api/entries)


| Query Param | Example            | Description                      |
| ----------- | ------------------ | -------------------------------- |
| `startDate` | `2026-03-01`       | Filter from date                 |
| `endDate`   | `2026-03-22`       | Filter to date                   |
| `tags`      | `typescript,react` | Filter by tags (comma separated) |
| `project`   | `DevLog`           | Filter by project name           |


### Health


| Method | Endpoint  | Description         |
| ------ | --------- | ------------------- |
| GET    | `/health` | Server health check |


## Project Structure

```
devlog/
├── apps/
│   ├── backend/
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # Database models
│   │   │   ├── seed.ts           # Development seed data
│   │   │   └── migrations/       # Migration history
│   │   └── src/
│   │       ├── config/           # Env config, Prisma client
│   │       ├── controllers/      # HTTP request handlers
│   │       ├── middleware/        # Auth, validation, error handler
│   │       ├── routes/           # Route definitions
│   │       ├── schemas/          # Zod validation schemas
│   │       ├── services/         # Business logic
│   │       ├── types/            # Backend-specific types
│   │       └── utils/            # JWT utilities
│   └── frontend/                 # React + Vite (part 4)
└── packages/
    └── shared/                   # Shared TypeScript types
        └── src/
            └── types/            # Auth, Entry, Summary types
```

## Database Schema

- **User** - email, name, hashed password
- **Entry** - date, hours, project, mood, notes, tags (many-to-many)
- **Tag** - shared across entries, connectOrCreate pattern
- **RefreshToken** - stored in DB for rotation and invalidation
- **WeeklySummary** - AI-generated weekly summary (part 6)

## Auth Flow

- Register/Login → receive `accessToken` (15m) in body + `refreshToken` (7d) as httpOnly cookie
- Send `accessToken` in `Authorization: Bearer <token>` header for protected routes
- On expiry → POST `/api/auth/refresh` → new access token + rotated refresh token
- Logout → refresh token deleted from DB, cookie cleared

## Local Development

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/Piyush-Ratlani/devlog.git
cd devlog

# Install dependencies
npm install

# Set up environment variables
cp apps/backend/.env.example apps/backend/.env
# Edit .env with your database credentials

# Run database migrations
cd apps/backend
npx prisma migrate dev

# Seed development data
npx prisma db seed

# Start backend
npm run dev:backend
```

Backend runs on `http://localhost:5000`

### Dev Credentials (after seeding)

```
Email:    dev@devlog.com
Password: password123
```


| Part | Focus                                      | Status     |
| ---- | ------------------------------------------ | ---------- |
| 1–2  | TypeScript foundation, Express stub API    | ✅ Complete |
| 3    | PostgreSQL + Prisma, real auth, entry CRUD | ✅ Complete |
| 4    | Jest tests + React frontend scaffold       | 🔜 Up next |
| 5    | NestJS migration + entries UI              | 🔜         |
| 6    | AI summary + dashboard                     | 🔜         |
| 7–8  | Deploy + GitHub polish                     | 🔜         |
| 9    | Open source contribution                   | 🔜         |
| 10   | Resume rewrite + applications              | 🔜         |


## Live Demo

Coming soon.