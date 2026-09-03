# Reset Launchpad

A modern personal bookmark dashboard with Google sign-in and cloud sync. Organize links into themed folders, manage a daily to-do list, and access your workspace from any device.

## Stack

- **React 18** + **TypeScript** for the UI
- **Vite** for dev server and build
- **Tailwind CSS** + **shadcn/ui-style** primitives (Radix UI under the hood)
- **React Router** for routing with route-level code splitting
- **Zustand** for workspace and UI state
- **Firebase Auth** (Google) + **Firestore** for cloud sync
- **lucide-react** for icons (with **Font Awesome 6** for folder icons)

## Project structure

```
src/
├── main.tsx                    # Entry: mounts router + theme + login overlay
├── App.tsx                     # Authenticated layout (header, gradient glow, outlet)
├── router.tsx                  # Route definitions with lazy loading
├── index.css                   # Tailwind layers + design tokens
├── lib/                        # Pure utilities (cn, date helpers)
├── types/                      # Domain types (workspace, auth)
├── services/firebase/          # Firebase config + auth + workspace persistence
├── stores/                     # Zustand stores (workspace data, dashboard UI state)
├── components/
│   ├── ui/                     # shadcn-style primitives (Button, Dialog, etc.)
│   ├── layout/                 # AppHeader, SearchBar, SyncIndicator
│   └── shared/                 # ConfirmDialog hook
├── features/                   # Feature modules, one folder per concern
│   ├── auth/                   # LoginOverlay, useAuth, AuthGuard
│   ├── theme/                  # ThemeProvider, useTheme, ThemeToggle
│   ├── todos/                  # Daily to-do section + hook
│   ├── dashboard/              # Folder accordion, link cards, modals, themes
│   └── settings/               # Backup/restore
└── pages/                      # Route-level pages (Settings, NotFound)
```

## Getting started

```bash
# 1. Install
npm install

# 2. Configure Firebase (optional - defaults match the Reset Launchpad project)
cp .env.example .env.local
# Edit .env.local if you want to point at a different Firebase project.

# 3. Run
npm run dev
# Opens http://localhost:3000

# 4. Build
npm run build
npm run preview
```

## Local Google sign-in

Firebase blocks sign-in from unauthorized domains. For local dev:

1. **Firebase Console → Authentication → Settings → Authorized domains:** add `localhost` (and `127.0.0.1` if you use that).
2. **Google Cloud → Credentials → your Web OAuth client → Authorized JavaScript origins:** add `http://localhost:3000` (and `http://127.0.0.1:3000` if used).
3. Open `http://localhost:3000` in Chrome/Edge — not VS Code's Simple Browser (it blocks popups).

## Firestore data path

Workspace state is stored at:

```
artifacts/{VITE_APP_ID}/users/{uid}/data/state
```

The full document is overwritten on each save (small payloads, single device, single user).

## What's coming next

- AI integrations (smart folder suggestions, link summaries, daily planner)
- Additional service integrations (Pocket import, Notion sync, browser extension)
- Shared workspaces and real-time collaboration
