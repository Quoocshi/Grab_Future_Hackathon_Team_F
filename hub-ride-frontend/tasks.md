# Hub-Ride FE Tasks

> Scope: complete Phase 1-3 from `docs/hub-ride-architecture.md`.
> Backend APIs are available. The frontend connects to real APIs, removes old driver-centric mock flows, and supports the full demo path: Host creates a room -> Joiner joins -> Countdown -> Dispatch -> Booking confirmation.

## Tracking Rules

- Status: `[ ]` todo, `[~]` in progress, `[x]` done, `[!]` blocked or needs BE/API confirmation.
- Every data/API screen needs loading, empty, and error states where applicable.
- Prefer `countdownSec` from the backend. `NEXT_PUBLIC_ROOM_COUNTDOWN_SECONDS` is only a preview fallback.
- UI follows the existing shadcn/Tailwind design system: labels above inputs, high-contrast buttons, clear mobile collapse behavior, and no visible em dash in UI copy.
- Do not add a long marketing landing page. The first screen should help the user create or find a room.

## Current FE Snapshot

- [x] Next app shell includes `layout`, `Navbar`, `Footer`, shadcn primitives, and Tailwind v4.
- [x] Core dependencies are installed: `@stomp/stompjs`, `sockjs-client`, `@tanstack/react-query`, `react-hook-form`, `zod`, `zustand`, `lucide-react`, `framer-motion`, `nextstepjs`, and `motion`.
- [x] Landing page uses the Hub-Ride host/join flow.
- [x] Routes exist for `/`, `/rooms/new`, `/rooms/browse`, `/rooms/[roomId]`, `/bookings`, and `/bookings/[bookingId]`.
- [x] API modules follow the backend contract: `room.ts`, `booking.ts`, `address.ts`, and `user.ts`.
- [x] Domain types exist for rooms, bookings, addresses, partners, and users.
- [x] WebSocket subscription hook exists for `/topic/room/{roomId}`.

## Phase 1 - Foundation (T+0 -> T+2h)

### 0:00-0:30 - FE Project Baseline

- [x] Verify package setup: Next, Tailwind, shadcn, and pnpm scripts.
- [x] Create `.env.local.example` for FE:
  - `NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api/v1`
  - `NEXT_PUBLIC_WS_URL=ws://localhost:8081/ws`
  - `NEXT_PUBLIC_GOONG_API_KEY=...`
  - `NEXT_PUBLIC_ROOM_COUNTDOWN_SECONDS=30`
- [x] Update app metadata and title to Hub-Ride.
- [x] Finalize FE route map from the architecture document.

### 0:30-1:00 - Layout, Navbar, Footer, Landing Hero

- [x] Update Navbar with Hub-Ride branding, room navigation, user switcher, wallet, guide replay, and create CTA.
- [x] Update Footer copy for the Hub-Ride aggregator flow.
- [x] Rebuild `/` around hub-based shared cars, host/join rooms, and best partner dispatch.
- [~] Continue responsive QA for landing, nav wrapping, and mobile text overlap.

### 1:00-1:30 - Address/User API and SearchBox

- [x] Create address and user domain types.
- [x] Create address and user API clients.
- [x] Create `AddressAutocomplete` with debounce, loading, empty, and error states.
- [x] Create `UserSwitcher`.
- [x] Create `WalletBadge`.

### 1:30-2:00 - Create Room API and Browse UI

- [x] Create room domain types and room API client functions.
- [x] Create `/rooms/browse` with route filters, room cards, empty states, and join actions.
- [x] Milestone 1 check: browse renders API cards, create room API is typed, and landing CTAs route correctly.

## Phase 2 - Core Mechanics (T+2h -> T+5h)

### 2:00-2:45 - Browse Page API Wiring

- [x] Connect `/rooms/browse` to `searchRooms`.
- [x] Use backend query params: `originLat`, `originLng`, `destLat`, `destLng`, `excludeUserId`.
- [x] Add TanStack Query keys for route and user-specific browse data.
- [x] Disable `Join` when the current user is already host/member.
- [x] Navigate to `/rooms/[roomId]` after successful join.
- [x] Add skeleton loading and retryable error panel.

### 2:45-3:30 - Complete Create Room Form

- [x] Create `/rooms/new`.
- [~] Use local state for MVP form flow. `react-hook-form` and `zod` remain available for a later hardening pass.
- [x] Include demo user, origin address, destination address, and Haversine route preview.
- [x] Validate required addresses and valid coordinates.
- [x] Warn when route distance is under 2 km.
- [x] Submit with `createRoom`, then redirect to `/rooms/{roomId}`.
- [~] Keep the two-step UX lightweight for route selection and pre-pay confirmation.

### 3:30-4:15 - WebSocket Client and Room Detail Subscribe

