# Hub-Ride — Ridesharing Aggregator Platform

> Giảm **40–60% chi phí di chuyển** bằng cách gom nhóm hành khách có cùng tuyến đường, tích hợp Grab, Be, Xanh SM qua một giao diện duy nhất.

## Mục lục

- [1. Problem](#1-problem)
- [2. Solution](#2-solution)
- [3. Tech Stack](#3-tech-stack)
- [4. Architecture](#4-architecture)
- [5. Project Structure](#5-project-structure)
- [6. Prerequisites](#6-prerequisites)
- [7. Cài đặt nhanh với Docker](#7-cài-đặt-nhanh-với-docker)
- [8. Cài đặt thủ công (Local Development)](#8-cài-đặt-thủ-công-local-development)
  - [8.1 Backend — Spring Boot](#81-backend--spring-boot)
  - [8.2 Frontend — Next.js](#82-frontend--nextjs)
- [9. Environment Variables](#9-environment-variables)
- [10. Database Setup — Neon PostgreSQL](#10-database-setup--neon-postgresql)
- [11. Running the Application](#11-running-the-application)
- [12. API Documentation](#12-api-documentation)
- [13. Key Features Explained](#13-key-features-explained)
  - [13.1 H3 Geospatial Search](#131-h3-geospatial-search)
  - [13.2 Real-time WebSocket](#132-real-time-websocket)
  - [13.3 Price Aggregator](#133-price-aggregator)
- [14. Demo Walkthrough](#14-demo-walkthrough)
- [15. Deployment](#15-deployment)

---

## 1. Problem

- Lương trung bình người lao động Việt Nam chỉ **325,000 VND/ngày**, nhưng một chuyến xe một mình tốn **50,000–80,000 VND** — chiếm 15–25% thu nhập/ngày.
- TPHCM có mật độ đường chỉ **2.38 km/km²**, gây tắc đường nghiêm trọng và thải **13 triệu tấn CO₂/năm**.
- Các ứng dụng gọi xe hiện tại không có cơ chế chia sẻ chuyến giữa nhiều khách đi cùng tuyến.

## 2. Solution

**Hub-Ride** là lớp trung gian tổng hợp (Aggregator Service Layer) kết nối Grab, Be, Xanh SM, cho phép:

- **Gom nhóm hành khách** có cùng điểm đi, điểm đến trong khung thời gian 5 phút
- **Hub-based Routing** — đón/trả tại các Hub (điểm tập trung trên trục đường chính, không door-to-door)
- **So sánh giá** từ 3 đối tác, chọn giá rẻ nhất, chia đều cho group
- **Giảm 40–60% chi phí** so với đi một mình

---

## 3. Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | React framework, server-side rendering |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Utility-first styling |
| **shadcn/ui** | Component library (Radix UI + Tailwind) |
| **TanStack Query v5** | Server state, caching, background refetch |
| **Zustand** | Client state (current user) |
| **STOMP.js + SockJS** | Real-time WebSocket |
| **Framer Motion** | Animations |
| **Goong Geocoding API** | Address search (Vietnam map) |

### Backend

| Technology | Purpose |
|---|---|
| **Spring Boot 3.3.0** | Java REST API framework |
| **Java 17** | Language runtime |
| **Spring Data JPA** | ORM layer over PostgreSQL |
| **Spring WebSocket + STOMP** | Real-time push to clients |
| **H3 (com.uber:h3:4.1.1)** | Geospatial indexing |
| **SpringDoc OpenAPI** | Swagger UI at `/swagger-ui.html` |
| **Lombok** | Reduce boilerplate |
| **java-dotenv** | Load `.env` file |
| **Maven** | Dependency management |

### Database

| Technology | Purpose |
|---|---|
| **PostgreSQL (Neon)** | Relational database, partial index, UUID |
| **H3 Hexagonal Grid** | Spatial indexing for nearby room search |
| **Neon Free Tier** | Serverless PostgreSQL, auto-scaling, branch DB |

---

## 4. Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client (Browser)                              │
│   Next.js 16 — Landing, Create Room, Browse, Room Detail, Bookings       │
│   STOMP over SockJS — Real-time: member join, countdown, dispatch       │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ HTTP REST + WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Spring Boot 3.3.0  (port 8081)                 │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────────────┐   │
│  │ RoomModule  │  │ AddressMod  │  │   AggregatorModule          │   │
│  │ • create    │  │ • search    │  │ • GrabMockClient           │   │
│  │ • join      │  │             │  │ • BeMockClient              │   │
│  │ • dispatch  │  │             │  │ • XanhSmMockClient          │   │
│  │ • cancel    │  │             │  │ • picks cheapest            │   │
│  └──────┬──────┘  └──────┬─────┘  └─────────────┬────────────────┘   │
│         │                │                       │                     │
│  ┌──────┴────────────────┴───────────────────────┴───────────────┐    │
│  │              H3GeoService — latLngToCell, gridDisk(k=2)       │    │
│  │              Haversine distance, ETA estimation                 │    │
│  └──────────────────────────┬─────────────────────────────────────┘    │
└─────────────────────────────┼──────────────────────────────────────────┘
                              │ JDBC
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              Neon PostgreSQL (postgresql://ep-xxx/neondb)               │
│                                                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │  users   │  │ addresses│  │     rooms      │  │room_members    │  │
│  │ (5 seed) │  │ (20 seed)│  │ status=OPEN   │  │ UNIQUE(room,  │  │
│  │          │  │ HUB+POP  │  │ origin_h3 idx  │  │  user_id)      │  │
│  └──────────┘  └──────────┘  └────────────────┘  └────────────────┘  │
│                                                          ┌──────────┐ │
│                                                          │ bookings │ │
│                                                          └──────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. CREATE ROOM
   Client ──POST /rooms──▶ RoomService.createRoom()
                                   ├── H3: latLngToCell(origin/dest)
                                   ├── Haversine: estimateRouteKm()
                                   ├── Save Room → DB (status=OPEN, countdown=30s)
                                   ├── Save RoomMember (HOST)
                                   └── Return: roomId, countdownSec, origin/dest info

2. SEARCH ROOMS (nearby)
   Client ──GET /rooms?originLat=...&originLng=...&destLat=...&destLng=...──▶
                                    ├── H3: gridDisk(k=2) → 19 cells
                                    ├── Partial Index: origin_h3 IN cells AND status='OPEN'
                                    ├── Filter: dest_h3 matches
                                    ├── Haversine: straight-line distance
                                    └── Return: list of matching rooms sorted by distance

3. JOIN ROOM
   Client ──POST /rooms/{id}/join──▶ RoomService.joinRoom()
                                   ├── Check: room status=OPEN
                                   ├── Save: RoomMember (JOINER)
                                   └── WebSocket: broadcast JOIN event to /topic/room/{id}

4. COUNTDOWN → DISPATCH (Frontend-side timer)
   Frontend: setInterval countdown
   At t=0: Client ──POST /rooms/{id}/dispatch──▶ DispatchService.dispatch()
                                                    ├── Fetch quotes from all 3 partners
                                                    ├── Pick cheapest partner
                                                    ├── Save Booking per member
                                                    ├── Update Room status=DISPATCHED
                                                    └── WebSocket: broadcast DISPATCHED event
```

---

## 5. Project Structure

```
Grab_Future_Hackathon_Team_F/
├── README.md                          # This file
├── docker-compose.yml                 # Docker: backend + frontend + network
│
├── hub-ride-backend/                   # Spring Boot backend
│   ├── pom.xml                        # Maven dependencies
│   ├── .env                           # Database + Goong API keys
│   └── src/main/
│       ├── java/com/hubride/
│       │   ├── HubRideApplication.java # Loads .env before Spring starts
│       │   │
│       │   ├── config/
│       │   │   ├── WebSocketConfig.java     # STOMP broker, /ws endpoint
│       │   │   ├── CorsConfig.java          # Allow localhost:8081
│       │   │   └── SwaggerConfig.java       # OpenAPI info
│       │   │
│       │   ├── common/
│       │   │   ├── response/ApiResponse.java       # Generic envelope {success, data, message}
│       │   │   ├── exception/
│       │   │   │   ├── ErrorCode.java             # 12 error codes enum
│       │   │   │   ├── AppException.java           # RuntimeException wrapper
│       │   │   │   └── GlobalExceptionHandler.java # @RestControllerAdvice
│       │   │   └── enums/
│       │   │       ├── RoomStatus.java   # OPEN, DISPATCHED, CANCELLED, EXPIRED
│       │   │       ├── BookingStatus.java # CONFIRMED, COMPLETED, CANCELLED
│       │   │       ├── MemberRole.java    # HOST, JOINER
│       │   │       └── Partner.java       # GRAB, BE, XANH_SM
│       │   │
│       │   └── module/
│       │       ├── room/
│       │       │   ├── entity/
│       │       │   │   ├── Room.java          # hostUserId, origin/dest H3, status, countdown
│       │       │   │   ├── RoomMember.java    # room-user role, amountHeld, unique constraint
│       │       │   │   └── Booking.java       # partner, price, vehicle, eta
│       │       │   ├── repository/
│       │       │   │   ├── RoomRepository.java      # findOpenRoomsInCells (H3 + status filter)
│       │       │   │   ├── RoomMemberRepository.java
│       │       │   │   └── BookingRepository.java
│       │       │   ├── service/
│       │       │   │   ├── RoomService.java     # create/join/cancel/leave/search
│       │       │   │   ├── DispatchService.java # getQuotes, pick cheapest, save bookings
│       │       │   │   ├── BookingService.java # getBookings
│       │       │   │   └── H3GeoService.java   # H3 res=9, k=2, Haversine, ETA
│       │       │   ├── controller/
│       │       │   │   ├── RoomController.java    # /api/v1/rooms/*
│       │       │   │   └── BookingController.java # /api/v1/bookings/*
│       │       │   ├── websocket/
│       │       │   │   └── RoomWebSocketController.java # /app/room/{id}/join|leave
│       │       │   └── config/
│       │       │       └── RoomProperties.java  # hubride.room.countdown-seconds
│       │       │
│       │       ├── aggregator/                  # Mock pricing from Grab/Be/Xanh SM
│       │       │   ├── PartnerMockClient.java    # Interface
│       │       │   ├── PartnerQuote.java         # Record: partner, price, eta, surge
│       │       │   ├── GrabMockClient.java       # Random 60k-120k, surge 1.0-2.0
│       │       │   ├── BeMockClient.java         # Random 55k-100k, surge 1.0-1.5
│       │       │   ├── XanhSmMockClient.java     # Random 50k-90k, surge 1.0
│       │       │   ├── AggregatorService.java    # Collect quotes, pick cheapest
│       │       │   └── PartnerRegistry.java       # Bean registry
│       │       │
│       │       ├── address/
│       │       │   ├── AddressController.java    # GET /api/v1/addresses?q=&limit=
│       │       │   ├── AddressService.java
│       │       │   ├── AddressRepository.java
│       │       │   └── Address.java / AddressResponse.java
│       │       │
│       │       └── user/
│       │           ├── UserController.java       # GET /api/v1/users
│       │           ├── UserService.java
│       │           ├── UserRepository.java
│       │           └── User.java / UserResponse.java
│       │
│       └── resources/
│           ├── application.yml            # Spring config, env vars, Swagger
│           └── db/
│               ├── init.sql               # Full schema + indexes + seed data
│               └── migrate.sql            # Add origin_label/dest_label columns
│
├── hub-ride-frontend/                     # Next.js 16 frontend
│   ├── package.json                       # Next 16.2.9, React 19, TanStack Query 5
│   ├── next.config.ts
│   ├── Dockerfile                         # Node 22 alpine, multi-stage build
│   └── src/
│       ├── app/
│       │   ├── layout.tsx                 # Root layout, Geist font, Providers
│       │   ├── page.tsx                   # Landing page
│       │   ├── providers.tsx              # QueryClient + Onboarding + Toaster
│       │   ├── globals.css                # Tailwind CSS 4, oklch colors, dark mode
│       │   ├── rooms/
│       │   │   ├── new/page.tsx          # Create room form
│       │   │   ├── [roomId]/page.tsx     # Room detail + countdown + dispatch
│       │   │   └── browse/page.tsx       # Browse/search rooms
│       │   └── bookings/
│       │       ├── page.tsx              # Booking history list
│       │       └── [bookingId]/page.tsx  # Booking detail
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── AppShell.tsx          # Navbar + Footer wrapper
│       │   │   ├── Navbar.tsx            # Logo, nav links, WalletBadge, UserSwitcher
│       │   │   └── Footer.tsx
│       │   ├── room/
│       │   │   ├── CountdownTimer.tsx    # setInterval countdown, progress bar
│       │   │   ├── MemberList.tsx        # Member avatars + HOST crown icon
│       │   │   ├── PriceCompare.tsx      # PartnerCard list
│       │   │   └── PartnerCard.tsx       # Partner name, price, ETA, "Best fare" badge
│       │   ├── search/
│       │   │   └── AddressAutocomplete.tsx # Debounced Goong search, 300ms
│       │   ├── shared/
│       │   │   ├── UserSwitcher.tsx      # Switch demo user
│       │   │   └── WalletBadge.tsx      # Current user wallet balance
│       │   ├── onboarding/
│       │   │   ├── OnboardingRoot.tsx    # NextStep provider
│       │   │   ├── OnboardingLauncher.tsx # Help button, auto-start tour
│       │   │   └── tour-steps.tsx       # 11-step guided tour
│       │   └── ui/                       # shadcn components (button, card, etc.)
│       │
│       ├── lib/
│       │   ├── api-client.ts             # requestJson wrapper, envelope unwrap
│       │   ├── api/
│       │   │   ├── room.ts               # createRoom, searchRooms, joinRoom, dispatch...
│       │   │   ├── booking.ts            # getBookings, getBooking
│       │   │   ├── user.ts               # getUsers
│       │   │   └── address.ts            # searchAddresses
│       │   ├── ws/
│       │   │   └── useRoomSubscription.ts # STOMP hook, /topic/room/{id}, reconnect
│       │   ├── store/
│       │   │   └── userStore.ts         # Zustand: currentUser, setCurrentUser
│       │   └── utils/
│       │       ├── format.ts             # formatVnd, formatKm, formatCountdown
│       │       └── geo.ts                # haversineKm, estimateRouteKm
│       │
│       └── types/
│           ├── room.ts      # RoomStatus, RoomDetail, CreateRoomRequest...
│           ├── booking.ts   # BookingStatus, Booking
│           ├── user.ts     # DemoUser
│           ├── address.ts  # AddressKind, Address, SelectedPlace
│           ├── partner.ts  # Partner, PartnerQuote
│           └── ride.ts     # HubStats, HubSnapshot
│
└── docs/
    ├── hub-ride-architecture.md  # Comprehensive architecture blueprint (1402 lines)
    ├── code-logic-explanation.md # Code logic deep-dive
    └── github_workflow.md        # Git conventions, PR process
```

---

## 6. Prerequisites

| Tool | Version | Install |
|---|---|---|
| **Java** | 17+ | [Adoptium](https://adoptium.net/) |
| **Maven** | 3.9+ | `brew install maven` / `sdk install maven` |
| **Node.js** | 20+ | [nodejs.org](https://nodejs.org) |
| **pnpm** | 9+ | `npm install -g pnpm` |
| **PostgreSQL client** | 15+ | `psql` (for DB setup) |
| **Docker + Docker Compose** | 24+ | [docker.com](https://www.docker.com/products/docker-desktop/) |

---

## 7. Cài đặt nhanh với Docker

### Cách nhanh nhất (khuyến nghị)

```bash
# 1. Clone repo
git clone <repo-url>
cd Grab_Future_Hackathon_Team_F

# 2. Tạo .env từ template
cp hub-ride-backend/.env.example hub-ride-backend/.env
# Sau đó điền DATABASE_URL, DATABASE_USER, DATABASE_PASSWORD vào .env

# 3. Build và chạy tất cả (backend + frontend)
docker compose up --build

# 4. Truy cập
# Frontend: http://localhost:3000
# Backend API: http://localhost:8081/api/v1
# Swagger UI: http://localhost:8081/swagger-ui.html
```

**docker-compose.yml** tự động:
- Build backend từ `hub-ride-backend/`, expose port **8081**
- Build frontend từ `hub-ride-frontend/`, expose port **3000**
- Đọc env vars từ `hub-ride-backend/.env`
- Frontend depends on backend (chờ backend khởi động xong)

### Environment variables cho Docker

Tạo file `.env` ở root (hoặc `hub-ride-backend/.env`):

```bash
# Database (Neon PostgreSQL) — bắt buộc
DATABASE_URL=jdbc:postgresql://your-neon-host/neondb?sslmode=require
DATABASE_USER=your_neon_user
DATABASE_PASSWORD=your_neon_password

# Room countdown (tùy chọn, mặc định 30s cho demo)
ROOM_COUNTDOWN_SECONDS=30

# Goong API (tùy chọn — address autocomplete)
GOONG_API_KEY=your_goong_api_key

# Frontend env (cho docker-compose)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8081/ws
NEXT_PUBLIC_ROOM_COUNTDOWN_SECONDS=30
```

---

## 8. Cài đặt thủ công (Local Development)

### 8.1 Backend — Spring Boot

#### Bước 1: Cài đặt Database (Neon PostgreSQL)

1. Đăng ký [Neon Console](https://neon.tech) (free tier)
2. Tạo project → copy connection string

```bash
# Ví dụ connection string từ Neon:
# postgres://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

3. Chạy schema init (PowerShell):

```powershell
# Cài psql (hoặc dùng Neon Console SQL Editor)
# Kết nối:
psql "postgres://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Chạy schema:
\i d:/GrabHackathon/Grab_Future_Hackathon_Team_F/hub-ride-backend/src/main/resources/db/init.sql

# Hoặc chạy migration:
\i d:/GrabHackathon/Grab_Future_Hackathon_Team_F/hub-ride-backend/src/main/resources/db/migrate.sql
```

Hoặc paste nội dung file `init.sql` vào **Neon Console → SQL Editor** và click Run.

#### Bước 2: Cấu hình Environment Variables

```bash
# Tạo .env ở hub-ride-backend/
cd hub-ride-backend

# Windows (PowerShell)
@"
DATABASE_URL=jdbc:postgresql://your-neon-host/neondb?sslmode=require
DATABASE_USER=your_neon_user
DATABASE_PASSWORD=your_neon_password
"@ | Out-File -FilePath .env -Encoding utf8
```

Hoặc tạo file `hub-ride-backend/.env` thủ công:

```env
DATABASE_URL=jdbc:postgresql://ep-mute-snow-aovpxazr-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
DATABASE_USER=neondb_owner
DATABASE_PASSWORD=npg_xxxxxxxxxxxx
```

#### Bước 3: Build và chạy Backend

```bash
cd hub-ride-backend

# Build
mvn clean package -DskipTests

# Chạy (Java sẽ tự động đọc .env qua java-dotenv)
mvn spring-boot:run

# Hoặc chạy JAR đã build
java -jar target/hub-ride-backend-1.0.0.jar
```

Backend khởi động tại **http://localhost:8081**.

#### Kiểm tra Backend

```bash
# Health check
curl http://localhost:8081/api/v1/users

# Swagger UI
open http://localhost:8081/swagger-ui.html

# Tất cả endpoints REST
# GET  /api/v1/users
# GET  /api/v1/users/{id}
# GET  /api/v1/addresses?q=&limit=
# POST /api/v1/rooms
# GET  /api/v1/rooms?originLat=&originLng=&destLat=&destLng=&excludeUserId=
# GET  /api/v1/rooms/{id}
# POST /api/v1/rooms/{id}/join
# POST /api/v1/rooms/{id}/cancel
# POST /api/v1/rooms/{id}/dispatch
# DELETE /api/v1/rooms/{id}/members/{userId}
# GET  /api/v1/bookings?userId=
# GET  /api/v1/bookings/{id}
```

---

### 8.2 Frontend — Next.js

#### Bước 1: Cài đặt pnpm

```bash
npm install -g pnpm
```

#### Bước 2: Cài đặt dependencies

```bash
cd hub-ride-frontend
pnpm install
```

#### Bước 3: Tạo file `.env.local`

Tạo file `hub-ride-frontend/.env.local`:

```env
# API Base URL — trỏ đến backend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api/v1

# WebSocket URL — cho STOMP/SockJS
NEXT_PUBLIC_WS_URL=ws://localhost:8081/ws

# Goong API Key — tùy chọn (address autocomplete)
# Lấy key tại: https://account.goong.io
NEXT_PUBLIC_GOONG_API_KEY=your_goong_api_key

# Countdown seconds cho demo (mặc định 30)
NEXT_PUBLIC_ROOM_COUNTDOWN_SECONDS=30
```

#### Bước 4: Chạy Development Server

```bash
cd hub-ride-frontend
pnpm dev

# Frontend khởi động tại http://localhost:3000
```

#### Bước 5: Truy cập ứng dụng

Mở trình duyệt: **http://localhost:3000**

---

## 9. Environment Variables

### Backend (`hub-ride-backend/.env`)

```env
# === Database (Neon PostgreSQL) ===
DATABASE_URL=jdbc:postgresql://ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
DATABASE_USER=neondb_owner
DATABASE_PASSWORD=npg_xxxxxxxxxxxx

# === Application ===
# Override countdown seconds (default: 30)
ROOM_COUNTDOWN_SECONDS=30
```

### Frontend (`hub-ride-frontend/.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8081/ws
NEXT_PUBLIC_GOONG_API_KEY=
NEXT_PUBLIC_ROOM_COUNTDOWN_SECONDS=30
```

---

## 10. Database Setup — Neon PostgreSQL

### Tạo tài khoản Neon

1. Truy cập [neon.tech](https://neon.tech) → Đăng ký (free)
2. Dashboard → **New Project** → đặt tên `hub-ride`
3. Copy connection string từ Connection Details

### Chạy Schema

**Cách 1: Neon Console SQL Editor**

1. Mở Neon Dashboard → **SQL Editor**
2. Copy toàn bộ nội dung `hub-ride-backend/src/main/resources/db/init.sql`
3. Paste vào SQL Editor → **Run**
4. Chạy tiếp `migrate.sql` để thêm columns

**Cách 2: psql command line**

```bash
# Kết nối đến Neon
psql "postgres://USER:PASSWORD@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Chạy schema
\i /path/to/init.sql

# Chạy migration
\i /path/to/migrate.sql
```

### Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                          USERS                                   │
│  id(UUID) │ full_name │ phone(UNIQUE) │ wallet_balance │ c...   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ 1:N
┌──────────────────────────┴──────────────────────────────────────┐
│                       ROOMS                                     │
│  id(UUID) │ host_user_id │ origin_h3 │ dest_h3 │ status │ cd... │
└──────┬─────────────────────────────────────────────────────────┘
       │ 1:N
┌──────┴─────────────────────────────────────────────────────────┐
│                    ROOM_MEMBERS                                 │
│  id(UUID) │ room_id │ user_id │ role │ amount_held │ joined_at │
│  UNIQUE(room_id, user_id)                                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ N:1
┌──────────────────────────┴──────────────────────────────────────┐
│                       BOOKINGS                                  │
│  id(UUID) │ room_id │ user_id │ partner │ price_paid │ status  │
└─────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                       ADDRESSES                                  │
│  id(UUID) │ label │ full_address │ lat │ lng │ h3_index │ kind │
│  kind: HUB | POPULAR | CUSTOM                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Indexes

```sql
-- Partial index: chỉ index rows OPEN → index nhẹ hơn 99%
CREATE INDEX idx_rooms_status_origin_h3 ON rooms(origin_h3) WHERE status = 'OPEN';

-- User lookup
CREATE INDEX idx_room_members_user ON room_members(user_id);

-- Booking history
CREATE INDEX idx_bookings_user ON bookings(user_id, created_at DESC);
```

---

## 11. Running the Application

### Docker (khuyến nghị)

```bash
docker compose up --build
```

### Manual — Backend riêng

```bash
# Terminal 1: Backend
cd hub-ride-backend
mvn spring-boot:run
# → http://localhost:8081

# Terminal 2: Frontend
cd hub-ride-frontend
pnpm dev
# → http://localhost:3000
```

### Demo Flow

1. Mở **http://localhost:3000**
2. **Landing page** → nhấn "Bắt đầu ngay" hoặc "Create Room"
3. **User Switcher** (góc phải navbar) → chọn demo user (Lan/Mai/Khoa/Hung/Linh)
4. **Create Room** → chọn điểm đi (VD: KTX Khu A), điểm đến (VD: Quan 1)
5. **Room Detail** → countdown 30s, member list, giá so sánh Grab/Be/Xanh SM
6. **Mở tab khác** → đổi user → Browse Rooms → join cùng room
7. Khi countdown = 0 → nhấn "Dispatch" → xem booking confirmation

---

## 12. API Documentation

Swagger UI: **http://localhost:8081/swagger-ui.html**

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/rooms` | Tạo room mới |
| `GET` | `/api/v1/rooms?originLat=&originLng=&destLat=&destLng=` | Tìm rooms gần đó |
| `GET` | `/api/v1/rooms/{id}` | Chi tiết room |
| `POST` | `/api/v1/rooms/{id}/join` | Tham gia room |
| `POST` | `/api/v1/rooms/{id}/cancel` | Host hủy room |
| `POST` | `/api/v1/rooms/{id}/dispatch` | Dispatch (tạo booking) |
| `DELETE` | `/api/v1/rooms/{id}/members/{userId}` | Rời room |
| `GET` | `/api/v1/bookings?userId=` | Lịch sử booking |
| `GET` | `/api/v1/bookings/{id}` | Chi tiết booking |
| `GET` | `/api/v1/users` | Danh sách demo users |
| `GET` | `/api/v1/addresses?q=&limit=` | Tìm địa chỉ |

### WebSocket

```
STOMP Endpoint: ws://localhost:8081/ws
Subscribe: /topic/room/{roomId}
Send to: /app/room/{roomId}/join, /app/room/{roomId}/leave
```

**Events:**
```json
// JOIN event
{"event": "JOIN", "payload": {"memberCount": 3}}

// LEAVE event
{"event": "LEAVE", "payload": {"userId": "uuid"}}

// CANCELLED event
{"event": "CANCELLED", "payload": {"roomId": "uuid"}}

// DISPATCHED event
{"event": "DISPATCHED", "payload": {
  "roomId": "uuid",
  "bestQuote": {...},
  "allQuotes": [...],
  "bookings": [...]
}}
```

---

## 13. Key Features Explained

### 13.1 H3 Geospatial Search

**Bài toán:** Tìm tất cả rooms gần điểm đón, cùng điểm đến.

**Giải pháp:** Dùng H3 hexagonal grid system (res=9, k=2).

```java
// 1. Tính H3 cell cho điểm đón của user
String originH3 = h3.latLngToCell(originLat, originLng); // res=9

// 2. Tạo vùng tìm kiếm: 19 cells xung quanh (k=2 ring)
List<String> searchArea = h3.gridDisk(originH3); // ["cell1", "cell2", ... 19 cells]

// 3. Query: tìm rooms có origin_h3 trong 19 cells và status=OPEN
List<Room> candidates = roomRepository.findOpenRoomsInCells(cellArray);

// 4. Filter: điểm đến cũng phải gần (dest_h3 match)
.filter(r -> destArea.contains(r.getDestH3()))

// 5. Tính khoảng cách Haversine → sort by distance
.sorted((a, b) -> Double.compare(a.getDistanceKm(), b.getDistanceKm()))
```

**Tại sao H3 thay vì PostGIS?**
- H3 index nhẹ (string 15 chars) → index được trong PostgreSQL bình thường
- `gridDisk(k=2)` trả về 19 cells → có thể dùng `IN` clause
- Không cần cài extension, chạy 100% trên Java side
- Khi scale lên production → có thể dùng `h3-postgres` extension trong DB

### 13.2 Real-time WebSocket

STOMP over SockJS cung cấp real-time updates mà không cần polling:

```typescript
// Frontend: useRoomSubscription.ts
const stompClient = new StompJs.Client({
  brokerURL: 'ws://localhost:8081/ws',
  reconnectDelay: 2500,
});

stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
  const event: RoomEvent = JSON.parse(message.body);
  switch (event.event) {
    case 'JOIN':      setMemberCount(event.payload.memberCount); break;
    case 'LEAVE':     refetchRoom(); break;
    case 'CANCELLED': router.push('/rooms/browse'); break;
    case 'DISPATCHED': router.push(`/bookings/${bookingId}`); break;
  }
});
```

```java
// Backend: RoomService.java — broadcast khi có thay đổi
messagingTemplate.convertAndSend(
    "/topic/room/" + roomId,
    new WsPayload("JOIN", Map.of("memberCount", allMembers.size()))
);
```

### 13.3 Price Aggregator

```java
// AggregatorService.java
public QuoteResult getQuotes(Room room, int memberCount) {
    List<PartnerQuote> quotes = mockClients.stream()
        .map(client -> client.quote(room))  // Grab, Be, XanhSM đều trả về PartnerQuote
        .toList();

    PartnerQuote cheapest = quotes.stream()
        .min(Comparator.comparing(PartnerQuote::priceAfterSurge))
        .orElseThrow();

    return new QuoteResult(cheapest, quotes, (long) cheapest.priceAfterSurge() / memberCount);
}
```

Mock pricing:

| Partner | Base Price | Surge | ETA |
|---------|-----------|-------|-----|
| Grab | 60k–120k VND | 1.0–2.0x | 10–25 phút |
| Be | 55k–100k VND | 1.0–1.5x | 12–28 phút |
| Xanh SM | 50k–90k VND | 1.0x fixed | 15–30 phút |

---

## 14. Demo Walkthrough

### Script demo 5 phút

```
1. Mở trình duyệt → http://localhost:3000  (Frontend)
2. Giới thiệu landing page: "Hub-Ride — Ridesharing Aggregator"

3. Demo 1: Tạo Room (User Lan làm Host)
   - Nhấn "Tạo phòng" → User: Lan → điểm đi: KTX Khu A → điểm đến: Quan 1
   - Xem countdown 30s, khoảng cách, ETA

4. Demo 2: Join Room (User Mai join)
   - Mở tab mới / window mới → http://localhost:3000/rooms/browse
   - Đổi User: Mai → tìm room "KTX Khu A → Quan 1" → nhấn "Tham gia"
   - Quan sát: Member list cập nhật real-time (WebSocket)
   - User Lan thấy Mai xuất hiện trong danh sách

5. Demo 3: Dispatch (countdown = 0)
   - Lan nhấn "Dispatch ngay" → hiện bảng so sánh giá Grab/Be/Xanh SM
   - Xem booking confirmation: partner nào rẻ nhất, giá per person
   - Redirect đến trang booking

6. Demo 4: Booking History
   - Mai mở /bookings → thấy booking đã tạo
   - Lan mở /bookings → thấy booking đã tạo

7. Demo 5: Browse Rooms
   - Tạo room mới (Khoa làm Host): KTX Khu B → Ben Thanh
   - Browse: Linh tìm thấy → tham gia → countdown → dispatch
```

---

## 15. Deployment

### Docker Compose (VPS/Server)

```bash
# Clone repo
git clone <repo-url>
cd Grab_Future_Hackathon_Team_F

# Cấu hình .env
cp hub-ride-backend/.env.example hub-ride-backend/.env
nano hub-ride-backend/.env  # điền DATABASE_URL

# Build và chạy
docker compose up --build -d

# Logs
docker compose logs -f

# Stop
docker compose down
```

### Database (Production)

- **Neon** (recommended): Tạo production branch, dùng branch connection string
- **Supabase**: PostgreSQL hosted, tương tự Neon
- **Railway**: PostgreSQL plugin, easy setup

### Frontend (Production)

```bash
cd hub-ride-frontend

# Build
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com/api/v1 \
NEXT_PUBLIC_WS_URL=wss://api.your-domain.com/ws \
pnpm build

# Deploy output/standalone folder lên VPS hoặc Vercel
```

### Backend (Production)

```bash
cd hub-ride-backend

# Build JAR
mvn clean package -DskipTests

# Push image lên registry
docker build -t hub-ride-backend:latest ./hub-ride-backend
docker tag hub-ride-backend:latest your-registry/hub-ride-backend:latest
docker push your-registry/hub-ride-backend:latest

# Chạy trên VPS
docker run -d -p 8081:8081 \
  --env-file ./hub-ride-backend/.env \
  hub-ride-backend:latest
```

---

## Troubleshooting

### Lỗi "Connection refused" khi frontend gọi backend

Kiểm tra `NEXT_PUBLIC_API_BASE_URL` trong `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api/v1
```
Đảm bảo backend đang chạy ở port 8081.

### Lỗi "WebSocket is not defined"

Đảm bảo `NEXT_PUBLIC_WS_URL` đúng:
```env
NEXT_PUBLIC_WS_URL=ws://localhost:8081/ws
```
STOMP cần `ws://` (hoặc `wss://` cho HTTPS), không phải `http://`.

### Database connection failed

Kiểm tra `.env` ở backend:
```env
DATABASE_URL=jdbc:postgresql://...  # JDBC URL, không phải PostgreSQL URL
```
Đảm bảo có `?sslmode=require` ở cuối.

### Lỗi "Route too short" (< 2km)

Tính năng safety check — khoảng cách Haversine phải >= 2km. Chọn 2 địa điểm xa hơn trong seed data (VD: KTX Khu A → Lotte Mart Q7).

### Migration lỗi "column already exists"

File `init.sql` dùng `CREATE TABLE IF NOT EXISTS` — an toàn khi chạy lại. File `migrate.sql` dùng `IF NOT EXISTS` — cũng an toàn.
