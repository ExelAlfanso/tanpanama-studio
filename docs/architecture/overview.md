# Tanpa Nama Studio Architecture Overview

## System shape

This Bun monorepo contains three deployable applications and one shared contract package. The backend is a modular monolith: CMS behavior stays in one Hono Worker and is split by responsibility inside that app. The public Astro site, TanStack Start CMS admin, and API deploy independently; the API is not split into domain microservices.

```text
app/
├── tanpanama-fe/       # Astro public site
├── tanpanama-admin/    # TanStack Start CMS admin, shadcn/ui, API proxy
└── tanpanama-api/      # Hono API, Better Auth, CMS modules, Drizzle/D1 schema
packages/
└── contracts/          # Zod validation and browser-safe project types
docs/
.github/workflows/      # CI and Alchemy deployment
alchemy.run.ts          # D1, R2, API, public-site, and admin Workers
```

## Boundaries

- `tanpanama-fe` renders the marketing pages on the server at `tanpanama.alfanso.xyz`.
- `tanpanama-admin` runs the CMS at `admin-tanpanama.alfanso.xyz`. TanStack Start routes all `/api/*` requests through a same-origin server proxy so OAuth callbacks and session cookies remain on the admin hostname. TanStack Router owns file routes, TanStack Form owns the project editor, shadcn/ui provides admin components, and Zustand persists the color theme.
- `tanpanama-api` owns authentication, authorization, project validation, and writes. Public project reads are open; admin CRUD and uploads check both Better Auth session and the configured email allowlist on every request.
- `packages/contracts` owns Zod request/response schemas shared across the boundary. The admin imports the Hono `AppType` with a type-only import for RPC inference; no backend implementation enters the browser bundle.
- Cloudflare D1 is shared by Better Auth and the Drizzle CMS repository. Its `image_url` column stores the public API URL for each uploaded CMS image.
- CMS uploads are written to a private Cloudflare R2 bucket. The API serves public reads at `/api/media/:key`; only UUID image keys are readable, and uploads require an authorized admin session. Alchemy binds the bucket to the API Worker.

Modules call each other in-process. Add a service boundary only for a concrete scaling, ownership, or security requirement and record it in an ADR.

## Trust boundaries

The browser is untrusted. The API validates write bodies at runtime and enforces authorization server-side. Google OAuth only accepts verified addresses in `ADMIN_EMAILS`; hiding admin controls in the UI is not an access control. Cloudflare credentials, Google client secret, and Better Auth secret remain in ignored local `.env` files or protected CI secrets and are bound only to the API Worker.

## Environments and deployment

Alchemy owns the D1 database, private R2 bucket, API Worker, public Astro Worker, and admin TanStack Start Worker in one dependency graph. D1 is migrated first, the API binds D1, R2, and Google/Auth settings, and both sites bind the API URL. Astro reads `PUBLIC_API_URL` from `cloudflare:workers`; the admin proxy reads `API_URL` server-side. See [deployment setup](../operations/deployment.md).
