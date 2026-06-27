# Hub-Ride FE Tasks

> Scope: hoan thanh Phase 1-3 theo `docs/hub-ride-architecture.md`.
> Backend API da co, FE can noi API that, bo dan mock ride-sharing cu, va chay duoc flow demo: Host tao phong -> Joiner join -> Countdown -> Dispatch -> Booking confirm.

## Tracking Rules

- Status: `[ ]` todo, `[~]` in progress, `[x]` done, `[!]` blocked or needs BE/API confirmation.
- Moi task FE phai co loading, empty, error state neu co data/API.
- Uu tien countdownSec tu BE. `NEXT_PUBLIC_ROOM_COUNTDOWN_SECONDS` chi la fallback preview.
- UI theo `design-taste-frontend/SKILL.md`: mot design system, shadcn/ui customized, form label nam tren input, button contrast ro, mobile collapse ro, no em-dash trong visible copy.
- Khong them landing marketing dai. First screen phai giup user tao phong hoac tim phong.

## Current FE Snapshot

- [x] Next app shell da co `layout`, `Navbar`, `Footer`, shadcn primitives, Tailwind v4.
- [x] Dependencies chinh da co: `@stomp/stompjs`, `sockjs-client`, `@tanstack/react-query`, `react-hook-form`, `zod`, `zustand`, `lucide-react`, `framer-motion`.
- [x] Landing page da doi sang Hub-Ride Host/Join flow.
- [x] Da co route `/rooms/new`, `/rooms/browse`, `/rooms/[roomId]`, `/bookings`, `/bookings/[bookingId]`.
- [x] Da co API modules theo contract: `room.ts`, `booking.ts`, `address.ts`, `user.ts`.
- [x] Da co types domain Hub-Ride: room, booking, address, partner, user.
- [x] Da co WS subscription hook cho `/topic/room/{roomId}`.

## Phase 1 - Foundation (T+0 -> T+2h)

### 0:00-0:30 - FE Project Baseline

- [x] Verify package setup: Next, Tailwind, shadcn, pnpm scripts.
- [x] Tao `.env.local.example` cho FE:
  - `NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api/v1`
  - `NEXT_PUBLIC_WS_URL=ws://localhost:8081/ws`
  - `NEXT_PUBLIC_GOONG_API_KEY=...`
  - `NEXT_PUBLIC_ROOM_COUNTDOWN_SECONDS=30`
- [x] Doi app metadata/title sang Hub-Ride.
- [x] Chot route map FE theo architecture:
  - `/`
  - `/rooms/new`
  - `/rooms/browse`
  - `/rooms/[roomId]`
  - `/bookings`
  - `/bookings/[bookingId]`

### 0:30-1:00 - Layout, Navbar, Footer, Landing Hero

- [x] Update Navbar:
  - Brand `Hub-Ride`
  - Nav: `Tao phong`, `Tim phong`, `Lich su`
  - CTA chinh tro den `/rooms/new`
  - UserSwitcher va WalletBadge slot o desktop
- [x] Update Footer copy sang Hub-Ride aggregator, khong con copy driver availability cu.
- [x] Rebuild landing `/`:
  - Hero co signal ro: hub-based shared car, host/join room, best partner dispatch
  - Primary CTA: `Tao phong`
  - Secondary CTA: `Tim phong`
  - Search box nhanh cho origin/destination neu kip, hoac CTA vao route tuong ung
- [~] Add responsive QA cho landing:
  - Nav 1 dong tren desktop
  - CTA khong wrap
  - Mobile khong overlap text

### 1:00-1:30 - Address/User API and SearchBox

- [x] Tao `src/types/address.ts`:
  - `Address`, `AddressKind`, `GoongSuggestion`, `GoongPlaceDetail`
- [x] Tao `src/types/user.ts`:
  - `DemoUser`, `WalletBalance`
- [x] Tao `src/lib/api/address.ts`:
  - `searchAddresses(q, limit)` -> `GET /addresses?q=&limit=`
  - optional Goong autocomplete/detail helpers neu FE goi truc tiep Goong
- [x] Tao `src/lib/api/user.ts`:
  - `getUsers()` -> `GET /users`
- [x] Tao `src/components/search/AddressAutocomplete.tsx`:
  - Debounce 300ms
  - Loading skeleton/icon
  - Empty message: khong tim thay dia diem
  - Error fallback: cho phep retry
  - Label tren input, khong dung placeholder lam label
