# Tanpa Nama Studio

Bun monorepo for the public studio website, CMS admin, and CMS API.

## Structure

- `app/tanpanama-fe`: Astro public website.
- `app/tanpanama-admin`: TanStack Start CMS admin with TanStack Router/Form, shadcn/ui, Zustand theme mode, and a same-origin API proxy.
- `app/tanpanama-api`: Hono RPC API, Better Auth Google sign-in, Drizzle CMS schema, and D1 migrations.
- `packages/contracts`: shared Zod validation and project types.
- `alchemy.run.ts`: Alchemy stack for D1, R2, the API Worker, public Astro site, and admin Worker.

The API is a modular monolith: CMS and authentication stay in one Hono application and share one D1 database. See [architecture](docs/architecture/overview.md), [design context](docs/design/README.md), and [deployment setup](docs/operations/deployment.md).

Alchemy's Astro provider supplies the server adapter and production build during deploy; use `bun run dev:stack` for the same server-rendered setup locally.

## Commands

- `bun install`: install the workspace and prepare Lefthook.
- `bun run dev`: run the Astro website at `http://localhost:4321`.
- `bun run dev:admin`: run the TanStack admin at `http://localhost:3001`.
- `bun run dev:stack`: run the Alchemy local Cloudflare stack.
- `bun run ci`: lint with Ultracite/Biome, typecheck, and test.
- `bun run deploy`: build and deploy the production stack with Alchemy.

The public site is deployed at `https://tanpanama.alfanso.xyz` and the CMS admin at `https://admin.tanpanama.alfanso.xyz`. Create local `.env` files from the `.env.example` files. Never commit credentials. The API admin allowlist is the comma-separated `ADMIN_EMAILS` value; Google OAuth only admits verified emails on that list.

## Frontend slicing

The project-local [frontend-slicing skill](.agents/skills/frontend-slicing/SKILL.md) and supplied reference files under `docs/design/` guide screenshot-based frontend work. Hono skills are installed under `.agents/skills/`.
