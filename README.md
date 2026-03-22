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

| Method | Endpoint             | Description             |
| ------ | -------------------- | ----------------------- |
| GET    | `/health`            | Server health check     |
| POST   | `/api/auth/register` | Register a new user     |
| POST   | `/api/auth/login`    | Login and receive token |
| POST   | `/api/entries`       | Create a new log entry  |
| GET    | `/api/entries`       | Get all log entries     |
| DELETE | `/api/entries/:id`   | Delete a log entry      |

## Local Development

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/yourname/devlog.git
cd devlog

# Install dependencies
npm install

# Start backend
npm run dev:backend
```

Backend runs on `http://localhost:5000`

| Part | Focus                                      | Status             |
| ---- | ------------------------------------------ | ------------------ |
| 1–2  | TypeScript foundation, Express stub API    | ✅ Part 1 complete |
| 3    | PostgreSQL + Prisma, real auth, entry CRUD | 🔜                 |
| 4    | Jest tests + React frontend scaffold       | 🔜                 |
| 5    | NestJS migration + entries UI              | 🔜                 |
| 6    | AI summary + dashboard                     | 🔜                 |
| 7–8  | Deploy + GitHub polish                     | 🔜                 |
| 9    | Open source contribution                   | 🔜                 |
| 10   | Resume rewrite + applications              | 🔜                 |

## Live Demo

Coming soon.
