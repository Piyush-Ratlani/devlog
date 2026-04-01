# Contributing to DevLog

Thank you for your interest in contributing to DevLog.

## Tech Stack

- **Backend:** NestJS, TypeScript, PostgreSQL, Prisma ORM
- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Testing:** Jest + Supertest (backend), Vitest + RTL (frontend)
- **Auth:** JWT with refresh token rotation

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- PostgreSQL 16
- npm >= 10.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/yourname/devlog.git
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

# Start backend (from root)
cd ../..
npm run dev:backend

# Start frontend (from root, new terminal)
npm run dev:frontend
```

## Development

- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:5173`
- Prisma Studio: `cd apps/backend && npx prisma studio`

## Running Tests

```bash
# Backend tests
cd apps/backend
npm test

# Frontend tests
cd apps/frontend
npm test
```

## Project Structure

```
devlog/
├── apps/
│   ├── backend/          # NestJS API
│   └── frontend/         # React app
└── packages/
    └── shared/           # Shared TypeScript types
```

## Pull Request Guidelines

- One feature or fix per PR
- All tests must pass
- Follow existing code style
- Update README if adding new features or endpoints

## Commit Convention

This project follows [Conventional Commits](https://conventionalcommits.org):

- `feat:` new feature
- `fix:` bug fix
- `chore:` tooling, config, dependencies
- `test:` adding or updating tests
- `docs:` documentation changes
- `refactor:` code changes without behavior change