- [x] Create `src/lib/ws/useRoomSubscription.ts`.
- [x] Read `NEXT_PUBLIC_WS_URL`.
- [x] Connect and disconnect cleanly.
- [x] Subscribe to `/topic/room/{roomId}`.
- [x] Parse room events: `JOIN`, `LEAVE`, `DISPATCHED`, and `CANCELLED`.
- [x] Create `/rooms/[roomId]` with initial fetch, WebSocket subscription, and TanStack cache reconciliation.
- [~] Continue browser demo testing for disconnected/reconnecting states.

### 4:15-5:00 - Countdown and MemberList Realtime

- [x] Create `CountdownTimer` with client ticking, cleanup on unmount, urgency state, and single `onComplete` call.
- [x] Create `MemberList` with initials, host badge, joiner count, and solo state.
- [x] Build room detail layout with route summary, countdown, member list, and role-aware actions.
- [x] Milestone 2 API check: host creates room, joiner sees room, joiner joins, countdown ticks once, and room detail updates from cache/events.

## Phase 3 - Aggregator + Booking (T+5h -> T+7h)

### 5:00-5:45 - Partner Comparison Components

- [x] Create partner quote and dispatch result types.
- [x] Create `PartnerCard` with partner, total price, per-rider estimate, ETA, vehicle type, and best quote highlight.
- [x] Create `PriceCompare` with loading and empty states.
- [x] Add money, distance, and countdown format helpers.

### 5:45-6:30 - Dispatch Trigger and Booking Redirect

- [x] Dispatch the room when the countdown completes.
- [x] Prevent duplicate dispatch with a ref guard.
- [x] Render dispatch loading state.
- [x] Handle `DISPATCHED` WebSocket events by updating room status, rendering price comparison, finding the current user's booking, and redirecting when available.
- [~] Continue hardening edge cases where dispatch HTTP and WebSocket responses arrive out of order.

### 6:30-7:00 - Booking Confirmation and My Bookings

- [x] Create booking types and booking API client functions.
- [x] Create `/bookings/[bookingId]` with success state, partner, price, ETA, route, room summary, and CTAs.
- [x] Create `/bookings` with user filtering, booking list, empty state, error state, and retry.
- [x] Milestone 3 API check: countdown dispatch creates bookings, confirmed bookings show in booking detail and history.

## Phase 4 - UI Language and Onboarding

- [x] English-only UI copy across active frontend pages and components.
- [x] NextStepJS onboarding tour with first-run auto-start and persistent Guide replay from the navbar.

## API Contract Checklist

- [x] `GET /users`
- [x] `GET /addresses?q=&limit=`
- [x] `POST /rooms`
- [x] `GET /rooms?originLat=&originLng=&destLat=&destLng=&excludeUserId=`
- [x] `GET /rooms/{roomId}`
- [x] `POST /rooms/{roomId}/join`
- [x] `POST /rooms/{roomId}/dispatch`
- [x] `POST /rooms/{roomId}/cancel`
- [x] `DELETE /rooms/{roomId}/members/{userId}`
- [x] `GET /bookings?userId=`
- [x] `GET /bookings/{bookingId}`
- [x] `SUBSCRIBE /topic/room/{roomId}`

## Shared FE Quality Checklist

- [x] All API calls have typed request/response shapes.
- [x] No old `RideRequest` or driver-centric copy remains on Hub-Ride pages.
- [x] TanStack Query cache invalidates/refetches after create, join, dispatch, cancel, and leave.
- [x] All forms have labels, helper/error text, and keyboard focus states.
- [x] All async pages include loading, empty, and error states.
- [~] Button labels fit one line on desktop and mobile.
- [ ] Responsive check for 390px, 768px, and 1440px.
- [ ] Reduced motion is respected for non-essential animation.
- [x] No visible em dash or en dash in UI copy.
- [x] English-only active UI copy, excluding API seed names and returned location data.
- [ ] No fake precise numbers unless they come from API/mock seed data.
- [x] Run `pnpm lint`.
- [x] Run `pnpm build`.
- [x] Run `docker build -t hub-ride-frontend:test ./hub-ride-frontend`.

## Demo Script for Phase 1-4

1. Start BE at `localhost:8081` and FE at `localhost:3000`.
2. Open `/` and confirm the first-run onboarding tour appears once.
3. Use the Guide button in the navbar to replay the onboarding tour.
4. Browser A selects user Lan and opens `/rooms/new`.
5. Lan picks `KTX Khu A` -> `District 1`, then creates a room.
6. Browser B selects user Mai and opens `/rooms/browse`.
7. Mai searches the same route and joins Lan's room.
8. Both browsers open `/rooms/{roomId}` and see room members update.
9. Countdown reaches 0 and FE calls dispatch.
10. Room shows partner comparison and redirects to booking confirmation.
11. Open `/bookings` for Lan and Mai, then verify the confirmed booking appears.
