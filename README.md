# TheGames

Phaser + Vite PWA mini-games project.

This README explains how to run the project in the VS Code Dev Container and locally, where important files live, and a few troubleshooting tips.

## Prerequisites

- Node 18+ (the devcontainer image already includes Node)
- VS Code with Remote - Containers (optional, recommended)

## Project layout (important files)

- `TheGames/` - the Vite + Phaser subproject (contains the actual app)
- `TheGames/vite.config.js` - explicit dev server config (binds to host and uses port 5173)
- `package.json` (root) - convenience scripts that forward to `TheGames/`:
  - `npm run dev` -> starts the subproject dev server and binds to 0.0.0.0:5173
  - `npm run build` -> builds the subproject
  - `npm run preview` -> previews the built site

## Running in the Dev Container (recommended)

1. Open the repository in VS Code and reopen in the Dev Container.
2. After the container is created, the devcontainer `postCreateCommand` will install subproject dependencies.
3. When you attach, the devcontainer runs a `postAttachCommand` that prints the commands to run the project. To start the dev server manually run:

```bash
# from the workspace root (recommended)
npm run dev

# or run directly inside the subproject (equivalent):
npm --prefix TheGames run dev -- --host
```

4. Open your browser to http://localhost:5173 (the devcontainer forwards that port).

## Running locally (without devcontainer)

1. Install dependencies for the subproject:

```bash
npm --prefix TheGames install
```

2. Start the dev server (from root or subproject):

```bash
npm run dev
# or
npm --prefix TheGames run dev -- --host
```

3. Open http://localhost:5173

## Build & Preview

```bash
# build
npm run build

# preview the production build
npm run preview
```

## Troubleshooting

- If the browser is stuck loading:

```bash
# check whether something is listening on port 5173
ss -ltnp | grep 5173 || true

# find the process and kill it (if you are sure)
lsof -i :5173
# kill the process reported (use the PID from lsof output)
```

- Vite will fail to start if port 5173 is already in use because the subproject `vite.config.js` sets `strictPort: true`. Use a different port with `--port` or stop the conflicting process.

## Where to look for changes

- Scenes and game code: `TheGames/src/` (add new scenes under `src/scenes/`)
- Public assets: `TheGames/public/`
- PWA plugin: if you enable it, configure in `TheGames/vite.config.js`

## Notes for maintainers

- Keep changes minimal and focused; prefer adding new scenes over large refactors.
- The devcontainer forwards port 5173 to the host so the browser can access the dev server.

If you'd like, I can add a `tasks.json` to automate starting the dev server from VS Code or change the devcontainer to auto-start the dev server on attach.
