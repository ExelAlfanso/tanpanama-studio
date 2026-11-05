# Tanpa Nama Studio — Agent Guidance

- Use Bun workspaces and the scripts in the root `package.json`.
- For screenshot-based interface work, load `.agents/skills/frontend-slicing/SKILL.md`, `docs/design/design.md`, and `docs/design/SKILL.md` before editing.
- The screenshot in `docs/design/reference/tanpanama-homepage.png` is the visual reference. Keep design tokens in sync with `docs/design/design.md`.
- Keep domain behavior in the Hono API modules. Validate and authorize requests on the server; shared types do not replace runtime validation.
- Keep secrets in ignored `.env` files or Cloudflare bindings. Never commit, print, or bundle their values.
- Use the project's `feat/`, `fix/`, `docs/`, or `chore/` task branch and self-review the complete diff. Do not commit or push unless the user explicitly requests it.
