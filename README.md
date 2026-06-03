# Roomly — Mobile App

The **Roomly** mobile client for shared household management: shopping lists, fridge inventory, calendar, transactions, and member profiles. The app talks to the backend via **GraphQL** (Apollo Client) and REST where required (e.g. notifications).

| | |
|---|---|
| **Stack** | [Expo SDK 55](https://docs.expo.dev/) · React Native 0.83 · React 19 · TypeScript |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based) |
| **API** | GraphQL + JWT (refresh token) |
| **Platforms** | Android · iOS · Web (limited) |

---

## Table of contents

- [Features](#features)
- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [npm scripts](#npm-scripts)
- [Project structure](#project-structure)
- [Architecture](#architecture)
- [Design system](#design-system)
- [Backend](#backend)
- [Notifications (Expo Go vs dev build)](#notifications-expo-go-vs-dev-build)
- [Related repositories](#related-repositories)

---

## Features

- **Accounts & onboarding** — device-only (local) or email/password, create or join a household, profile with avatar and color
- **Shopping** — shared and private lists, product search (Open Food Facts), add with quantity and notes
- **Fridge** — shared and private inventory, barcode scan, product details with quantity editing
- **Calendar** — household events with attendees
- **Home** — activity summary and notifications
- **Settings** — join code, switch household, account (sign out / upgrade)
- **Profile** — view and customize appearance (avatar in the app header)

---

## Requirements

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- A running Roomly API (local or remote) — see [Backend](#backend)
- For emulators: [Android Studio](https://developer.android.com/studio) or Xcode (macOS, iOS)
- Optional: [Expo Go](https://expo.dev/go) on a physical device (with limitations — see [Notifications](#notifications-expo-go-vs-dev-build))

---

## Quick start

```bash
cd roomly-frontend-mobile
npm install
cp .env.example .env
```

Fill in `.env` (see below), then:

```bash
npx expo start
```

In the Expo terminal:

- **`a`** — Android emulator  
- **`i`** — iOS simulator (macOS only)  
- **QR code** — Expo Go on a phone (same network as your machine)

After changing `.env`, restart the bundler with a clean cache:

```bash
npx expo start -c
```

**Development build** (full native modules, including system notifications):

```bash
npx expo run:android
# or
npx expo run:ios
```

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_BASE_URL` | yes | API base URL **without** `/graphql`, e.g. `http://10.0.2.2:8080` (Android emulator → host) or `http://localhost:8080` |

Example `.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080
```

Configuration is loaded in `src/shared/config.ts`. A missing variable throws an explicit error at app startup.

---

## npm scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | `expo start --android` |
| `npm run ios` | `expo start --ios` |
| `npm run web` | Web target |
| `npm run lint` | ESLint (`eslint-config-expo`) |

Type-check (no emit):

```bash
npx tsc --noEmit
```

---

## Project structure

```
roomly-frontend-mobile/
├── app/                    # Expo Router — screens and layouts only
│   ├── (guest)/            # welcome, sign-in, sign-up
│   ├── (onboarding)/       # household + profile setup
│   ├── (tabs)/             # shopping, fridge, calendar, settings, …
│   ├── (modals)/           # add product, profile, switch household, …
│   ├── _layout.tsx         # root providers
│   └── index.tsx           # auth-based redirect
├── src/
│   ├── features/           # domain logic + feature UI
│   │   ├── auth/
│   │   ├── household/
│   │   ├── profile/
│   │   ├── product/        # search, scanner, add-product form
│   │   ├── shoppingList/
│   │   ├── inventory/
│   │   ├── calendar/
│   │   ├── home/
│   │   ├── settings/
│   │   └── notifications/
│   └── shared/             # theme, components, API, navigation, routes
├── assets/
├── .env.example
└── app.json
```

**Convention:** `app/` = routing; `src/features/` = business code; `src/shared/` = reusable building blocks.

---

## Architecture

### Navigation

- **Stack + tabs** — main tabs in `(tabs)/_layout.tsx` with custom `RoomlyTabBar` and `TabAppHeader` (#Roomly, avatar → profile).
- **Modals** — `presentation: "modal"` in `(modals)/_layout.tsx`; many screens use `TabAppHeader` with a back button instead of the default modal title.
- Routes are centralized in `src/shared/routes.ts`.

### Data

- **GraphQL** — `src/shared/api/apolloClient.ts` (auth link, automatic JWT refresh on 401/403).
- **REST** — selected endpoints (e.g. notifications) via `src/shared/api/http.ts`.
- Household session state: `HouseholdProvider`; tokens: Secure Store (`expo-secure-store`).

### Shared product module

`src/features/product/` powers add-product flows for both **Shopping** and **Fridge** (OFF search, result cards, `AddProductForm`, barcode scanner).

---

## Design system

Color tokens and UI rules live in the parent repo:

- [`../roomly-design.md`](../roomly-design.md) — source of truth (Figma → tokens)
- `src/shared/theme/colors.ts` — palette used in code (`colors.button`, `colors.field`, `colors.header`, …)
- `src/shared/theme/authScreenStyles.ts` — cards, shadows, and forms (onboarding, profile, settings)

New screens should use `colors` and `spacing` from the theme, not ad-hoc hex values.

---

## Backend

The app requires a running **ROOMLY API** (GraphQL at `{API_BASE_URL}/graphql`).

In this monorepo, the backend folder is for reference / maintained by the backend team:

- `../ROOMLY-API-main/` — see `README.md` and `docs/mutations.md`

Ensure CORS and the listen address allow connections from your emulator or device.

---

## Notifications (Expo Go vs dev build)

| Feature | Expo Go | Development build (`expo run:android` / iOS) |
|--------|---------|-----------------------------------------------|
| Home feed (REST) | Yes | Yes |
| Mark as read / mark all read | Yes | Yes |
| System tray banners (`expo-notifications`) | No (SDK limits; lazy import) | Yes, after permission grant |

To test in Expo Go: two sessions in one household, trigger a server-side notification, refresh **Home**. Full remote push from the server is not fully documented on the client yet.

---

## Related repositories

| Folder | Description |
|--------|-------------|
| `roomly-frontend-mobile/` | This project — mobile client |
| `ROOMLY-API-main/` | GraphQL API (reference copy) |
| `roomly-design.md` | Design system (monorepo root) |

---

## Development guidelines

1. New screen → file under `app/`, logic under `src/features/<domain>/`.
2. Colors and spacing → `src/shared/theme/`.
3. New route → add to `src/shared/routes.ts`.
4. GraphQL → queries next to the feature (`*Api.ts`), shared client in `shared/api`.
5. Before a PR: `npm run lint` and `npx tsc --noEmit`.

---

## License

Private Roomly team project. Contact repository maintainers for licensing and distribution.
