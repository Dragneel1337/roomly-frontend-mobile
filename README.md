# ROOMLY — Mobile App

[![Expo](https://img.shields.io/badge/Expo_SDK-55-000020.svg)](https://docs.expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.83-61DAFB.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://www.typescriptlang.org/)
[![Apollo](https://img.shields.io/badge/Apollo%20Client-4.2-311C87.svg)](https://www.apollographql.com/docs/react)
[![GraphQL](https://img.shields.io/badge/GraphQL-Client-E10098.svg)](https://graphql.org/)

The official **Roomly** mobile client for shared household management — shopping lists, fridge inventory, calendar events, transactions, and per-household member profiles. The app consumes the [ROOMLY GraphQL API](../ROOMLY-API-main/README.md) via Apollo Client and selected REST endpoints.

---

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Application Flow](#application-flow)
- [Navigation & Screens](#navigation--screens)
- [API Integration](#api-integration)
- [Authentication & Session](#authentication--session)
- [Design System](#design-system)
- [Notifications](#notifications)
- [Quality Checks](#quality-checks)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Related Repositories](#related-repositories)

---

## Overview

Roomly organizes daily household life around a **household** — a shared space with its own members, lists, inventory, and calendar. The mobile app is the primary touchpoint for members to view and update that shared state.

**Core capabilities in the client:**

- **Authentication** — email/password accounts or passwordless **device-only** mode (local-first until upgraded)
- **Onboarding** — create a household, join via 6-character join code, set up profile (avatar + color + nickname)
- **Shopping** — personal and shared shopping lists; search products (Open Food Facts); add with quantity, notes, and visibility
- **Fridge** — personal and shared inventory; barcode scan; product detail with quantity and removal
- **Calendar** — create, view, and edit household events with attendees
- **Home** — recent activity and in-app notifications (REST)
- **Transactions** — tab scaffold (household finances; UI in progress)
- **Settings** — household join code, switch/join households, leave/delete household, sign out or upgrade account
- **Profile** — view and edit appearance (opened from header avatar)

A single **account** can hold multiple **profiles** across different households, each with its own nickname, avatar, shopping list, and inventory.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Runtime | [Expo SDK 55](https://docs.expo.dev/) |
| UI | [React Native](https://reactnative.dev/) 0.83, [React](https://react.dev/) 19 |
| Language | [TypeScript](https://www.typescriptlang.org/) 5.9 (strict) |
| Routing | [Expo Router](https://docs.expo.dev/router/introduction/) 55 (file-based, typed routes) |
| GraphQL | [Apollo Client](https://www.apollographql.com/docs/react/) 4 + [GraphQL](https://graphql.org/) 16 |
| HTTP | `fetch` wrapper (`src/shared/api/http.ts`) for REST auth & notifications |
| Secure storage | `expo-secure-store` (refresh token, device id, session keys) |
| Media | `expo-image`, `expo-camera` (barcode) |
| Notifications | `expo-notifications` (development builds) |
| Lint | ESLint + `eslint-config-expo` |

---

## Architecture

### High-level data flow

```
┌─────────────┐     JWT (Bearer)      ┌──────────────────┐
│  Mobile UI  │ ────────────────────► │  ROOMLY API      │
│  (Expo RN)  │ ◄──────────────────── │  /graphql        │
└─────────────┘     GraphQL + REST    │  /auth/*         │
       │                              │  /api/notifications
       │                              └──────────────────┘
       ▼
┌─────────────────────────────────────────────────────────┐
│  Providers (app/_layout.tsx)                            │
│  SafeAreaProvider → AuthProvider → ApolloProvider →     │
│  HouseholdProvider → Stack                              │
└─────────────────────────────────────────────────────────┘
       │
       ├── AuthProvider      access/refresh tokens, onboarding flag
       ├── Apollo Client     GraphQL + auto token refresh on 401/403
       └── HouseholdProvider active household + profile + resources
```

### Key design decisions

**Thin routes, fat features** — Files under `app/` define navigation and screen composition only. Business logic, hooks, and API calls live in `src/features/<domain>/`.

**Centralized routes** — All path constants are in `src/shared/routes.ts` to avoid stringly-typed navigation.

**Shared product module** — Adding a product (search, barcode, form, Open Food Facts) is implemented once in `src/features/product/` and reused by Shopping and Fridge flows.

**Household session gate** — `(tabs)/` screens are wrapped in `HouseholdSessionGate` so lists and inventory never render without a resolved `activeHouseholdId` + `activeProfileId`.

**Personal vs shared resources** — Shopping lists and inventories mirror the API model: each profile has private resources; the household also has shared list/inventory IDs from `householdResources` query.

**Design tokens** — UI colors and spacing come from `src/shared/theme/` aligned with [`roomly-design.md`](../roomly-design.md). Avoid hard-coded hex values in feature code.

**Avatar images** — Profile avatars are loaded from the API REST endpoint  
`GET /open/api/avatars/{name}?color=…` (see `src/features/profile/avatarImageUrl.ts`).

---

## Getting Started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- A running **ROOMLY API** instance — see [ROOMLY-API-main/README.md](../ROOMLY-API-main/README.md)
- **Android Studio** (Android emulator) and/or **Xcode** (iOS simulator, macOS only)
- Optional: [Expo Go](https://expo.dev/go) on a physical device (same Wi‑Fi as dev machine; some native features limited)

### Installation

```bash
git clone <repository-url>
cd roomly-frontend-mobile

npm install
cp .env.example .env
# Edit .env — set EXPO_PUBLIC_API_BASE_URL (see below)

npx expo start
```

| Expo CLI key | Action |
|---|---|
| `a` | Open Android emulator |
| `i` | Open iOS simulator |
| QR | Open in Expo Go (physical device) |

After changing `.env`, clear Metro cache:

```bash
npx expo start -c
```

### Development build (recommended for camera & notifications)

Expo Go does not expose all native modules (barcode scanner, system notifications). Use a dev build:

```bash
npx expo run:android
# or
npx expo run:ios
```

### Connect to a local API

| Target | Typical `EXPO_PUBLIC_API_BASE_URL` |
|---|---|
| Android emulator → host machine | `http://10.0.2.2:8080` |
| iOS simulator | `http://localhost:8080` |
| Physical device (same LAN) | `http://<your-computer-lan-ip>:8080` |

GraphQL endpoint used by the app: `{EXPO_PUBLIC_API_BASE_URL}/graphql`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | yes | API origin **without** trailing slash and **without** `/graphql` |

Example `.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080
```

Loaded in `src/shared/config.ts`. If missing, the app throws at startup with instructions to copy `.env.example`.

> **Note:** Expo inlines `EXPO_PUBLIC_*` variables at bundle time. Always restart the dev server after editing `.env`.

---

## Application Flow

```
app/index.tsx
    │
    ├─ not authenticated ──► (guest)/welcome → sign-in / sign-up
    │
    ├─ authenticated, onboarding incomplete
    │       ├─ email account ──► (onboarding)/choose-household → create/join → create-profile
    │       └─ device-only ──► (guest)/welcome (upgrade path available)
    │
    └─ authenticated, onboarding complete ──► (tabs)/home
```

**Household switch** — Stored mapping `householdId → profileId` in Secure Store; `HouseholdProvider` restores the last active household on launch.

---

## Navigation & Screens

### Route groups

| Group | Purpose | Auth |
|---|---|---|
| `(guest)/` | Welcome, sign-in, sign-up | Public |
| `(onboarding)/` | Choose / create / join household, create profile | Authenticated |
| `(tabs)/` | Main app: home, shopping, fridge, calendar, transactions, settings | Authenticated + household |
| `(modals)/` | Flows pushed on top: add product, profile, events, switch household | Authenticated |

### Tab bar

Custom `RoomlyTabBar` + `TabAppHeader` (`#Roomly`, profile avatar). Visible tabs:

| Tab | Screen | Status |
|---|---|---|
| Shopping | `(tabs)/shopping` | Full UI |
| Fridge | `(tabs)/fridge` | Full UI |
| Calendar | `(tabs)/calendar` | Full UI |
| Transactions | `(tabs)/transactions` | Scaffold |
| Settings | `(tabs)/settings` | Full UI |
| Home | `(tabs)/home` | Hidden from tab bar (`href: null`); reachable via header title |

Settings tab hides the household name subheader under the main header.

### Notable modals

| Route | Description |
|---|---|
| `add-shopping-item` | Product search → add to shopping list |
| `add-shopping-product` | Quantity, visibility, notes, confirm |
| `add-fridge-item` | Product search for inventory |
| `add-fridge-scan` | Barcode scanner → product screen |
| `add-fridge-product` | Add to fridge (private/shared) |
| `fridge-product-detail` | View/edit quantity, remove |
| `profile` | View / customize profile |
| `add-event` / `event-detail` | Calendar CRUD |
| `switch-household` / `join-household` | Multi-household management |

Legacy redirects: `(modals)/settings` → settings tab; `(modals)/upgrade` → sign-in with `intent=upgrade`.

---

## API Integration

### GraphQL (primary)

- **Endpoint:** `POST {API_BASE_URL}/graphql`
- **Client:** `src/shared/api/apolloClient.ts`
- **Auth:** `Authorization: Bearer <access_token>` via `SetContextLink`
- **Refresh:** On 401/403, `ErrorLink` calls `refreshAccessToken()` once and retries the operation

Feature-level operations are colocated:

| Feature | API module |
|---|---|
| Household | `household/householdApi.ts`, `household/householdResourcesApi.ts` |
| Profile | `profile/profileApi.ts` |
| Shopping | `shoppingList/shoppingListApi.ts` |
| Inventory | `inventory/inventoryApi.ts` |
| Calendar | `calendar/eventsApi.ts` |
| Product lookup | `shoppingList` GraphQL `product(barcode)` + OFF search in `product/openFoodFactsApi.ts` |

For the full server schema, see [ROOMLY-API-main/docs](../ROOMLY-API-main/docs/).

### REST (secondary)

| Endpoint | Used for |
|---|---|
| `POST /auth/login` | Email login |
| `POST /auth/register` | Registration (+ optional `deviceId` upgrade) |
| `GET /auth/refresh?t=…` | Access token refresh |
| `POST /auth/device/register` | Device-only account |
| `POST /auth/device/login` | Device-only login |
| `GET /api/notifications` | Home notification feed |
| `POST /api/notifications/markAsRead` | Mark notifications read |
| `GET /open/api/avatars/{name}` | Avatar images |

Implemented in `src/features/auth/authApi.ts` and `src/features/notifications/notificationsApi.ts`.

---

## Authentication & Session

### Modes

| Mode | Description | Storage |
|---|---|---|
| **Email/password** | Standard register / login | Refresh token in Secure Store |
| **Device-only** | Passwordless; data tied to device until upgraded | Device ID + tokens in Secure Store |

Device users can **upgrade** to email/password from Settings (redirects to sign-in with `intent=upgrade`).

### Token lifecycle (client)

1. Login/register returns `accessToken` + `refreshToken`.
2. Access token is held in memory (`accessTokenHolder`) and attached to GraphQL/REST.
3. On auth errors, client refreshes via `/auth/refresh` and retries once.
4. Sign out clears tokens, Apollo cache, and household session.

### Household context

`HouseholdProvider` keeps:

- `activeHouseholdId`, `activeProfileId`
- Current `profile` (nickname, avatar, list/inventory IDs)
- `households` list for switching

`useHouseholdResources()` loads shared + per-member resources for Shopping/Fridge UI (avatars, list IDs).

---

## Design System

Visual specs are defined in the monorepo design file:

- **[`roomly-design.md`](../roomly-design.md)** — Figma tokens (colors, components, AI/dev rules)

Implementation in code:

| File | Role |
|---|---|
| `src/shared/theme/colors.ts` | Color tokens (`button`, `field`, `header`, `background`, …) |
| `src/shared/theme/spacing.ts` | Screen padding, gaps, radii |
| `src/shared/theme/authScreenStyles.ts` | Onboarding/profile cards, pill inputs, shadows |
| `src/shared/theme/index.ts` | `stackHeaderOptions` for modal stacks |

**Rules for new UI:**

- Use `colors` / `spacing` from theme — no new arbitrary palette entries.
- Prefer `authScreenStyles.profileCard` for lavender field cards (settings, profile).
- Header matches Figma: `TabAppHeader` + optional `HouseholdSubheader`.

---

## Notifications

| Feature | Expo Go | Development build |
|---|---|---|
| Fetch notifications on Home (REST) | Yes | Yes |
| Mark as read / mark all read | Yes | Yes |
| System tray banners (`expo-notifications`) | No¹ | Yes, after permission |

¹ Android SDK 53+ limits push in Expo Go; the module is lazy-loaded to avoid crashes.

**Manual test:** Two accounts in one household → trigger a server `@Notifiable` action → open **Home** or pull to refresh. Remote push delivery is not fully wired on the client yet.

---

## Quality Checks

```bash
# Lint
npm run lint

# TypeScript (no emit)
npx tsc --noEmit
```

Run both before opening a pull request.

---

## Project Structure

```
roomly-frontend-mobile/
├── app/                              # Expo Router — routes only
│   ├── _layout.tsx                   # Root providers
│   ├── index.tsx                     # Auth / onboarding redirect
│   ├── (guest)/                      # welcome, sign-in, sign-up
│   ├── (onboarding)/                 # household + profile setup
│   ├── (tabs)/                       # main tabs + _layout (TabAppHeader)
│   └── (modals)/                     # modal stack flows
├── src/
│   ├── features/
│   │   ├── auth/                     # AuthProvider, authApi, token store
│   │   ├── household/                # session, header, join code, resources
│   │   ├── profile/                  # profile API, setup, avatar preview
│   │   ├── product/                  # search, scanner, AddProductForm, OFF
│   │   ├── shoppingList/             # lists, FAB, hooks, shopping API
│   │   ├── inventory/                # fridge list, FAB, inventory hooks
│   │   ├── calendar/                 # events API + UI helpers
│   │   ├── home/                     # home feed
│   │   ├── settings/                 # settings tab content
│   │   └── notifications/            # REST notifications + sync
│   └── shared/
│       ├── api/                      # apolloClient, http, errors
│       ├── components/               # Screen, ModalScreen, forms
│       ├── navigation/               # tab bar, chevrons, layout constants
│       ├── theme/                    # design tokens
│       ├── routes.ts                 # typed route paths
│       └── config.ts                 # env → API_BASE_URL
├── assets/images/                    # app icon, splash, tab assets
├── app.json                          # Expo config (camera, notifications plugins)
├── .env.example
├── package.json
└── tsconfig.json                     # path alias: @/* → project root
```

### Path alias

Imports use `@/` pointing at the project root (see `tsconfig.json`):

```typescript
import { routes } from "@/src/shared/routes";
```

---

## Troubleshooting

| Problem | Things to check |
|---|---|
| `Missing EXPO_PUBLIC_API_BASE_URL` | Create `.env` from `.env.example`, restart with `npx expo start -c` |
| Network error on emulator | Use `10.0.2.2` (Android) not `localhost` |
| Network error on phone | API bound to `0.0.0.0`; use LAN IP; same Wi‑Fi |
| GraphQL 401 loop | API `JWT_SECRET_KEY` set; clock skew; try sign out/in |
| Barcode / camera not working | Use `npx expo run:android` / `ios`, not Expo Go |
| Avatar images blank | API running; `/open/api/avatars/…` reachable; check color query param |
| Profile update fails (color only) | Backend must exclude current profile in uniqueness check — see API team |

---

## Contributing

1. **New screen** — Add route under `app/`; implement UI/logic in `src/features/<domain>/`.
2. **New route constant** — Update `src/shared/routes.ts`.
3. **GraphQL** — Add operations to the feature’s `*Api.ts`; keep resolvers thin in components.
4. **Styling** — Use `src/shared/theme`; align with `roomly-design.md`.
5. **No dead code** — Remove unused components when replacing flows (e.g. old section components).
6. **Checks** — `npm run lint` and `npx tsc --noEmit` before PR.
7. **Commits** — Small, focused commits with clear messages.

Backend is maintained separately (`ROOMLY-API-main/` in this monorepo is reference-only for mobile developers).

---

## Related Repositories

| Path | Description |
|---|---|
| [`roomly-frontend-mobile/`](.) | This repository — mobile client |
| [`ROOMLY-API-main/`](../ROOMLY-API-main/) | GraphQL API (Java / Spring Boot) |
| [`roomly-design.md`](../roomly-design.md) | Design system tokens & rules |
| [`README.md`](../README.md) | Monorepo overview |

---

## Authors

**Florczak Mikołaj** — project creator (API); mobile app developed as part of the Roomly product.

---

## Acknowledgments

- [Expo](https://expo.dev/) — toolchain and native modules
- [Expo Router](https://docs.expo.dev/router/introduction/) — navigation
- [Apollo Client](https://www.apollographql.com/docs/react/) — GraphQL client
- [Open Food Facts](https://world.openfoodfacts.org/) — product search data
- [ROOMLY API](../ROOMLY-API-main/README.md) — backend services

---

## License

Private Roomly team project. Contact repository maintainers for licensing and distribution.
