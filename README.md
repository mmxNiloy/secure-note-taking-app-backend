# Secure Note-Taking App — Backend

REST API for a secure note-taking platform with JWT authentication, role-based access control (user / admin), cursor pagination, and MongoDB aggregations.

Built with **NestJS**, **MongoDB (Mongoose)**, **Passport JWT**, and **bcryptjs**.

## Features

- Auth: register, login, refresh tokens, current user profile
- Users: admin CRUD, self profile update, group-by-interests aggregation
- Notes: private notes with owner RBAC (users manage own; admins can view/manage all)
- Posts: public feed for authenticated users; author (or admin) can update/delete
- Aggregations:
  - `GET /api/users/by-interests` — group users by interests (`$unwind` / `$group`)
  - `GET /api/users/:id/posts` — posts for a user via `$lookup`
- Cursor-based pagination on list endpoints
- Indexed schemas (`schema.index`) for list, read, and aggregation paths
- Swagger docs at `/api/docs`

## Tech stack

| Layer | Choice |
| --- | --- |
| Runtime | Node.js |
| Framework | NestJS 11 |
| Database | MongoDB + Mongoose 9 |
| Auth | JWT (access + refresh), Passport |
| Passwords | bcryptjs |
| Package manager | pnpm |
| Docs | Swagger / OpenAPI |

## Requirements

- Node.js 20+ (recommended)
- pnpm
- MongoDB (local or Atlas)

## Project structure

```
src/
├── main.ts                 # Bootstrap, ValidationPipe, Swagger
├── app.module.ts
├── config/                 # Env configuration + Joi validation
├── common/
│   ├── decorators/         # Response / roles / current-user helpers
│   ├── dto/                # API envelope + cursor pagination
│   ├── filters/            # Global exception filter
│   ├── guards/             # JWT + roles guards
│   ├── interceptors/       # Success response envelope
│   └── pipes/              # ObjectId validation
├── modules/
│   ├── auth/               # Register, login, refresh, me
│   ├── user/               # User CRUD + aggregations
│   ├── note/               # Private notes CRUD
│   └── post/               # Public posts CRUD
└── scripts/
    └── seed-admin.ts       # Idempotent admin upsert
```

## Setup

```bash
pnpm install
cp .env.example .env
```

Edit `.env` with your MongoDB URI and JWT secrets:

```env
PORT=5000
DB_URI=mongodb://localhost:27017/secure-note-taking-app-db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
ADMIN_NAME=Admin
```

Seed the admin user (idempotent):

```bash
pnpm seed:admin
```

## Run

```bash
# development (watch)
pnpm start:dev

# production build + run
pnpm build
pnpm start:prod
```

API base URL: `http://localhost:5000/api`  
Swagger UI: `http://localhost:5000/api/docs`

## Roles & permissions

| Action | User | Admin |
| --- | --- | --- |
| Auth (register / login / me) | yes | yes |
| Manage own notes | yes | yes |
| View / manage all notes | no | yes |
| List / create / delete users | no | yes |
| Create posts / list posts | yes | yes |
| Update / delete own posts | yes | yes |
| Update / delete any post | no | yes |
| Aggregations (interests, user posts) | yes (authenticated) | yes |

## Main API routes

All routes are under `/api`. Protected routes need `Authorization: Bearer <accessToken>`.

### Auth

| Method | Path | Access |
| --- | --- | --- |
| `POST` | `/auth/register` | Public |
| `POST` | `/auth/login` | Public |
| `POST` | `/auth/refresh` | Refresh token body |
| `GET` | `/auth/me` | JWT |

### Users

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/users` | Admin (cursor paginated) |
| `POST` | `/users` | Admin |
| `GET` | `/users/by-interests` | JWT |
| `GET` | `/users/:id/posts` | JWT (`$lookup`) |
| `GET` / `PATCH` | `/users/:id` | Self or admin |
| `DELETE` | `/users/:id` | Admin |

### Notes

| Method | Path | Access |
| --- | --- | --- |
| `GET` / `POST` | `/notes` | JWT (list = own, or all for admin) |
| `GET` / `PATCH` / `DELETE` | `/notes/:id` | Owner or admin |

### Posts

| Method | Path | Access |
| --- | --- | --- |
| `GET` / `POST` | `/posts` | JWT |
| `GET` | `/posts/:id` | JWT |
| `PATCH` / `DELETE` | `/posts/:id` | Author or admin |

### Pagination

List endpoints accept query params:

- `cursor` — opaque cursor from previous `meta.nextCursor` (optional)
- `limit` — page size (default `10`, max `100`)

Response meta shape:

```json
{
  "nextCursor": "...",
  "hasMore": true,
  "limit": 10
}
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm start:dev` | Dev server with watch |
| `pnpm build` | Compile to `dist/` |
| `pnpm start:prod` | Run compiled app |
| `pnpm seed:admin` | Upsert admin from `ADMIN_*` env |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit tests |

## Indexes

Indexes are declared with `Schema.index` in:

- `src/modules/user/schema/user.schema.ts` — email (unique), interests, createdAt+_id
- `src/modules/note/schema/note.schema.ts` — ownerId+createdAt+_id, createdAt+_id
- `src/modules/post/schema/post.schema.ts` — authorId, createdAt+_id

## License

UNLICENSED (private interview / project use).
