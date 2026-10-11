# HomeFix Project Context & Domain Memory

## Project Overview
HomeFix is an on-demand home service booking application built with React Native and Expo (SDK 57) for the Sri Lankan market (currency: LKR / `Rs.`, international calling code: `+94`). It connects homeowners and businesses with certified, background-checked trade professionals (electricians, plumbers, cleaners, carpenters, AC & appliance technicians).

## Tech Stack & Runtime
- **Framework:** Expo SDK 57 (`~57.0.27`), React Native `0.86.3`, React `19.2.3`
- **Compiler & Typing:** React Compiler enabled (`experiments.reactCompiler: true`), Typed Routes enabled (`experiments.typedRoutes: true`), TypeScript `~6.0.3`
- **Navigation & Routing:** Expo Router (`src/app/`), file-based routing with root stack and tab navigators
- **Backend & Cloud Services:** Firebase v12 (Auth with email/phone credentials, Firestore collections: `users`, `providers`, `bookings`, Firebase Storage)
- **Local Cache & Offline Persistence:** `@react-native-async-storage/async-storage` for offline-first booking synchronization (`@homefix_local_bookings_v1`)
- **Iconography & UI:** Ionicons (`@expo/vector-icons`), custom responsive StyleSheet architecture with Emerald (`#10B981`), Dark Slate (`#111827`), Neutral Gray (`#F3F4F6`, `#9CA3AF`)

## Role Hierarchy & Access Matrix
The app supports 3 distinct user roles defined in `src/types/provider.ts` (`UserRole`):
1. **Customer (`'customer'`):**
   - Default role upon registration.
   - Can explore providers, filter services, book appointments via 3-step checkout, track live status, reschedule/cancel bookings, and manage customer profile.
2. **Provider (`'provider'`):**
   - Tradesperson / technician account.
   - Profile tab displays Pro Dashboard with earnings (Rs.), ratings, completed jobs, and direct link to Manage Services (`/manage-services`).
   - Automatically queried in `providerService.ts` from Firestore `users` and `providers` collections.
3. **Admin (`'admin'`):**
   - Privileged administrative role. Registration requires passcode (`admin123`, `homefix_admin`, `admin`).
   - Profile tab surfaces dedicated Administrator Control panel.
   - Access to full Admin Control Center (`src/app/admin.tsx`) with system statistics, user role promotion/demotion, service provider management, and system-wide booking oversight.

## Complete File & Route Architecture

### 1. Root & Stack Navigation (`src/app/_layout.tsx`)
- `(tabs)`: Bottom navigation containing Home, Services, Bookings, Support, Profile
- `(auth)`: Authentication stack
- `filter`: Search and provider filtering modal (modal presentation)
- `book-professional`: Step 1 of Booking flow (Date & Time selection)
- `booking-address-details`: Step 2 of Booking flow (Address, landmark & defect photos)
- `booking-review-payment`: Step 3 of Booking flow (Summary & Payment method selection)
- `card-payment`: Mock card processing & CVV verification screen
- `booking-confirmation`: Post-booking confirmation & live service tracking screen
- `admin`: Full-featured administrative dashboard
- `manage-services`: Provider service, rate, and trade configuration screen
- `edit-profile`: User name, telephone, and address modification screen
- `provider/[id]`: Dynamic stack route for deep provider profile inspection

### 2. Tab Navigation (`src/app/(tabs)/`)
- `_layout.tsx`: 5-tab bar with system icons and active Emerald highlights.
- `index.tsx` (Home):
  - Emergency Dispatch banner (15-min instant response trigger).
  - Active Request status card with ETA and direct track link.
  - Category selector grid (Plumbing, Electrical, Cleaning, Carpentry, AC & Appliances).
  - Promotional discount cards and top-rated verified professionals carousel.
- `services.tsx` (Services Directory):
  - Category pills with real-time provider counts.
  - Search bar filtering providers by name, skill, or trade.
  - SOS Unit standby banner.
  - Provider list cards with rating, location, upfront pricing, and direct book button.
- `bookings.tsx` (Bookings Management):
  - Status tabs: `Upcoming`, `Completed`, `Cancelled`.
  - Full CRUD operations:
    - View booking details modal.
    - Reschedule booking modal (updates date/time in Firestore and AsyncStorage).
    - Mark as Completed.
    - Cancel booking with reason notes.
    - Delete booking record.
  - Direct call specialist shortcut and pull-to-refresh.
- `support.tsx` (Help & Support):
  - Active/recent issue warranty claim card.
  - Direct contact channels (Live Chat, Call Agent, WhatsApp integration).
  - Categorized help topics and interactive FAQ accordion.