- [x] Tao `src/components/shared/UserSwitcher.tsx`.
- [x] Tao `src/components/shared/WalletBadge.tsx`.

### 1:30-2:00 - Create Room API and Browse Mock UI

- [x] Tao `src/types/room.ts`:
  - `RoomStatus = OPEN | DISPATCHED | CANCELLED | EXPIRED`
  - `RoomListItem`, `RoomDetail`, `RoomMember`, `CreateRoomRequest`, `JoinRoomRequest`
- [x] Tao `src/lib/api/room.ts`:
  - `createRoom(payload)` -> `POST /rooms`
  - `searchRooms(params)` -> `GET /rooms?originLat=&originLng=&destLat=&destLng=&excludeUserId=`
  - `getRoom(roomId)` -> `GET /rooms/{roomId}`
  - `joinRoom(roomId, userId)` -> `POST /rooms/{roomId}/join`
  - `dispatchRoom(roomId)` -> `POST /rooms/{roomId}/dispatch`
  - `cancelRoom(roomId)` -> `POST /rooms/{roomId}/cancel`
  - `leaveRoom(roomId, userId)` -> `DELETE /rooms/{roomId}/members/{userId}`
- [x] Create `/rooms/browse` UI voi API data:
  - Filter origin/destination
  - Room card co host, route, memberCount, countdownSec, distanceKm
  - Empty state dep khi chua chon route hoac khong co phong
- [x] Milestone 1 check:
  - [x] FE browse render duoc card khi BE co data
  - [x] Create room API function co type dung contract
  - [x] Landing CTA dieu huong dung

## Phase 2 - Core Mechanics (T+2h -> T+5h)

### 2:00-2:45 - Browse Page Wire API That

- [x] Noi `/rooms/browse` voi `searchRooms`.
- [x] Query params dung contract BE:
  - `originLat`, `originLng`, `destLat`, `destLng`, `excludeUserId`
- [x] Add TanStack Query keys:
  - `["rooms", "browse", originLat, originLng, destLat, destLng, userId]`
- [x] Room card actions:
  - `Join` button disabled neu current user la host/member
  - Navigate `/rooms/[roomId]` sau join thanh cong
  - Toast loi neu join fail
- [x] Skeleton list trong luc loading.
- [x] Error panel co retry.

### 2:45-3:30 - Create Room Form Hoan Chinh

- [x] Tao `/rooms/new`.
- [~] Form state voi local state. `react-hook-form` + `zod` chua can cho MVP nhanh.
- [x] Fields:
  - Current demo user
  - Origin address
  - Destination address
  - Route preview distance voi FE Haversine
- [x] Validate FE:
  - Origin/destination required
  - Lat/lng hop le
  - Canh bao neu duoi 2km
- [x] Submit:
  - Call `createRoom`
  - On success redirect `/rooms/{roomId}`
  - Show countdownSec returned tu BE trong success state
- [~] UI Stepper 2 buoc:
  - Chon route
  - Xac nhan pre-pay va tao phong

### 3:30-4:15 - WebSocket Client and Room Detail Subscribe

- [x] Tao `src/lib/ws/useRoomSubscription.ts`:
  - Read `NEXT_PUBLIC_WS_URL`
  - Connect/disconnect cleanly
  - Subscribe `/topic/room/{roomId}`
  - Parse events: `JOIN`, `LEAVE`, `DISPATCHED`, `CANCELLED`
- [x] Tao `RoomEvent` type trong `src/types/room.ts`.
- [x] Tao hook `src/lib/ws/useRoomSubscription.ts` hoac `src/hooks/useRoomSubscription.ts`.
- [x] Tao `/rooms/[roomId]`:
  - Fetch initial `getRoom(roomId)`
  - Subscribe WS sau khi co roomId
  - Update member list realtime
  - Reconcile event payload voi TanStack cache
- [~] Handle WS disconnected state:
  - Badge reconnecting
  - Fallback refetch room detail

### 4:15-5:00 - Countdown and MemberList Realtime

- [x] Tao `src/components/room/CountdownTimer.tsx`:
  - Input `initialSeconds`
  - FE tick bang `setInterval`
  - Clear interval on unmount
  - Change visual urgency khi `< 60s`
  - Call `onComplete` dung 1 lan
- [x] Tao `src/components/room/MemberList.tsx`:
  - Avatar initials
  - Host badge
  - Joiner count
  - Empty/solo state
