# DriveWise — Smart TCO Calculator

Full-stack graduation project built entirely with **TypeScript** (strict mode).

## Architecture

| Layer | Stack |
|-------|-------|
| Frontend | React 19 + Vite + Tailwind CSS |
| Backend | Express + JWT + RBAC middleware |
| Shared Types | `types.ts` (root) |
| External APIs | Car Data API + Distance/Maps API (simulated service layers) |

## Quick Start

```bash
npm install
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

## Demo Credentials

| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| USER  | user@drivewise.app     | user123   |
| ADMIN | admin@drivewise.app    | admin123  |

Use the navbar buttons to switch roles live for evaluator demos.

## API Endpoints

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/login` | Public | Returns signed JWT |
| GET | `/api/vehicles` | Public (optional auth) | Car Data API catalog |
| POST | `/api/calculations/tco` | USER, ADMIN | TCO calculation via Distance API |
| GET | `/api/admin/users` | ADMIN only | User management |
| PATCH | `/api/admin/users/:id` | ADMIN only | Ban/modify users |
| PATCH | `/api/admin/fuel-price` | ADMIN only | Update global fuel price |
# DriveWise
