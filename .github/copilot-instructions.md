Project: Phaser PWA mini-games
Project name: TheGames

IMPORTANT: Update this file with details which will help AI assistants understand the project better.

Purpose

- Provide a single-file, machine- and human-readable set of instructions that help AI assistants (and future developers) understand the repository, developer workflow, constraints, and how to respond to prompts about this project.

High-level project summary

- Stack: Vite + Phaser 3 (JavaScript) for client-side mini-games. PWA support via vite-plugin-pwa and a simple service worker. No backend; data persisted locally (localStorage).
- Structure:
  - `index.html` — app shell and entry point
  - `src/main.js` — boots Phaser and registers scenes
  - `src/scenes/` — Phaser Scene modules (each mini-game)
  - `src/styles.css` — global styles
  - `manifest.webmanifest`, `sw.js` — PWA files
  - `vite.config.js` — Vite + PWA plugin configuration
    - `TheGames/vite.config.js` — Vite config in the subproject (server.host/port configured for the devcontainer)
  - `package.json` — scripts and dependencies
  - `.devcontainer/` and `devcontainer.json` — Dev Container configuration
  - `.github/workflows/gh-pages.yml` — optional deployment workflow

Environment & run commands (Dev Container)

- The repository is intended to be developed in a VS Code Dev Container configured for Node 18. The root `devcontainer.json` and `.devcontainer/devcontainer.json` will install dependencies automatically via the `postCreateCommand`.
- The repository is intended to be developed in a VS Code Dev Container configured for Node 18. The root `devcontainer.json` and `.devcontainer/devcontainer.json` will install dependencies automatically via the `postCreateCommand`. The devcontainer is configured to forward the dev server port (5173) and includes a `postAttachCommand` that prints the exact command(s) to run the project when you attach.

Common commands (run inside the Dev Container terminal or locally if you have Node 18+):

PowerShell examples (Windows) — adjust for bash on Linux/macOS if needed

```powershell
npm install        # install deps (devcontainer already runs this)
npm run dev        # start Vite dev server (hot reload) — from workspace root this forwards to the TheGames subproject and binds to 0.0.0.0:5173
# Or directly inside the subproject:
# npm --prefix TheGames run dev -- --host
npm run build      # build production bundle to dist/
npm run preview    # preview the production build (default port 4173)
npm run deploy     # publish dist/ to gh-pages (requires gh-pages and repo config)
```

Developer conventions and expectations for AI assistants

- Use JavaScript (not TypeScript) unless user explicitly requests conversion.
- Keep changes minimal and focused: prefer adding new files over large refactors unless requested.
- When modifying existing files, preserve formatting and style; keep edits atomic and include tests or smoke-checks when possible.
- Avoid adding or exposing secrets. If CI needs secrets (e.g. `VITE_BASE`), reference repository secrets rather than in-code constants.
- Respect the project's offline-first and small-bundle goals: prefer lightweight solutions and lazy-loading scenes to reduce initial payload.

Coding standards / patterns

- Phaser Scenes: export default a class extending `Phaser.Scene`. Keep scene responsibilities small: input, update loop, and UI for that game only.
- Asset paths: prefer `public/` or absolute root paths (e.g. `/icons/...`) so service worker and Vite handle them predictably.
- Persistence: small amounts of state (scores, prefs) -> `localStorage`. Larger data requires a backend (out of scope).
- Testing: add a minimal smoke test (manual) after edits: run `npm run dev`, open `http://localhost:5173`, and verify the scene loads and basic inputs work.

How to ask for new features or bug fixes (recommended prompt templates)

- Add a new mini‑game scene

  - "Add a new Phaser Scene named `WhackAMoleScene` that shows 3 holes and randomly spawns moles. A tap on a mole increases score. Persist high score to localStorage. Include scene file `src/scenes/WhackAMoleScene.js` and update `src/main.js` to register it. Keep it JavaScript and keep bundle size small."

- Improve responsiveness

  - "Make the ClickNumberScene responsive on small phones: scale fonts and center controls in portrait and landscape; ensure the game canvas remains fully visible without overflow. Edit `src/scenes/ClickNumberScene.js` and `src/styles.css`."

- Add physics with Matter.js

  - "Add Matter.js physics to `src/scenes/PhysicsScene.js` and show an example of a sprite falling and colliding with a ground body. Use CDN or npm dependency; prefer minimal install."

- Add sounds and assets

  - "Add click and success sound effects to ClickNumberScene. Place audio under `public/audio/` and preload them. Provide fallback/no-op if audio is unavailable."

- Convert to TypeScript
  - "Convert the codebase to TypeScript: update config files, rename `.js` to `.ts`, and add minimal type annotations for Phaser scenes. Provide migration steps."

What to include in code-change responses

- A short summary of the change (1–2 lines).
- Files added / modified (list of paths with purpose for each).
- Commands to run locally to verify (dev/build/preview), with PowerShell examples for Windows.
- Any follow-ups required (assets needed, secrets to set, CI changes).

Quality gate checklist for PRs

- Dev server starts (`npm run dev`) without runtime errors in console.
- Production build succeeds (`npm run build`) producing `dist/`.
- Service worker registers (in production preview) without fatal errors.
- Quick manual gameplay smoke test passes (open app and play the modified/added scene).

Security & privacy reminders

- Do not add secrets or credentials to repository files. Use GitHub secrets for CI.
- LocalStorage is not secure for sensitive data; don't store personal data or secrets.

CI / Deployment notes

- The repository includes `gh-pages` deploy support and a GitHub Actions workflow `/.github/workflows/gh-pages.yml` that builds and publishes `dist/` to GitHub Pages on `main`. The workflow expects an optional `VITE_BASE` secret if the site will be served under a subpath. Do not hard-code repo-specific bases.

Helpful context for the default scene (ClickNumberScene)

- The sample scene cycles a displayed number every 400ms. The player taps the screen to score if the visible number equals a target. Score and lives are shown. High score persists to `localStorage` under key `click-number-highscore`.

Prompt examples to avoid (anti-patterns)

- "Make the app call an external API to store scores" — repository is client-only by design; such requests require a backend and additional security/privacy work.
- "Add secrets or API keys in code" — never include.

Recommended next steps for maintainers opening a new chat/PR

1. Provide the exact feature request or bug description.
2. Specify the target file(s) and whether JS or TS is preferred.
3. Provide any assets (icons, audio) or say if placeholders are acceptable.
4. Ask for a smoke test to be performed and include any device/browser constraints.

Contact & maintainers notes

- If the repository gains many games or complex features, consider migrating to a modular loader and lazy-loading scenes to keep the initial bundle minimal.

End of instructions — keep this file updated as the project evolves.
