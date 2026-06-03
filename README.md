# ROOMLY — Mobile App

[![Expo](https://img.shields.io/badge/Expo_SDK-55-000020.svg)](https://docs.expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.83-61DAFB.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://www.typescriptlang.org/)
[![Apollo](https://img.shields.io/badge/Apollo%20Client-4.2-311C87.svg)](https://www.apollographql.com/docs/react)
[![GraphQL](https://img.shields.io/badge/GraphQL-Client-E10098.svg)](https://graphql.org/)

Expo / React Native client for **Roomly** — shared household management (shopping lists, fridge inventory, calendar, transactions, member profiles).

This repository contains **only the mobile app**. It talks to the **ROOMLY API** (GraphQL + REST) over `EXPO_PUBLIC_API_BASE_URL`.

The backend lives in a **separate project** — [ROOMLY-API-main](../ROOMLY-API-main/). That folder is not part of this repo; in this workspace it is usually a **local copy for reference** (schema, docs, running the server locally). **How to install, configure, and run the API** is documented there: [ROOMLY-API-main/README.md](../ROOMLY-API-main/README.md). Do not look here for Gradle, JWT, or database setup.

---

## Table of Contents

- [Overview](#overview)
- [Backend (ROOMLY API)](#backend-roomly-api)
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

---

## Overview

Roomly organizes daily household life around a **household** — a shared space with its own members, lists, inventory, and calendar.

**Core capabilities in this app:**

- **Authentication** — email/password or passwordless **device-only** mode (upgrade to email account from Settings)
- **Onboarding** — create / join household (join code), profile setup (avatar, color, nickname)
- **Shopping** — private and shared lists; product search; quantity, notes, visibility
- **Fridge** — private and shared inventory; barcode scan; product detail and quantity
- **Calendar** — household events with attendees
- **Home** — activity and notifications (REST)
- **Transactions** — tab scaffold (UI in progress)
- **Settings** — join code, switch/join households, leave/delete household, sign out
- **Profile** — view and edit appearance (header avatar)

One **account** can have multiple **profiles** in different households.

---

## Backend (ROOMLY API)

| | |
|---|---|
| **What you develop here** | `roomly-frontend-mobile` (this README) |
| **What the app calls** | ROOMLY API — Spring Boot, GraphQL at `/graphql`, auth and notifications under `/auth/*`, `/api/…` |
| **Where backend docs live** | [ROOMLY-API-main/README.md](../ROOMLY-API-main/README.md) — **separate repository**; setup, env vars, `bootRun`, troubleshooting |
| **Optional reference in workspace** | [ROOMLY-API-main/docs/](../ROOMLY-API-main/docs/) — queries, mutations, DTOs (read-only when aligning the client) |

Typical local flow:

1. Start the API using instructions in **ROOMLY-API-main** (default `http://localhost:8080`).
2. Point this app at that origin in `.env` (see [API base URL examples](#api-base-url-examples)).
3. Run `npx expo start` in **roomly-frontend-mobile**.

You can also use a **deployed** API URL — the mobile app only needs a reachable `EXPO_PUBLIC_API_BASE_URL`, not the API sources on disk.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Runtime | [Expo SDK 55](https://docs.expo.dev/) |
| UI | [React Native](https://reactnative.dev/) 0.83, [React](https://react.dev/) 19 |
| Language | [TypeScript](https://www.typescriptlang.org/) 5.9 (strict) |
| Routing | [Expo Router](https://docs.expo.dev/router/introduction/) 55 |
| GraphQL | [Apollo Client](https://www.apollographql.com/docs/react/) 4 |
| HTTP | `src/shared/api/http.ts` |
| Secure storage | `expo-secure-store` |
| Camera / barcode | `expo-camera` |
| Images | `expo-image` |
| Notifications | `expo-notifications` (development builds) |
| Lint | ESLint + `eslint-config-expo` |

---

## Architecture

### High-level data flow

```
┌─────────────┐     JWT (Bearer)      ┌──────────────────────────┐
│  Mobile UI  │ ────────────────────► │  ROOMLY API (external)   │
│  (Expo RN)  │ ◄──────────────────── │  /graphql, /auth/*, …  │
└─────────────┘                       └──────────────────────────┘
       │
       ▼
  app/_layout.tsx
  SafeAreaProvider → AuthProvider → ApolloProvider → HouseholdProvider → Stack
```

### Key design decisions

**Thin routes, fat features** — `app/` = navigation; `src/features/<domain>/` = logic and UI.

**Centralized routes** — `src/shared/routes.ts`.

**Shared product module** — `src/features/product/` for search, scanner, and `AddProductForm` (Shopping + Fridge).

**Household session gate** — `HouseholdSessionGate` on tabs until `activeHouseholdId` + `activeProfileId` are set.

**Design tokens** — `src/shared/theme/` (`colors.ts`, `spacing.ts`, `authScreenStyles.ts`). No ad-hoc hex in features.

**Avatars** — `GET {API_BASE_URL}/open/api/avatars/{name}?color=…` (`src/features/profile/avatarImageUrl.ts`).

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- A running **ROOMLY API** (see [Backend (ROOMLY API)](#backend-roomly-api) — run it from [ROOMLY-API-main](../ROOMLY-API-main/) or use a deployed instance)
- Android Studio and/or Xcode (optional: Expo Go on device)

### Installation

```bash
git clone <repository-url>
cd roomly-frontend-mobile

npm install
cp .env.example .env
# Set EXPO_PUBLIC_API_BASE_URL

npx expo start
```

| Key | Action |
|---|---|
| `a` | Android emulator |
| `i` | iOS simulator |
| QR | Expo Go |

After `.env` changes:

```bash
npx expo start -c
```

### Development build (camera & system notifications)

```bash
npx expo run:android
# or
npx expo run:ios
```

### API base URL examples

| Target | `EXPO_PUBLIC_API_BASE_URL` |
|---|---|
| Android emulator → host | `http://10.0.2.2:8080` |
| iOS simulator | `http://localhost:8080` |
| Physical device (LAN) | `http://<lan-ip>:8080` |

GraphQL: `{EXPO_PUBLIC_API_BASE_URL}/graphql`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | yes | API origin, no trailing slash, no `/graphql` |

Example:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080
```

Read in `src/shared/config.ts`. Missing value → startup error with hint to use `.env.example`.

Restart Expo after editing `.env` (variables are inlined at bundle time).

---

## Application Flow

```
app/index.tsx
  ├─ guest → (guest)/welcome, sign-in, sign-up
  ├─ auth + incomplete onboarding → (onboarding)/…
  └─ ready → (tabs)/home
```

Household ↔ profile mapping persisted in Secure Store (`HouseholdProvider`).

---

## Navigation & Screens

| Group | Purpose |
|---|---|
| `(guest)/` | Welcome, auth |
| `(onboarding)/` | Household + profile setup |
| `(tabs)/` | Main app |
| `(modals)/` | Add product, profile, events, switch household, … |

**Tabs:** Shopping, Fridge, Calendar, Transactions (scaffold), Settings. Home is hidden from tab bar (`href: null`), opened from `#Roomly` in header.

**Modals (examples):** `add-shopping-item`, `add-shopping-product`, `add-fridge-item`, `add-fridge-scan`, `add-fridge-product`, `fridge-product-detail`, `profile`, `add-event`, `event-detail`, `switch-household`, `join-household`.

Redirects: `(modals)/settings` → settings tab; `(modals)/upgrade` → sign-in with `intent=upgrade`.

---

## API Integration

### GraphQL

- Client: `src/shared/api/apolloClient.ts`
- Auth header + automatic refresh on 401/403

| Feature | Module |
|---|---|
| Household | `src/features/household/householdApi.ts`, `householdResourcesApi.ts` |
| Profile | `src/features/profile/profileApi.ts` |
| Shopping | `src/features/shoppingList/shoppingListApi.ts` |
| Inventory | `src/features/inventory/inventoryApi.ts` |
| Calendar | `src/features/calendar/eventsApi.ts` |
| Barcode product | GraphQL `product(barcode)` via `useInventory` / shopping hooks |
| Name search | `src/features/product/openFoodFactsApi.ts` (client-side OFF) |

### REST (this repo)

| Endpoint | Module |
|---|---|
| `/auth/*` | `src/features/auth/authApi.ts` |
| `/api/notifications` | `src/features/notifications/notificationsApi.ts` |
| `/open/api/avatars/{name}` | `src/features/profile/avatarImageUrl.ts` |

Operations in this repo follow the server contract. For field names, mutations, and DTO shapes, use the API project docs when you have the workspace copy: [ROOMLY-API-main/docs/queries.md](../ROOMLY-API-main/docs/queries.md), [mutations.md](../ROOMLY-API-main/docs/mutations.md), [dto.md](../ROOMLY-API-main/docs/dto.md). **Implementing or fixing the server** → [ROOMLY-API-main/README.md](../ROOMLY-API-main/README.md), not this repository.

---

## Authentication & Session

| Mode | Description |
|---|---|
| Email/password | Register / login, refresh token in Secure Store |
| Device-only | Local device account; upgrade from Settings |

`HouseholdProvider` holds active household, profile, and household list. `useHouseholdResources()` supplies list/inventory IDs and member avatars for Shopping/Fridge.

---

## Design System

Implemented **in this repo only:**

| File | Purpose |
|---|---|
| `src/shared/theme/colors.ts` | Color tokens |
| `src/shared/theme/spacing.ts` | Padding, gaps, radii |
| `src/shared/theme/authScreenStyles.ts` | Cards, pill inputs, buttons |
| `src/shared/theme/index.ts` | Stack header styles |
| `src/shared/theme/typography.ts` | Type scale |

Use these files for all new UI. Main chrome: `TabAppHeader`, `RoomlyTabBar`, lavender `colors.field` cards on settings/profile flows.

---

## Notifications

| Feature | Expo Go | Dev build |
|---|---|---|
| REST feed on Home | Yes | Yes |
| Mark read | Yes | Yes |
| System tray (`expo-notifications`) | Limited¹ | Yes |

¹ Lazy-loaded in Expo Go to avoid SDK issues.

---

## Quality Checks

```bash
npm run lint
npx tsc --noEmit
```

---

## Project Structure

```
roomly-frontend-mobile/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (guest)/
│   ├── (onboarding)/
│   ├── (tabs)/
│   └── (modals)/
├── src/
│   ├── features/
│   │   ├── auth/
│   │   ├── household/
│   │   ├── profile/
│   │   ├── product/
│   │   ├── shoppingList/
│   │   ├── inventory/
│   │   ├── calendar/
│   │   ├── home/
│   │   ├── settings/
│   │   └── notifications/
│   └── shared/
│       ├── api/
│       ├── components/
│       ├── navigation/
│       ├── theme/
│       ├── routes.ts
│       └── config.ts
├── assets/images/
├── app.json
├── .env.example
├── package.json
└── tsconfig.json
```

Import alias: `@/*` → project root (`tsconfig.json`).

---

## Troubleshooting

| Problem | Check |
|---|---|
| Missing `EXPO_PUBLIC_API_BASE_URL` | `.env` from `.env.example`, `npx expo start -c` |
| Network on Android emulator | `10.0.2.2`, not `localhost` |
| Network on phone | API on LAN, same Wi‑Fi, correct IP |
| 401 loop | API up, valid credentials, try sign out/in |
| Camera / scan | `npx expo run:android` / `ios`, not Expo Go |
| Blank avatars | API serves `/open/api/avatars/…` |
| Profile color-only update fails | Server-side `updateProfile` uniqueness check (API fix) |

---

## Contributing

1. Add screens under `app/`, logic under `src/features/`.
2. Register paths in `src/shared/routes.ts`.
3. GraphQL in feature `*Api.ts` files.
4. Style with `src/shared/theme/` only.
5. Run `npm run lint` and `npx tsc --noEmit`.

**API / schema changes** — edit and run tests in **ROOMLY-API-main** (its own repo). The copy next to this folder is for reference; follow [ROOMLY-API-main/README.md](../ROOMLY-API-main/README.md) for contribution and deployment there.

---

## Acknowledgments

- [Expo](https://expo.dev/) · [Expo Router](https://docs.expo.dev/router/introduction/) · [Apollo Client](https://www.apollographql.com/docs/react/)
- [Open Food Facts](https://world.openfoodfacts.org/) — product name search
- [ROOMLY API](../ROOMLY-API-main/README.md) — backend consumed by this client (documented and maintained separately)

---

## License

Private project. Licensing as agreed by the maintainers of this repository.
