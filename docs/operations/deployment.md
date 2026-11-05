# Cloudflare Deployment

## Local configuration

Ignored local `.env` files are already scaffolded. Fill them from the examples:

- Repository root: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, and `ALCHEMY_HOME=.alchemy` for ignored local Alchemy state.
- `app/tanpanama-api/.env`: Google OAuth credentials, `BETTER_AUTH_SECRET`, `ADMIN_EMAILS`, and `PUBLIC_SITE_URL`.
- `app/tanpanama-fe/.env`: local `PUBLIC_API_URL`; production API URL is bound by Alchemy.
- `app/tanpanama-admin/.env`: local `VITE_API_URL`; production API URL is bound by Alchemy.

Never commit `.env` files. Use the same variable names as GitHub Actions secrets for CI deployment.

## First deployment and URL binding

1. Create a Cloudflare API token scoped to the deployment account with Workers Scripts Write, D1 Write, Workers R2 Storage Write, and Secrets Store Write permissions. Alchemy uses Secrets Store to create and retrieve credentials for its remote state store. Set the account ID and token in the root `.env`.
2. Register `https://admin-tanpanama.alfanso.xyz/api/auth/callback/google` as the Google OAuth redirect URI. Set both Google credentials and the comma-separated authorized admin emails in `app/tanpanama-api/.env`; a random `BETTER_AUTH_SECRET` is already generated there.
3. Confirm the Cloudflare account already has the `alfanso.xyz` zone and all required values are non-empty, then run `bun run deploy`. Alchemy creates D1 and a private R2 bucket, applies SQL migrations, then deploys the API, Astro site, and TanStack Start admin at `tanpanama.alfanso.xyz` and `admin-tanpanama.alfanso.xyz`.
4. Alchemy binds the deployed API URL to both sites; Alchemy derives the API's trusted admin origin and Better Auth base URL from the admin site domain.
5. Check `https://tanpanama.alfanso.xyz/api/health`, the public homepage, `https://admin-tanpanama.alfanso.xyz`, and Google sign-in. Upload a test image from the CMS and confirm its public API URL is saved in the project's `image_url` column.

CMS image URLs use the deployed API Worker route `/api/media/:key`. The R2 bucket stays private; the API allows public reads only for generated UUID image keys and restricts writes to authorized CMS admins.

Configure GitHub Actions secrets with the same Cloudflare, Google, auth, admin-email, and site URL names before enabling the deployment workflow. The workflow deploys from `main`; change that branch only if the repository's integration branch is configured differently.
