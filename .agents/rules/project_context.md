# HomeFix Project Context & Domain Memory

## Project Overview
HomeFix is an on-demand home service booking application built with React Native and Expo (SDK 57) for Sri Lankan users (currency: LKR / `Rs.`, phone code: `+94`). It connects homeowners with certified technicians (electricians, plumbers, cleaners, carpenters, AC technicians).

## Tech Stack
- **Framework:** Expo SDK 57 (`~57.0.27`), React Native `0.86.3`, React `19.2.3` (with React Compiler)
- **Language:** TypeScript `~6.0.3`
- **Routing:** Expo Router (`src/app/`), typed routes enabled
- **Backend:** Firebase (Auth, Firestore `users` collection, Storage)
- **Icons & UI:** Ionicons (`@expo/vector-icons`), custom StyleSheet palette (Emerald `#10B981`, Slate `#111827`, Gray `#F3F4F6`)

## Core Application Structure
- `src/app/_layout.tsx`: Root Stack containing `(auth)`, `(tabs)`, and `filter` modal
- `src/app/(auth)/`: `welcome.tsx`, `login.tsx`, `register.tsx` (supports `'customer'` and `'provider'` roles)
- `src/app/(tabs)/`:
  - `index.tsx`: Home screen (Emergency Dispatch, Active Requests, Categories, Deals, Top Pros)
  - `services.tsx`: Services Directory, SOS Unit standby, Rapid Service Packs
  - `bookings.tsx`: Bookings list (Upcoming, Completed, Cancelled)
  - `profile.tsx`: Role-aware Profile (Customer settings vs Pro dashboard with earnings & verification)
- `src/app/filter.tsx`: Search filter modal (rating, distance, verification)
- `src/config/firebase.ts`: Firebase app, auth, db, and storage exports