- `profile.tsx` (Role-Aware Profile):
  - Displays user avatar, badge, and contact info.
  - Dynamically renders customer options, pro statistics & rate management, or administrator controls based on user role.
  - Firebase sign-out integration.

### 3. Dedicated Screens
- `src/app/provider/[id].tsx`:
  - 3-tab layout: `OVERVIEW`, `CREDENTIALS`, `REVIEWS`.
  - Upfront rate breakdown (Standard rate/hr, Diagnostic fee, Emergency 24/7 rate).
  - Background check verification badge, work portfolio gallery, and skill tags.
  - Official certification viewer via `CertificateModal`.
  - 1-click booking via `InstantBookModal` and instant messaging via `MessageModal`.
  - Interactive rating breakdown with star percentages, filter by verified reviews/photos, and helpful review voting.
  - Native share and bookmarking.
- `src/app/manage-services.tsx`:
  - Allows providers and admins to configure job roles, bio, skills, and hourly/diagnostic/emergency rates.
  - Directly merges updates into Firestore `users` and `providers` collections.
- `src/app/admin.tsx`:
  - 4 views: Overview metrics, Users table, Providers table, Bookings oversight.
  - Live search and role filtering.
  - Change user roles (promote to Pro or Admin, demote to Customer).
  - Direct link to edit any provider's rates.

### 4. Booking Flow Pipeline
1. `book-professional.tsx`: Step 1 of 3. Calendar date selection strip, custom full-month calendar modal with past date locking, time slot selector.
2. `booking-address-details.tsx`: Step 2 of 3. Saved addresses (Home/Work) or custom address entry, landmark directions, issue description, defect photo upload.
3. `booking-review-payment.tsx`: Step 3 of 3. Itemized bill review, payment method selection:
   - Cash on Completion (creates booking with status `Pending`)
   - Credit / Debit Card (redirects to `/card-payment`)
   - KOKO (Sri Lankan Pay-in-3 BNPL)
   - LankaQR / Online banking
4. `card-payment.tsx`: Cardholder name, auto-formatted 16-digit card number, expiry, CVV validation, payment processing simulation.
5. `booking-confirmation.tsx`: Displays assigned `#HF-XXXXX` booking ID, live 4-step progress tracker (Placed -> On the Way -> In Progress -> Completed), call technician shortcut.

## Data Layer & Services

### `src/services/providerService.ts`
- `normalizeDbProvider(id, data)`: Sanitizes Firestore documents into strongly-typed `ServiceProvider` structures.
- `getAllProviders()`: Queries Firestore `providers` collection and Firestore `users` collection (where `role === 'provider'`) to aggregate all active pros in the system.
- `getProviderById(id)`: Fetches a single provider from Firestore `providers` or `users` collection.
- `saveProviderToDb(provider)`: Upserts a provider document into Firestore.

### `src/services/bookingService.ts`
- Offline-first hybrid architecture utilizing `@react-native-async-storage/async-storage` cache (`@homefix_local_bookings_v1`) coupled with Firestore `bookings` collection.
- `generateBookingId()`: Generates human-friendly IDs formatted as `#HF-XXXXX`.
- `createBooking(payload)`: Saves to local storage and syncs to Firestore.
- `getUserBookings()`: Returns bookings sorted newest first, reconciling local storage and remote Firestore.
- `getBookingById(id)`, `updateBooking(id, updates)`, `rescheduleBooking(id, date, time)`, `cancelBooking(id, reason)`, `completeBooking(id)`, `deleteBooking(id)`.

## Sri Lankan Domain & Market Conventions
- **Currency:** Sri Lankan Rupee (`Rs.` / `LKR`).
- **Telephone:** `+94` mobile format (e.g., `+94 77 123 4567`).
- **Local Payment Gateways:** LankaQR, KOKO (Pay in 3 installments), and Cash on Completion.
- **Service Locations:** Colombo, Gampaha, Western Province and major suburban hubs.

## Quality Assurance & Code Rules
- Always run `npx tsc --noEmit` and `npx expo lint` before marking tasks complete.
- Follow Expo Router guidelines: screens live in `src/app/`, shared components in `src/components/`, business logic in `src/services/`, types in `src/types/`.
- Avoid synchronous `setState` in `useEffect` (use `useFocusEffect` with `useCallback` for screen focus data fetching).
- Use `npx expo install <package>` for dependency resolution. Do not manually edit native build folders (`android/`, `ios/`).