- [x] Room detail layout:
  - Route summary
  - Countdown
  - MemberList
  - Join/Leave/Cancel actions theo role
- [x] Milestone 2 API check:
  - [x] Host tao phong thanh cong
  - [x] Joiner browse thay phong
  - [x] Joiner join thanh cong
  - [~] Ca 2 browser thay member list update realtime can browser demo test
  - [x] Countdown tick on client va khong bi double interval

## Phase 3 - Aggregator + Booking (T+5h -> T+7h)

### 5:00-5:45 - Partner Comparison Components

- [x] Tao `src/types/partner.ts`:
  - `Partner = GRAB | BE | XANH_SM`
  - `PartnerQuote { partner, totalPrice, etaMinutes, surgeMultiplier, vehicleType }`
  - `DispatchResult { bestQuote, allQuotes, bookings }`
- [x] Tao `src/components/room/PartnerCard.tsx`:
  - Logo/icon per partner
  - Total price, per-person estimate, ETA, vehicleType
  - Highlight best partner
- [x] Tao `src/components/room/PriceCompare.tsx`:
  - Render allQuotes
  - Loading state before dispatch
  - Empty state before countdown complete
- [x] Format money/time helpers:
  - `src/lib/utils/format.ts`
  - VND formatter
  - countdown formatter `mm:ss`

### 5:45-6:30 - Dispatch Trigger and Redirect Booking Confirm

- [x] Khi CountdownTimer complete:
  - Call `dispatchRoom(roomId)`
  - Prevent duplicate dispatch with ref/state guard
  - Show dispatch loading state
- [x] On `DISPATCHED` WS event:
  - Update room status
  - Render `PriceCompare`
  - Find booking for current user
  - Redirect `/bookings/{bookingId}` neu booking co trong response
- [~] Handle edge case:
  - Dispatch API fail -> retry CTA
  - WS event den truoc HTTP response -> cache reconcile
  - Booking list empty -> stay room detail va show error
- [x] Confirm BE response shape thuc te neu khac docs.

### 6:30-7:00 - Booking Confirm and My Bookings

- [x] Tao `src/types/booking.ts`:
  - `BookingStatus = CONFIRMED | COMPLETED | CANCELLED`
  - `Booking`, `BookingDetail`
- [x] Tao `src/lib/api/booking.ts`:
  - `getBookings(userId)` -> `GET /bookings?userId=`
  - `getBooking(bookingId)` -> `GET /bookings/{bookingId}`
- [x] Tao `/bookings/[bookingId]`:
  - Success state
  - Partner selected
  - Price paid
  - ETA
  - Route and room summary
  - CTA ve home hoac my bookings
- [x] Tao `/bookings`:
  - User filter via UserSwitcher/current user
  - Booking timeline/list
  - Empty state khi user chua co booking
  - Error retry
- [x] Milestone 3 API check:
  - [x] End-to-end API flow chay duoc
  - [x] Countdown 30s trigger dispatch dung 1 lan bang ref guard
  - [x] Booking data tra dung partner, gia, ETA
  - [x] My Bookings API hien booking moi tao

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

- [x] All API calls have typed request/response.
- [x] No old `RideRequest`/driver-centric copy remains on Hub-Ride pages.
- [x] TanStack Query cache invalidates/refetches after create/join/dispatch/cancel/leave.
- [x] All forms have labels, helper/error text, keyboard focus states.
- [x] All async pages include loading, empty, error.
- [~] Button labels fit one line on desktop and mobile.
- [ ] Responsive check for 390px, 768px, 1440px.
- [ ] Reduced motion respected for non-essential animation.
- [x] No visible em-dash or en-dash in UI copy.
- [ ] No fake precise numbers unless from API/mock seed.
- [x] Run `pnpm lint`.
- [x] Run `pnpm build`.

## Demo Script for Phase 1-3

1. Start BE at `localhost:8081` and FE at `localhost:3000`.
2. Browser A select user Lan, open `/rooms/new`.
3. Lan picks `KTX Khu A` -> `Quận 1`, creates room.
4. Browser B select user Mai, open `/rooms/browse`.
5. Mai searches same route, joins Lan room.
6. Both browsers open `/rooms/{roomId}` and see members update.
7. Countdown reaches 0, FE calls dispatch.
8. Room shows partner comparison and redirects to booking confirmation.
9. Open `/bookings` for Lan and Mai, verify confirmed booking appears.
