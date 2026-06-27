
# Hub-Ride — System Architecture Blueprint

> **Dự án:** Hub-Ride (Aggregator Ridesharing Platform)
> **Team:** 2 người | **Timeline:** 10 giờ (Hackathon)
> **Stack:** Spring Boot 3.x · Neon PostgreSQL · Next.js 14 · shadcn/ui · Tailwind · H3 · STOMP WebSocket

---

## 1. Mục tiêu & Phạm vi (Scope Lock)

**Hub-Ride** là một **Lớp dịch vụ trung gian (Aggregator Service Layer)** tích hợp trên các hãng xe công nghệ hiện có (Grab, Be, Xanh SM), hoạt động theo 3 cơ chế đột phá:

- **Hub-based Routing**: Đón/trả tại Hub (điểm tập trung trên trục đường chính), không door-to-door
- **Host & Join Room**: Gom nhóm người có cùng tuyến đường trong khung 5 phút (Time-boxed)
- **Aggregator**: So sánh giá mock giữa Grab/Be/Xanh SM, dispatch sang hãng rẻ nhất
- **Pre-pay**: Khóa tiền tạm trong ví, đếm ngược 5 phút chốt phòng
- **Minimum 2km**: Từ chối tuyến quá ngắn (khuyến khích đi bộ/xe đạp)

**Trong 10 tiếng MVP demo:**

- KHÔNG có auth (giả lập user qua dropdown)
- KHÔNG dùng map (input địa chỉ + lưu lat/lng)
- Mock hoàn toàn API Grab/Be/Xanh SM (random giá + surge multiplier)
- Tập trung UX/UI đẹp kiểu Agoda/Traveloka, flow Host/Join/Dispatch rõ ràng

### Bài toán giải quyết

| Stakeholder         | Vấn đề                                                      | Hub-Ride giải quyết                                   |
| ------------------- | -------------------------------------------------------------- | ------------------------------------------------------- |
| **Customers** | Áp lực tài chính khi đi ô tô, tốn thời gian săn giá | Giá rẻ tiệm cận xe máy (chia phòng), không surge |
| **Drivers**   | Deadhead miles lớn, kẹt xe trong hẻm                        | Chạy đường thẳng Hub → Hub                        |
| **Partners**  | Driver supply deficit giờ cao điểm                          | 1 xe chở 4 khách thay vì 1                           |
| **The City**  | 13 triệu tấn CO2/năm, kẹt xe                               | Giảm mật độ xe 4 chỗ lẻ tẻ                       |

---

## 2. Kiến trúc tổng quan

```mermaid
graph TB
    subgraph Frontend["Next.js 14 (App Router)"]
        LP["Landing Page"]
        HR["Host Room Page"]
        JR["Join Room Page"]
        RD["Room Detail (Countdown)"]
        BK["Booking Confirmation"]
        MY["My Bookings"]
    end

    subgraph Backend["Spring Boot 3.x"]
        RoomAPI["Room REST API"]
        WSHub["WebSocket Hub\n(STOMP /topic/room/{id})"]
        MatchEngine["Matching Engine\n(H3 k-ring)"]
        Aggregator["Aggregator Service\n(Mocked Pricing)"]
    end

    subgraph Storage["PostgreSQL"]
        PG[("PostgreSQL\nusers, rooms, bookings,\naddresses, room_members")]
    end

    LP --> HR
    LP --> JR
    HR --> RoomAPI
    JR --> RoomAPI
    RoomAPI --> PG
    RoomAPI --> MatchEngine
    MatchEngine --> Aggregator
    RoomAPI --> WSHub
    WSHub --> PG
    RoomAPI --> BK
    PG --> MY
```

---

## 3. Cấu trúc thư mục

### 3.1 Backend — `hub-ride-backend/`

```
hub-ride-backend/
├── pom.xml
├── src/main/java/com/hubride/
│   ├── HubRideApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java          # PermitAll (no auth in MVP)
│   │   ├── WebSocketConfig.java        # STOMP /ws
│   │   └── CorsConfig.java
│   ├── common/
│   │   ├── exception/{GlobalExceptionHandler, AppException, ErrorCode}
│   │   ├── response/ApiResponse.java
│   │   └── enums/{RoomStatus, BookingStatus}
│   └── module/
│       ├── room/
│       │   ├── controller/RoomController.java        # /api/v1/rooms
│       │   ├── controller/BookingController.java    # /api/v1/bookings
│       │   ├── service/
│       │   │   ├── RoomService.java                 # create/join/cancel
│       │   │   ├── MatchingService.java             # H3 k-ring search
│       │   │   ├── AggregatorService.java           # mock Grab/Be/Xanh SM
│       │   │   └── H3GeoService.java               # h3-java wrapper
│       │   ├── websocket/RoomWebSocketController.java
│       │   ├── repository/{RoomRepository, BookingRepository, AddressRepository}
│       │   ├── entity/{Room, RoomMember, Booking, Address}
│       │   └── dto/
│       │       ├── CreateRoomRequest.java
│       │       ├── JoinRoomRequest.java
│       │       ├── RoomDetailResponse.java
│       │       ├── DispatchResultResponse.java
│       │       └── PartnerQuote.java
│       ├── aggregator/
│       │   ├── PartnerMockClient.java                # interface
│       │   ├── impl/{GrabMockClient, BeMockClient, XanhSmMockClient}
│       │   └── PartnerRegistry.java
│       └── address/
│           ├── controller/AddressController.java     # /api/v1/addresses (search)
│           ├── service/AddressService.java
│           └── entity/Address.java
├── src/main/resources/
│   ├── application.yml
│   └── db/
│       └── init.sql                   # Schema + seed (chạy 1 lần, hoặc qua pgAdmin/psql)
└── src/test/java/com/hubride/
    ├── MatchingServiceTest.java
    └── AggregatorServiceTest.java
```

### 3.2 Frontend — `hub-ride-frontend/`

```
hub-ride-frontend/
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── src/
    ├── app/
    │   ├── layout.tsx                     # shadcn providers + global bg
    │   ├── page.tsx                       # Landing (Hero + Search)
    │   ├── rooms/
    │   │   ├── new/page.tsx               # Host Room (chọn điểm đi/đến + countdown)
    │   │   ├── [roomId]/page.tsx          # Room Detail (realtime members + countdown)
    │   │   └── browse/page.tsx            # Browse phòng đang mở (Join)
    │   ├── bookings/
    │   │   ├── [bookingId]/page.tsx       # Booking confirmation (driver info)
    │   │   └── page.tsx                   # My Bookings
    │   └── api/                           # không cần (BE tách riêng)
    ├── components/
    │   ├── ui/                            # shadcn primitives
    │   ├── layout/{Navbar, Footer}
    │   ├── room/{CountdownTimer, MemberList, PriceCompare, PartnerCard, HubBadge}
    │   ├── search/{AddressAutocomplete, HubSelector}
    │   └── shared/{UserSwitcher, WalletBadge, EmptyState}
    ├── lib/
    │   ├── api/{room.ts, booking.ts, address.ts}
    │   ├── ws/stomp-client.ts             # @stomp/stompjs wrapper
    │   ├── store/{userStore.ts, walletStore.ts}   # zustand
    │   └── utils/{format.ts, cn.ts}
    └── types/{room.ts, booking.ts, address.ts, partner.ts}
```

---

## 4. Thiết kế luồng nghiệp vụ (Core Flows)

### 4.1 Flow chính: Host → Match → Join → Dispatch → Booking

```mermaid
sequenceDiagram
    autonumber
    participant U1 as User A (Host)
    participant U2 as User B (Joiner)
    participant FE as Next.js
    participant BE as Spring Boot
    participant WS as WebSocket
    participant AGG as Aggregator
    participant PG as PostgreSQL

    U1->>FE: Vào /rooms/new, chọn điểm đi (KTX A) + điểm đến (Quận 1)
    FE->>BE: POST /api/v1/rooms {originAddrId, destAddrId, hostUserId}
    BE->>BE: h3.latLngToCell(origin, res=9) → h3Origin
    BE->>PG: INSERT rooms + room_members
    BE-->>FE: 201 {roomId, countdownSec:300}
    FE->>WS: SUBSCRIBE /topic/room/{roomId}

    par Cùng lúc U2 browse
        U2->>FE: Vào /rooms/browse
        FE->>BE: GET /api/v1/rooms?originLat=&originLng=&destLat=&destLng=
        BE->>BE: gridDisk(originH3, k=2) → 19 cells
        BE->>PG: SELECT rooms WHERE status=OPEN AND origin_h3 IN (...cells...)
        BE-->>FE: List[Room] (phòng của A)
        U2->>FE: Click "Join"
        FE->>BE: POST /api/v1/rooms/{roomId}/join {userId}
        BE->>PG: INSERT room_members
        BE->>WS: broadcast /topic/room/{roomId} {event:JOIN, members:[A,B]}
        WS-->>FE: cập nhật MemberList realtime
    end

    Note over FE: FE countdown tick (setInterval 1s, tính từ countdownSec ban đầu)

    Note over BE: Countdown FE đếm 0 → FE gọi POST /api/v1/rooms/{roomId}/dispatch
    FE->>BE: POST /api/v1/rooms/{roomId}/dispatch
    BE->>AGG: getBestQuote(originH3, destH3, memberCount=2)
    AGG->>AGG: mock Grab=85k, Be=72k, XanhSM=58k (surge=1.0)
    AGG-->>BE: bestQuote = {partner:XANH_SM, totalPrice:58000, perPerson:29000, eta:12}
    BE->>PG: UPDATE rooms SET status=DISPATCHED + INSERT bookings
    BE->>WS: broadcast /topic/room/{roomId} {event:DISPATCHED, quote}
    WS-->>FE: hiển thị PartnerCard (Xanh SM rẻ nhất)
    FE->>U1: Navigate → /bookings/{id}
    FE->>U2: Navigate → /bookings/{id}
```

### 4.2 Countdown — FE-side tick (đơn giản, không cần Redis/Scheduler)

- **Backend** chỉ lưu `countdown_remaining_sec` trong DB và trả về khi tạo phòng
- **Frontend** dùng `setInterval` 1s, decrement countdown từ giá trị ban đầu
- Khi countdown = 0, **Frontend gọi** `POST /api/v1/rooms/{roomId}/dispatch` để trigger dispatch
- **Lý do:** Không cần `@Scheduled` backend, không cần Redis — đơn giản tối đa cho MVP

```mermaid
flowchart LR
    A["FE: countdownSec = 300\nsetInterval 1s"] --> B{"countdown > 0?"}
    B -- Yes --> C["countdown--\nBroadcast to UI"]
    C --> B
    B -- No --> D["FE: POST /rooms/{id}/dispatch"]
    D --> E["BE: update status DISPATCHED\nBE: insert bookings\nBE: WS broadcast DISPATCHED"]
```

### 4.3 Matching Service — H3 k-ring

```mermaid
flowchart TB
    Start["originLat, originLng, destLat, destLng, currentUserId"] --> Geo["h3.gridDisk(originH3, k=2)\n→ 19 hex cells (bán kính ~350m)"]
    Geo --> Scan["SELECT rooms WHERE status='OPEN'\nAND origin_h3 IN (...19 cells...)"]
    Scan --> FilterH3["originH3 ∈ neighbors?"]
    FilterH3 -- No --> Skip[Skip]
    FilterH3 -- Yes --> DestMatch["destH3 match\n(h3 distance < 5 cells)"]
    DestMatch -- No --> Skip
    DestMatch -- Yes --> MinDist["tính pickup distance\n(mặt trước của host)"]
    MinDist --> Sort["Sort theo distance ASC"]
    Sort --> Top5[Trả top 10 phòng"]
```

### 4.4 Aggregator (Mocked Pricing)

```java
// AggregatorService.java — logic chọn best partner
public DispatchResult dispatch(Room room) {
    List<PartnerQuote> quotes = List.of(
        grabMock.quote(room),     // random 60-120k + surge 1.0-2.0
        beMock.quote(room),       // random 55-100k + surge 1.0-1.5
        xanhSmMock.quote(room)    // random 50-90k  + surge 1.0 (không surge)
    );
    PartnerQuote best = quotes.stream()
        .min(Comparator.comparingDouble(q -> q.totalPrice))
        .orElseThrow();
    return new DispatchResult(best, quotes, splitPrice(best.totalPrice, room.memberCount));
}
```

Mỗi mock client trả về: `{partner, totalPrice, etaMinutes, surgeMultiplier, vehicleType}`.

---

## 5. Database Design (PostgreSQL)

```mermaid
erDiagram
    users {
        uuid id PK
        varchar full_name
        varchar phone
        decimal wallet_balance "demo: ví tiền pre-pay"
        timestamp created_at
    }

    addresses {
        uuid id PK
        varchar label "KTX Khu A, Nhà VH Sinh viên..."
        text full_address
        double latitude
        double longitude
        varchar h3_index
        varchar kind "HUB | POPULAR | CUSTOM"
    }

    rooms {
        uuid id PK
        uuid host_user_id FK
        uuid origin_address_id FK
        uuid dest_address_id FK
        varchar origin_h3
        varchar dest_h3
        double origin_lat
        double origin_lng
        double dest_lat
        double dest_lng
        varchar status "OPEN | DISPATCHED | CANCELLED | EXPIRED"
        int countdown_remaining_sec
        double distance_km
        int eta_minutes
        timestamp created_at
        timestamp dispatched_at
    }

    room_members {
        uuid id PK
        uuid room_id FK
        uuid user_id FK
        varchar role "HOST | JOINER"
        decimal amount_held "tiền pre-pay khóa"
        timestamp joined_at
    }

    bookings {
        uuid id PK
        uuid room_id FK
        uuid user_id FK
        decimal price_paid
        varchar partner "GRAB | BE | XANH_SM"
        varchar vehicle_type "CAR_4 | CAR_7"
        varchar status "CONFIRMED | COMPLETED | CANCELLED"
        int eta_minutes
        timestamp created_at
    }

    users ||--o{ rooms : hosts
    users ||--o{ room_members : participates
    users ||--o{ bookings : books
    addresses ||--o{ rooms : origin_or_dest
    rooms ||--o{ room_members : contains
    rooms ||--o{ bookings : produces
```

### 5.1 Giải thích chi tiết từng bảng

#### `users` — Người dùng demo

| Cột               | Lý do                                                     |
| ------------------ | ---------------------------------------------------------- |
| `wallet_balance` | Ví tiền demo (seed: 500.000đ/user) — phục vụ pre-pay |
| `phone`          | Định danh demo (không cần password)                    |

#### `addresses` — Điểm đón/trả + Hub

| Cột                          | Lý do                                                   |
| ----------------------------- | -------------------------------------------------------- |
| `h3_index`                  | Index không gian để Matching Service tìm phòng gần |
| `kind` (HUB/POPULAR/CUSTOM) | Phân biệt hub chính thức vs địa chỉ tự do        |
| `lat/lng`                   | Lưu để tính khoảng cách Haversine khi cần         |

#### `rooms` — Phòng (gom nhóm)

| Cột                                  | Lý do                                                       |
| ------------------------------------- | ------------------------------------------------------------ |
| `origin_h3` / `dest_h3`           | Cache H3 cell để query nhanh (không phải JOIN addresses) |
| `origin_lat/lng` / `dest_lat/lng` | Tính Haversine distance, sort theo khoảng cách            |
| `countdown_remaining_sec`           | Giá trị ban đầu 300s, FE dùng để tick countdown       |
| `status` enum                       | OPEN → DISPATCHED/CANCELLED/EXPIRED                         |

#### `room_members` — Thành viên trong phòng

| Cột                   | Lý do                                                         |
| ---------------------- | -------------------------------------------------------------- |
| `role` (HOST/JOINER) | Phân biệt vai trò để UI badge + logic refund              |
| `amount_held`        | Tiền đã pre-pay — nếu hủy ngang sẽ giữ lại (bù phí) |

#### `bookings` — Đơn đặt xe sau dispatch

| Cột            | Lý do                                               |
| --------------- | ---------------------------------------------------- |
| `partner`     | Hãng được dispatch (GRAB/BE/XANH_SM)             |
| `price_paid`  | Số tiền user thực trả = totalPrice / memberCount |
| `eta_minutes` | Thời gian dự kiến xe đến                        |

### 5.2 Schema SQL — `db/init.sql`

Chạy 1 lần qua pgAdmin/psql (hoặc paste vào Neon Console).

```sql
-- ============================================================
-- Hub-Ride MVP Schema — PostgreSQL
-- Chạy qua: pgAdmin, psql, hoặc Neon Console
-- ============================================================

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------
-- USERS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name   VARCHAR(100) NOT NULL,
    phone       VARCHAR(20)  NOT NULL UNIQUE,
    wallet_balance DECIMAL(12, 2) NOT NULL DEFAULT 500000.00,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- ADDRESSES
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS addresses (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label       VARCHAR(200) NOT NULL,
    full_address TEXT       NOT NULL,
    latitude    DOUBLE PRECISION NOT NULL,
    longitude   DOUBLE PRECISION NOT NULL,
    h3_index    VARCHAR(20)  NOT NULL,
    kind        VARCHAR(20)  NOT NULL DEFAULT 'POPULAR'  -- HUB | POPULAR | CUSTOM
);

-- -------------------------------------------------------
-- ROOMS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS rooms (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_user_id            UUID NOT NULL REFERENCES users(id),
    origin_address_id       UUID REFERENCES addresses(id),
    dest_address_id         UUID REFERENCES addresses(id),
    origin_h3               VARCHAR(20)  NOT NULL,
    dest_h3                 VARCHAR(20)  NOT NULL,
    origin_lat              DOUBLE PRECISION NOT NULL,
    origin_lng              DOUBLE PRECISION NOT NULL,
    dest_lat                DOUBLE PRECISION NOT NULL,
    dest_lng                DOUBLE PRECISION NOT NULL,
    status                  VARCHAR(20)  NOT NULL DEFAULT 'OPEN',  -- OPEN | DISPATCHED | CANCELLED | EXPIRED
    countdown_remaining_sec INT         NOT NULL DEFAULT 300,
    distance_km             DOUBLE PRECISION,
    eta_minutes             INT,
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    dispatched_at           TIMESTAMPTZ
);

-- -------------------------------------------------------
-- ROOM MEMBERS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS room_members (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id      UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES users(id),
    role         VARCHAR(10)  NOT NULL DEFAULT 'JOINER',  -- HOST | JOINER
    amount_held  DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    joined_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- -------------------------------------------------------
-- BOOKINGS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id      UUID NOT NULL REFERENCES rooms(id),
    user_id      UUID NOT NULL REFERENCES users(id),
    partner      VARCHAR(20)  NOT NULL,   -- GRAB | BE | XANH_SM
    price_paid   DECIMAL(12, 2) NOT NULL,
    vehicle_type VARCHAR(10)  NOT NULL,  -- CAR_4 | CAR_7
    eta_minutes  INT,
    status       VARCHAR(20)  NOT NULL DEFAULT 'CONFIRMED',  -- CONFIRMED | COMPLETED | CANCELLED
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- INDEXES (basic, không cần tinh chỉnh cho MVP)
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_rooms_status_origin_h3
    ON rooms(origin_h3) WHERE status = 'OPEN';

CREATE INDEX IF NOT EXISTS idx_room_members_user
    ON room_members(user_id);

CREATE INDEX IF NOT EXISTS idx_bookings_user
    ON bookings(user_id, created_at DESC);

-- -------------------------------------------------------
-- SEED DATA
-- -------------------------------------------------------

-- 5 demo users
INSERT INTO users (id, full_name, phone, wallet_balance) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Lan',   '0900000001', 500000.00),
    ('00000000-0000-0000-0000-000000000002', 'Mai',   '0900000002', 500000.00),
    ('00000000-0000-0000-0000-000000000003', 'Khoa',  '0900000003', 500000.00),
    ('00000000-0000-0000-0000-000000000004', 'Hưng',  '0900000004', 500000.00),
    ('00000000-0000-0000-0000-000000000005', 'Linh',  '0900000005', 500000.00)
ON CONFLICT DO NOTHING;

-- 20 demo addresses (lat/lng xung quanh TP.HCM + H3 index mẫu)
INSERT INTO addresses (id, label, full_address, latitude, longitude, h3_index, kind) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'KTX Khu A',          'Khu A, Đại học Quốc gia TP.HCM, Đông Hòa, Dĩ An, Bình Dương',         10.8701, 106.8008, '89459aaa1a3ffff', 'HUB'),
    ('a0000000-0000-0000-0000-000000000002', 'KTX Khu B',          'Khu B, Đại học Quốc gia TP.HCM, Đông Hòa, Dĩ An, Bình Dương',         10.8750, 106.8050, '89459aac27ffff', 'HUB'),
    ('a0000000-0000-0000-0000-000000000003', 'Nhà Văn hóa SV',     'Nhà Văn hóa Sinh viên, ĐHQG TP.HCM, Đông Hòa, Dĩ An, Bình Dương',       10.8680, 106.7980, '89459aaa8affff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000004', 'Cổng chính ĐHQG',    'Cổng chính ĐHQG TP.HCM, Linh Trung, Thủ Đức, TP.HCM',                  10.8710, 106.7930, '89459aaac7ffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000005', 'ĐH Bách Khoa',        'Đại học Bách Khoa TP.HCM, Lý Thường Kiệt, Q.10, TP.HCM',               10.7726, 106.6650, '89459a4645ffff', 'HUB'),
    ('a0000000-0000-0000-0000-000000000006', 'ĐH Sư Phạm Kỹ Thuật','Đại học Sư Phạm Kỹ Thuật TP.HCM, Võ Văn Tần, Q.3, TP.HCM',              10.7875, 106.6930, '89459a2e2bffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000007', 'Quận 1',              'Quận 1, TP.HCM',                                                         10.7756, 106.6980, '89459a26a7ffff', 'HUB'),
    ('a0000000-0000-0000-0000-000000000008', 'Bến Thành',           'Chợ Bến Thành, Đường Lê Lợi, Quận 1, TP.HCM',                            10.7720, 106.6980, '89459a26a7ffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000009', 'Phố đi bộ Nguyễn Huệ','Phố đi bộ Nguyễn Huệ, Quận 1, TP.HCM',                                    10.7740, 106.7040, '89459a26c3ffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000010', 'Ga Sài Gòn',          'Ga Sài Gòn, Nguyễn Thông, Quận 3, TP.HCM',                                10.7875, 106.6805, '89459a2c1bffff', 'HUB'),
    ('a0000000-0000-0000-0000-000000000011', 'Sân bay Tân Sơn Nhất','Sân bay Tân Sơn Nhất, Tân Bình, TP.HCM',                                  10.8188, 106.6519, '89459a1a5bffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000012', 'Lotte Mart Q7',       'Lotte Mart, Đường Nguyễn Lương Bằng, Quận 7, TP.HCM',                    10.7280, 106.7210, '89459a2a1ffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000013', 'ĐH Kinh tế',          'Đại học Kinh tế TP.HCM, Nguyễn Văn Linh, Q.7, TP.HCM',                  10.7310, 106.7080, '89459a29d7ffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000014', 'ĐH Nông Lâm',        'Đại học Nông Lâm TP.HCM, Tam Bình, Thủ Đức, TP.HCM',                     10.8688, 106.7750, '89459aa9d7ffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000015', 'Coopmart',            'Coopmart, Điện Biên Phủ, Q.Bình Thạnh, TP.HCM',                          10.8030, 106.7180, '89459a24dfffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000016', 'BigC',                'BigC, Xô Viết Nghệ Tĩnh, Q.Bình Thạnh, TP.HCM',                         10.8010, 106.7080, '89459a24cfffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000017', 'Crescent Mall',       'Crescent Mall, Đại lộ Nguyễn Văn Linh, Q.7, TP.HCM',                    10.7285, 106.7270, '89459a29effff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000018', 'Phú Mỹ Hưng',        'Khu đô thị Phú Mỹ Hưng, Quận 7, TP.HCM',                                10.7300, 106.7370, '89459a2a37ffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000019', 'Quận 3',              'Quận 3, TP.HCM',                                                          10.7848, 106.6890, '89459a2cafffff', 'HUB'),
    ('a0000000-0000-0000-0000-000000000020', 'Quận Bình Thạnh',     'Quận Bình Thạnh, TP.HCM',                                                  10.8038, 106.7130, '89459a24efffff', 'HUB')
ON CONFLICT DO NOTHING;
```

> **Ghi chú:** Cột `h3_index` trong addresses dùng resolution=9 (hex ~174m). Nếu muốn chính xác hơn, tính lại bằng `h3.latLngToCell(lat, lng, 9)` từ `com.uber:h3`. Các giá trị trên là estimates cho demo.

### 5.3 Seed Data

- **5 users demo:** Lan (Host), Mai (Joiner), Khoa (Joiner), Hưng, Linh — mỗi user ví 500.000đ
- **20 addresses:** KTX Khu A, KTX Khu B, Nhà VH Sinh viên, Cổng chính ĐHQG, ĐH Bách Khoa, ĐH Sư Phạm Kỹ Thuật, Quận 1, Bến Thành, Phố đi bộ Nguyễn Huệ, Ga Sài Gòn, Sân bay Tân Sơn Nhất, Lotte Mart Q7, ĐH Kinh tế, ĐH Nông Lâm, Coopmart, BigC, Crescent Mall, Phú Mỹ Hưng, Quận 3, Quận Bình Thạnh

---

## 6. API Contract (Backend ↔ Frontend)

```
Base: http://localhost:8080/api/v1
WS:   ws://localhost:8080/ws

# Address (search chọn điểm đón/trả — autocomplete)
GET  /addresses?q=ktx&limit=10
     → [{id, label, fullAddress, lat, lng, h3, kind}]

# Room
POST /rooms                          # Host tạo phòng
     body: {hostUserId, originAddrId, destAddrId}
     → {roomId, countdownSec:300, origin, dest, distanceKm}

GET  /rooms?originLat=&originLng=&destLat=&destLng=&excludeUserId=
     → List<RoomListItem> {roomId, hostName, originLabel, destLabel,
                            distanceKm, memberCount, countdownSec}

GET  /rooms/{roomId}                 # Room detail
     → {roomId, status, host, members[], origin, dest,
        countdownSec, bestQuote?, allQuotes?}

POST /rooms/{roomId}/join            # User join
     body: {userId}
     → {memberCount, totalHeld}

POST /rooms/{roomId}/dispatch        # Trigger dispatch (FE gọi khi countdown=0)
     → {bestQuote, allQuotes, bookings[]}

POST /rooms/{roomId}/cancel          # Host cancel
     → {refundedAmount}

DELETE /rooms/{roomId}/members/{userId}  # Joiner leave

# Booking
GET  /bookings?userId=
     → List<Booking> {bookingId, partner, pricePaid, eta, status, roomId}

GET  /bookings/{bookingId}
     → Booking detail

# Users (no auth — cho dropdown)
GET  /users                          → List<{id, fullName, walletBalance}>

# WebSocket STOMP
SUBSCRIBE /topic/room/{roomId}
     → events: JOIN {members}, LEAVE {members},
              DISPATCHED {bestQuote, allQuotes}, CANCELLED
```

---

## 7. Frontend Pages — UX Flow (Agoda/Traveloka Style)

| Page                      | Route                     | Chức năng                                                           | UI điểm nhấn                                                                  |
| ------------------------- | ------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Landing**         | `/`                     | Hero lớn + Search box (Origin/Dest) + CTA "Tạo phòng"              | Card glassmorphism, gradient teal→navy, trust badges                            |
| **Browse Rooms**    | `/rooms/browse`         | List phòng đang mở gần điểm đón user chọn, filter theo route | Grid card, badge countdown màu cam, price tag                                   |
| **Create Room**     | `/rooms/new`            | Form origin/dest + Date/time + countdown mặc định 5p               | Stepper 2 bước, tóm tắt hub, preview countdown                               |
| **Room Detail**     | `/rooms/[roomId]`       | MemberList realtime + Countdown lớn + giá aggregator                | Countdown tròn (circular progress), MemberList avatar, Partner comparison table |
| **Booking Confirm** | `/bookings/[bookingId]` | Success + driver/vehicle info + ETA                                   | Confetti animation, card gradient xanh, nút "Về trang chủ"                    |
| **My Bookings**     | `/bookings`             | Lịch sử + trạng thái                                              | Timeline UI, status pill                                                         |

**Component quan trọng:**

- `CountdownTimer`: circular progress (5:00 → 0:00), đổi màu khi < 60s
- `PartnerCard`: card so sánh 3 hãng (Grab/Be/Xanh SM), highlight hãng rẻ nhất
- `MemberList`: avatar + tên + role badge (Host), realtime update qua WS
- `HubBadge`: icon vị trí + label Hub/Điểm đón, distance từ user
- `WalletBadge`: hiển thị số dư ví (top-right), animation khi trừ tiền pre-pay
- `UserSwitcher`: dropdown đổi user demo (vì không có auth)

---

## 8. Timeline 10 tiếng (chi tiết theo giờ)

> **Team 2 người:** Dev A (Backend) + Dev B (Frontend). Mỗi mốc dưới đây track theo giờ từ T+0.

### Phase 1 — Foundation (T+0 → T+2h)

| Giờ       | Dev A — Backend                                                                                            | Dev B — Frontend                                     |
| ---------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 0:00–0:30 | Init Spring Boot project + pom.xml + application.yml + Postgres docker-compose                              | Init Next.js 14 + Tailwind + shadcn setup             |
| 0:30–1:00 | Init Spring Boot +`db/init.sql` schema (users, addresses, rooms, room_members, bookings) qua pgAdmin/psql | Setup layout + Navbar + Footer + Landing Hero         |
| 1:00–1:30 | `AddressController` + `UserController` + repository + service                                           | Landing SearchBox (origin/dest autocomplete API call) |
| 1:30–2:00 | `RoomController.create()` + `RoomService.create()` + H3 index tính                                     | Browse page UI (mock data, chờ API)                  |

**Milestone 1 (T+2h):** Có thể tạo room qua Postman, FE browse hiển thị phòng.

---

### Phase 2 — Core Mechanics (T+2h → T+5h)

| Giờ       | Dev A — Backend                                                               | Dev B — Frontend                                        |
| ---------- | ------------------------------------------------------------------------------ | -------------------------------------------------------- |
| 2:00–2:45 | `MatchingService` (H3 gridDisk + filter) + `GET /rooms?nearLat=...`        | Browse page wire API thật, render card thật            |
| 2:45–3:30 | `POST /rooms/{id}/join` + `RoomService.join()`                             | Create Room form hoàn chỉnh + Stepper                  |
| 3:30–4:15 | `WebSocketConfig` (STOMP) + `RoomWebSocketController` broadcast JOIN/LEAVE | WS client (`@stomp/stompjs`) + Room Detail subscribe   |
| 4:15–5:00 | `RoomWebSocketController` DISPATCH event handler                             | CountdownTimer component (FE tick) + MemberList realtime |

**Milestone 2 (T+5h):** Host tạo phòng → Joiner browse → join → cả 2 thấy countdown realtime.

---

### Phase 3 — Aggregator + Booking (T+5h → T+7h)

| Giờ       | Dev A — Backend                                                        | Dev B — Frontend                                               |
| ---------- | ----------------------------------------------------------------------- | --------------------------------------------------------------- |
| 5:00–5:45 | `AggregatorService` + 3 mock clients (Grab/Be/Xanh SM) + random surge | PartnerCard component (so sánh 3 hãng)                        |
| 5:45–6:30 | `POST /rooms/{id}/dispatch` + persist `bookings`                    | FE trigger dispatch khi countdown=0 → redirect booking confirm |
| 6:30–7:00 | `GET /bookings` + `GET /bookings/{id}` + cancel/refund logic        | Booking Confirm page + My Bookings list                         |

**Milestone 3 (T+7h):** Flow end-to-end: Host → Join → Countdown → Dispatch → Booking confirm.

---

### Phase 4 — Polish + Edge Cases (T+7h → T+9h)

| Giờ       | Dev A — Backend                                                                     | Dev B — Frontend                                               |
| ---------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| 7:00–7:30 | Min distance validation (2km), cancel-host logic, refund khi host hủy, joiner leave | Empty states, loading skeletons, error toasts                   |
| 7:30–8:00 | Pre-pay wallet hold/release, edge case: phòng hết hạn không đủ người         | WalletBadge animation, UserSwitcher dropdown                    |
| 8:00–8:30 | Unit tests (MatchingService, AggregatorService) + Swagger UI                         | UI polish: gradient, spacing, hover effects, Agoda-style badges |
| 8:30–9:00 | Seed realistic data + Demo script + README                                           | Responsive (mobile), accessibility check                        |

**Milestone 4 (T+9h):** Mọi edge case handled, UI mượt mà.

---

### Phase 5 — Demo Prep & Buffer (T+9h → T+10h)

| Giờ        | Cả team                                                       |
| ----------- | -------------------------------------------------------------- |
| 9:00–9:30  | Integration test full flow (1 host + 2 joiner trên 3 browser) |
| 9:30–9:45  | Fix bug phát sinh                                             |
| 9:45–10:00 | Slide/Pitch outline + screen recording backup                  |

**Milestone 5 (T+10h):** Demo-ready MVP.

---

## 9. Rủi ro & Mitigation

| Rủi ro                                           | Xác suất  | Mitigation                                                                        |
| ------------------------------------------------- | ----------- | --------------------------------------------------------------------------------- |
| H3 setup phức tạp, thiếu thư viện            | Thấp       | Dùng`com.uber:h3:4.1.1` (Maven Central, stable)                                |
| WebSocket không realtime trên Next.js dev       | Trung bình | Cấu hình`next.config.js` proxy `/ws` → BE; test sớm từ Phase 2           |
| 10 tiếng không đủ cho auth + payment          | Cao         | Đã loại bỏ auth; ví demo lưu DB user                                        |
| Seed data thiếu → demo không có gì để show | Trung bình | Phase 1 seed 5 users + 20 addresses; tạo sẵn 1-2 phòng mẫu                    |
| Partner mock giống nhau → demo nhàm            | Thấp       | Mỗi partner có surge multiplier riêng (Xanh SM = 1.0 cố định, Grab 1.0-2.5) |
| Phòng chỉ có 1 người khi countdown hết      | Trung bình | Cho phép dispatch với 1 người (vẫn dispatch, giá không chia)               |

---

## 10. Deliverables cuối (Demo-ready)

- [ ] Backend chạy `localhost:8080` (Swagger UI tại `/swagger-ui.html`)
- [ ] Frontend chạy `localhost:3000`
- [ ] Neon PostgreSQL connection (chạy `db/init.sql` 1 lần)
- [ ] README hướng dẫn chạy nhanh + demo script
- [ ] 5 users demo (Lan/Mai/Khoa/Hưng/Linh) với ví tiền 500k
- [ ] 20 địa chỉ seed (KTX Khu A/B, hub phổ biến)
- [ ] Full flow demo: Host tạo → Mai join → countdown 5p → dispatch Xanh SM → booking confirm
- [ ] 3 mock partner với surge pricing khác nhau (Grab/Be/Xanh SM)
- [ ] H3 geospatial matching hoạt động (gridDisk + k-ring)
- [ ] WebSocket realtime (member join, dispatch broadcast)
- [ ] UI/UX Agoda-style (gradient, glassmorphism, smooth animations)

---

## 11. Tech Stack Tổng hợp

### Backend

| Layer      | Công nghệ                                                                |
| ---------- | -------------------------------------------------------------------------- |
| Framework  | Spring Boot 3.x (Java 17+)                                                 |
| Build      | Maven                                                                      |
| DB         | PostgreSQL 15+ (Neon — cloud, serverless)                                 |
| Migration  | KHÔNG (schema + seed trong 1 file`db/init.sql`, chạy qua pgAdmin/psql) |
| WebSocket  | STOMP (Spring Messaging)                                                   |
| Geospatial | `com.uber:h3:4.1.1`                                                      |
| Auth       | KHÔNG (PermitAll MVP)                                                     |
| API Docs   | springdoc-openapi-starter-webmvc-ui 2.x                                    |
| Testing    | JUnit 5 + Mockito                                                          |

### Frontend

| Layer      | Công nghệ                          |
| ---------- | ------------------------------------ |
| Framework  | Next.js 14 (App Router) + TypeScript |
| Styling    | Tailwind CSS + shadcn/ui             |
| State      | Zustand                              |
| HTTP       | TanStack Query (React Query)         |
| WebSocket  | @stomp/stompjs                       |
| Forms      | react-hook-form + zod                |
| Icons      | lucide-react                         |
| Animations | framer-motion                        |

### DevOps

| Layer              | Công nghệ                                                            |
| ------------------ | ---------------------------------------------------------------------- |
| DB                 | Neon PostgreSQL (cloud, serverless — connection string trong`.env`) |
| Package Manager BE | Maven                                                                  |
| Package Manager FE | pnpm                                                                   |

---

## 12. Bất cập & Giải pháp (đã giải quyết trong thiết kế)

| Bất cập                                                            | Giải pháp trong hệ thống                                                                                                                       |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Phòng chỉ có 2-3 người, ai chịu phí còn trống?** | Hub-Ride chọn cuốc xe rẻ nhất (Xanh SM không surge). Chia đôi cho 2 người vẫn rẻ hơn 2 GrabBike. Không ép đủ 4 người mới chạy. |
| **2. Chênh lệch thời gian chờ**                            | Time-boxed 5 phút. Hết 5p → chốt danh sách + dispatch. Ai chưa sẵn sàng → tự tạo phòng khác.                                          |
| **3. Rủi ro "Bùng" (hủy ngang)**                            | Pre-pay: bấm Join/Host → tiền bị khóa ngay. Hủy sau khi phòng chốt → tiền giữ lại làm quỹ dự phòng.                                |
| **4. Quãng đường quá ngắn không lãi**                  | Minimum 2km validation. Dưới 2km → từ chối tạo phòng, hướng đến đi bộ/xe đạp.                                                       |

---

## 13. Lợi thế cạnh tranh (vs GrabShare / Xe Bus)

| Tiêu chí          | GrabShare / UberPool              | Xe Bus công cộng  | **Hub-Ride**                          |
| ------------------- | --------------------------------- | ------------------- | ------------------------------------------- |
| Cách đón         | Đi vòng qua hẻm (Door-to-door) | Trạm cố định    | **Hub linh hoạt, xe chạy thẳng**   |
| Tối ưu vận hành | Thấp (deadhead lớn)             | Không áp dụng    | **Rất cao (không vào hẻm kẹt)**  |
| Tính linh hoạt    | Trễ giờ vì đón nhiều        | Chậm, tuyến cứng | **On-demand, di chuyển nhanh**       |
| Trải nghiệm       | Ức chế xe đi lòng vòng       | Đông đúc        | **Chủ động thời gian, flat-rate** |

---

## 14. Kết luận

> **Hub-Ride không lãng phí tài nguyên hạ tầng để chiều chuộng sự tiện lợi "lười biếng" (đón tận cửa). Hub-Ride giáo dục người dùng "Đánh đổi vài bước chân để lấy chi phí rẻ và cứu lấy giao thông đô thị".**

**Value Propositions:**

- **For Customers:** Ô tô an toàn, thoải mái, giá tiệm cận xe máy. Không surge pricing khi mưa bão.
- **For Drivers:** Tối đa thu nhập/km. Thoát cảnh kẹt xe trong hẻm sâu, lướt đường lớn Hub → Hub.
- **For Partners:** Giải quyết nghẽn giờ cao điểm. 1 xe giải tỏa 4 khách thay vì 1, tăng hoa hồng tổng.
- **For The City:** Real-world data chứng minh giảm mật độ xe 4 chỗ, cắt giảm CO2, đóng góp Net-Zero.

---

## 15. Geocoding + H3 Spatial Index — Luồng chi tiết

> **Mục tiêu MVP:** User gõ địa điểm → gợi ý realtime (Goong Autocomplete) → chọn → lưu lat/lng vào DB → backend tìm phòng gần bằng H3. Không dùng map, không có RTT trỏ chuột phức tạp.

### 15.1 Tổng quan luồng

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Next.js (FE)
    participant Goong as Goong API<br/>(External)
    participant BE as Spring Boot (BE)
    participant H3 as H3 Java Lib
    participant PG as PostgreSQL

    User->>FE: Gõ "KTX Khu A" vào ô Origin
    FE->>Goong: GET /Place/AutoComplete?input=ktx%20khu%20a&api_key=XXX
    Goong-->>FE: [{name, place_id, formatted_address, lat, lng}, ...] (top 5)
    FE->>User: Hiển thị dropdown gợi ý
    User->>FE: Chọn "KTX Khu A - Làng ĐH QG"
    FE->>BE: POST /api/v1/rooms {originLabel, originLat, originLng, destLabel, destLat, destLng}
    BE->>H3: h3.latLngToCell(lat, lng, res=9)
    H3-->>BE: h3Index = "89459aaa1a3ffff"
    BE->>PG: INSERT INTO addresses (label, lat, lng, h3_index) ON CONFLICT DO NOTHING
    BE->>PG: INSERT INTO rooms (..., origin_h3, dest_h3, status='OPEN', countdown_remaining_sec=300)
    BE-->>FE: 201 {roomId, origin, dest, countdownSec:300}

    Note over User,BE: Sau đó User khác muốn tìm phòng gần

    User->>FE: Gõ "KTX Khu B" vào ô Origin (Browse page)
    FE->>BE: GET /api/v1/rooms?originLat=10.87&originLng=106.80&destLat=10.77&destLng=106.70
    BE->>H3: gridDisk(originH3, k=2) → 19 hex cells
    BE->>PG: SELECT * FROM rooms WHERE status='OPEN' AND origin_h3 IN (...19 cells...)
    PG-->>BE: Top 5 phòng (sorted by Haversine distance)
    BE-->>FE: List[RoomListItem]
```

### 15.2 Vì sao chọn Goong

| Tiêu chí              | Goong                      | Mapbox | Google Places | Nominatim               |
| ----------------------- | -------------------------- | ------ | ------------- | ----------------------- |
| Vietnam coverage        | Rất tốt (chuyên ĐN Á) | Tốt   | Tốt          | Kém                    |
| Free tier               | 100k req/tháng            | 100k   | $200 credit   | Free không giới hạn  |
| Autocomplete API        | Có                        | Có    | Có           | Không                  |
| Latency VN              | <100ms                     | ~200ms | ~250ms        | ~500ms+ (châu Âu)     |
| Docs tiếng Anh/VN      | Có                        | Có    | Có           | Cộng đồng            |
| **Chọn cho MVP** | **YES**              | Backup | Quá đắt    | Không có autocomplete |

**Kết luận:** Goong là lựa chọn tốt nhất cho MVP Việt Nam — rẻ, nhanh, coverage tốt, có sẵn Autocomplete + Detail (lấy lat/lng từ `place_id`).

### 15.3 Goong APIs sử dụng

| API                          | Endpoint                                      | Mục đích                                                      | Khi nào gọi                       |
| ---------------------------- | --------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------- |
| **Place Autocomplete** | `https://rsapi.goong.io/Place/AutoComplete` | Gợi ý địa chỉ khi user gõ                                  | Mỗi lần user gõ (debounce 300ms) |
| **Place Detail**       | `https://rsapi.goong.io/Place/Detail`       | Lấy`geometry.location` (lat/lng) chính xác từ `place_id` | Khi user chọn 1 gợi ý            |

> **Lưu ý MVP:** Gọi trực tiếp từ Frontend (không qua Backend) để giảm latency + không tốn request vào BE. BE chỉ nhận `lat/lng` đã verify.

### 15.4 Frontend Implementation — `AddressAutocomplete.tsx`

**Component nằm ở:** `src/components/search/AddressAutocomplete.tsx`

```typescript
// src/components/search/AddressAutocomplete.tsx — SHADCN + GOONG
'use client';
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandItem, CommandList } from '@/components/ui/command';
import { MapPin, Loader2 } from 'lucide-react';

type GoongSuggestion = {
  place_id: string;
  description: string;
  structured_formatting: { main_text: string; secondary_text: string };
};

type PlaceDetail = {
  place_id: string;
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  name: string;
};

type Props = {
  value?: PlaceDetail | null;
  onChange: (place: PlaceDetail | null) => void;
  placeholder: string;
};

const GOONG_API_KEY = process.env.NEXT_PUBLIC_GOONG_API_KEY!;

export function AddressAutocomplete({ value, onChange, placeholder }: Props) {
  const [query, setQuery] = useState(value?.formatted_address ?? '');
  const [suggestions, setSuggestions] = useState<GoongSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced autocomplete call (300ms)
  useEffect(() => {
    if (!query || query.length < 2 || query === value?.formatted_address) {
      setSuggestions([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}` +
          `&input=${encodeURIComponent(query)}&limit=5`
        );
        const data = await res.json();
        setSuggestions(data.predictions ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, value?.formatted_address]);

  // Khi user chọn 1 suggestion → gọi Place Detail để lấy lat/lng chính xác
  const handleSelect = async (suggestion: GoongSuggestion) => {
    setQuery(suggestion.description);
    setOpen(false);
    const res = await fetch(
      `https://rsapi.goong.io/Place/Detail?api_key=${GOONG_API_KEY}&place_id=${suggestion.place_id}`
    );
    const detail: PlaceDetail = (await res.json()).result;
    onChange(detail);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
      </div>
      {open && suggestions.length > 0 && (
        <Command className="absolute z-50 mt-1 w-full border rounded-md shadow-lg bg-popover">
          <CommandList>
            {suggestions.map((s) => (
              <CommandItem key={s.place_id} onSelect={() => handleSelect(s)} className="cursor-pointer">
                <MapPin className="mr-2 h-4 w-4" />
                <div>
                  <div className="font-medium">{s.structured_formatting.main_text}</div>
                  <div className="text-xs text-muted-foreground">{s.structured_formatting.secondary_text}</div>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      )}
    </div>
  );
}
```

### 15.5 Frontend Usage — Trang Create Room

```typescript
// src/app/rooms/new/page.tsx — dùng AddressAutocomplete
'use client';
import { useState } from 'react';
import { AddressAutocomplete } from '@/components/search/AddressAutocomplete';
import { Button } from '@/components/ui/button';
import { createRoom } from '@/lib/api/room';

type Place = { place_id: string; formatted_address: string;
               geometry: { location: { lat: number; lng: number } }; name: string };

export default function NewRoomPage() {
  const [origin, setOrigin] = useState<Place | null>(null);
  const [dest, setDest] = useState<Place | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!origin || !dest) return;
    setSubmitting(true);
    try {
      const room = await createRoom({
        hostUserId: 'demo-user-lan',
        origin: { label: origin.name, lat: origin.geometry.location.lat,
                  lng: origin.geometry.location.lng },
        dest:   { label: dest.name,   lat: dest.geometry.location.lat,
                  lng: dest.geometry.location.lng },
      });
      window.location.href = `/rooms/${room.roomId}`;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Tạo phòng mới</h1>
      <AddressAutocomplete value={origin} onChange={setOrigin} placeholder="Điểm đón (Origin)" />
      <AddressAutocomplete value={dest}   onChange={setDest}   placeholder="Điểm đến (Destination)" />
      <Button onClick={handleCreate} disabled={!origin || !dest || submitting} size="lg" className="w-full">
        {submitting ? 'Đang tạo...' : 'Tạo phòng (5 phút countdown)'}
      </Button>
    </div>
  );
}
```

### 15.6 Frontend Usage — Trang Browse Room (tìm phòng gần)

```typescript
// src/app/rooms/browse/page.tsx — truyền origin lat/lng hiện tại của user
'use client';
import { useEffect, useState } from 'react';
import { AddressAutocomplete } from '@/components/search/AddressAutocomplete';
import { searchNearbyRooms } from '@/lib/api/room';
import { RoomCard } from '@/components/room/RoomCard';

type Place = { formatted_address: string; geometry: { location: { lat: number; lng: number } } };

export default function BrowsePage() {
  const [origin, setOrigin] = useState<Place | null>(null);
  const [dest, setDest] = useState<Place | null>(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!origin || !dest) return;
    setLoading(true);
    searchNearbyRooms({
      originLat: origin.geometry.location.lat,
      originLng: origin.geometry.location.lng,
      destLat: dest.geometry.location.lat,
      destLng: dest.geometry.location.lng,
    })
      .then(setRooms)
      .finally(() => setLoading(false));
  }, [origin, dest]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Tìm phòng gần bạn</h1>
      <div className="grid grid-cols-2 gap-4">
        <AddressAutocomplete value={origin} onChange={setOrigin} placeholder="Bạn đang ở đâu?" />
        <AddressAutocomplete value={dest}   onChange={setDest}   placeholder="Muốn đi đâu?" />
      </div>
      {loading ? <Skeleton /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map(r => <RoomCard key={r.roomId} room={r} />)}
        </div>
      )}
    </div>
  );
}
```

### 15.7 Backend — Geocoding Service (chỉ dùng để verify & reverse)

> **MVP đơn giản:** FE gọi Goong trực tiếp, BE **chỉ validate** lat/lng hợp lệ + tính H3 index.

```java
// module/address/service/GeoService.java
@Service
@RequiredArgsConstructor
public class GeoService {
    private final RestTemplate restTemplate;
    @Value("${goong.api-key:}") private String goongKey;

    public record LatLng(double lat, double lng) {}
    public record GeocodeResult(String formattedAddress, LatLng location) {}

    /**
     * Optional: Reverse geocode lat/lng → address (khi user share location)
     * MVP: không cần, dùng luôn lat/lng từ FE
     */
    public Optional<GeocodeResult> reverse(double lat, double lng) {
        if (goongKey == null || goongKey.isBlank()) return Optional.empty();
        String url = String.format(
            "https://rsapi.goong.io/Geocode?latlng=%f,%f&api_key=%s",
            lat, lng, goongKey
        );
        try {
            JsonNode root = restTemplate.getForObject(url, JsonNode.class);
            JsonNode first = root.path("results").path(0);
            if (first.isMissingNode()) return Optional.empty();
            return Optional.of(new GeocodeResult(
                first.path("formatted_address").asText(),
                new LatLng(
                    first.path("geometry").path("location").path("lat").asDouble(),
                    first.path("geometry").path("location").path("lng").asDouble())
            ));
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
```

### 15.8 Backend — H3 Geo Service

```java
// module/room/service/H3GeoService.java
@Service
@RequiredArgsConstructor
public class H3GeoService {
    private static final int H3_RESOLUTION = 9;
    private static final int K_RING = 2;

    public String latLngToCell(double lat, double lng) {
        return H3Core.newInstance().latLngToCellAddress(lat, lng, H3_RESOLUTION);
    }

    public List<String> gridDisk(String h3Index) {
        return H3Core.newInstance().gridDisk(h3Index, K_RING);
    }

    public double haversineKm(double lat1, double lng1, double lat2, double lng2) {
        double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    public double straightLineKm(double lat1, double lng1, double lat2, double lng2) {
        return haversineKm(lat1, lng1, lat2, lng2);
    }
}
```

### 15.9 Backend — Matching Service (H3 k-ring + SQL filter)

```java
// module/room/service/MatchingService.java
@Service
@RequiredArgsConstructor
public class MatchingService {
    private final RoomRepository roomRepository;
    private final H3GeoService h3;

    public List<RoomListItem> findNearbyRooms(double originLat, double originLng,
                                              double destLat, double destLng,
                                              UUID excludeUserId) {
        // 1. Tính H3 cells trong bán kính 350m
        String originH3 = h3.latLngToCell(originLat, originLng);
        List<String> searchArea = h3.gridDisk(originH3);   // 19 cells

        // 2. Query DB lọc theo H3 cell + status OPEN + không phải phòng của mình
        List<Room> candidates = roomRepository.findOpenRoomsInCells(searchArea, excludeUserId);

        // 3. Filter thêm: điểm đến phải gần (cùng dest H3 cell hoặc lân cận)
        String destH3 = h3.latLngToCell(destLat, destLng);
        List<String> destArea = h3.gridDisk(destH3);

        return candidates.stream()
            .filter(r -> destArea.contains(r.getDestH3()))
            .map(r -> {
                double distance = h3.straightLineKm(
                    r.getOriginLat(), r.getOriginLng(),
                    originLat, originLng);
                return RoomListItem.from(r, distance);
            })
            .sorted(Comparator.comparingDouble(RoomListItem::getDistanceKm))
            .limit(10)
            .toList();
    }
}
```

### 15.10 SQL Query chính (PostgreSQL)

```sql
-- Query tìm phòng đang mở trong 19 hex cells quanh origin
SELECT *
FROM rooms
WHERE status = 'OPEN'
  AND origin_h3 = ANY(@searchArea::varchar[])  -- 19 H3 cells
  AND host_user_id != @excludeUserId
  AND created_at > NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC
LIMIT 50;
```

### 15.11 Error Handling — Edge Cases MVP

| Edge case                                   | Cách xử lý                                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| User gõ nhưng Goong không trả kết quả | Hiển thị "Không tìm thấy. Thử lại với từ khóa khác."                               |
| Goong API down / timeout                    | Fallback: cho phép nhập tay + lấy lat/lng mặc định (VD: trung tâm TP.HCM) + cảnh báo |
| User chọn suggestion rồi sửa lại        | Re-call Autocomplete + Place Detail khi chọn suggestion mới                                 |
| Lat/lng = 0,0 (chưa verify)                | BE reject`POST /rooms` với 400                                                             |
| 2 user cùng tạo phòng giống nhau        | OK — match engine vẫn tìm thấy nhau (cùng H3 cell)                                       |

### 15.12 Config — Environment Variables

```bash
# backend/.env
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/hubride?sslmode=require
DATABASE_USER=your_neon_user
DATABASE_PASSWORD=your_neon_password
GOONG_API_KEY=your_goong_api_key_here

# frontend/.env.local
NEXT_PUBLIC_GOONG_API_KEY=your_goong_api_key_here
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

```yaml
# backend/src/main/resources/application.yml
spring:
  datasource:
    url: ${DATABASE_URL}        # e.g. postgresql://user:pass@ep-xxx.neon.tech/hubride?sslmode=require
    username: ${DATABASE_USER}
    password: ${DATABASE_PASSWORD}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate        # chỉ validate, không auto-schema (schema do init.sql tạo)
    show-sql: false
goong:
  api-key: ${GOONG_API_KEY:}
```

### 15.13 Tóm tắt End-to-End

```
[Bước 1] User gõ "KTX Khu A" vào ô Origin
   ↓
[Bước 2] FE gọi Goong Autocomplete (debounce 300ms) → nhận 5 gợi ý
   ↓
[Bước 3] User chọn 1 gợi ý
   ↓
[Bước 4] FE gọi Goong Place Detail → lấy lat/lng chính xác
   ↓
[Bước 5] FE lưu vào state, hiển thị preview "KTX Khu A — 10.8701, 106.8008"
   ↓
[Bước 6] User bấm "Tạo phòng"
   ↓
[Bước 7] FE gửi POST /api/v1/rooms {originLat, originLng, destLat, destLng, ...}
   ↓
[Bước 8] BE tính H3 index (res=9), INSERT rooms + addresses
   ↓
[Bước 9] BE trả về roomId + countdownSec:300 → FE redirect sang /rooms/{roomId}
   ↓
[Bước 10] FE bắt đầu countdown tick (setInterval 1s)
   ↓
[-- Sau đó --]
[Bước 11] User khác vào /rooms/browse, gõ origin của họ
   ↓
[Bước 12] FE gọi GET /api/v1/rooms?originLat=X&originLng=Y&destLat=Z&destLng=W
   ↓
[Bước 13] BE gridDisk(originH3, k=2) → 19 cells
   ↓
[Bước 14] SQL: SELECT * FROM rooms WHERE status='OPEN' AND origin_h3 IN (...19 cells...)
   ↓
[Bước 15] Filter thêm: dest_h3 cùng vùng
   ↓
[Bước 16] Sort by Haversine distance → top 10
   ↓
[Bước 17] FE hiển thị RoomCard list với badge khoảng cách
```

---

## 16. Tính khoảng cách — Haversine cho MVP

### 16.1 Công thức Haversine

```
a = sin²(Δφ/2) + cos(φ1) × cos(φ2) × sin²(Δλ/2)
c = 2 × atan2(√a, √(1−a))
d = R × c
```

**Ví dụ:**

- KTX Khu A: (10.8701, 106.8008)
- Bến Thành: (10.7720, 106.6980)
- Haversine ≈ **13.8 km** (đường chim bay)
- Đường đi thật (Google Maps): ~16.5 km
- Sai số: ~16% — chấp nhận được cho MVP

### 16.2 Backend — H3GeoService (distance + ETA)

```java
@Service
@RequiredArgsConstructor
public class H3GeoService {
    private static final int H3_RESOLUTION = 9;
    private static final int K_RING = 2;

    /**
     * Khoảng cách Haversine giữa 2 lat/lng (km).
     */
    public double haversineKm(double lat1, double lng1, double lat2, double lng2) {
        final double R = 6371.0;
        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);
        double dLat    = Math.toRadians(lat2 - lat1);
        double dLng    = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(lat1Rad) * Math.cos(lat2Rad)
                 * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Estimate route km: Haversine × 1.2 (heuristic: đường thật dài hơn ~20%).
     */
    public double estimateRouteKm(double lat1, double lng1, double lat2, double lng2) {
        return haversineKm(lat1, lng1, lat2, lng2) * 1.20;
    }

    /**
     * Estimate ETA (phút) với tốc độ trung bình 25 km/h.
     */
    public int estimateEtaMinutes(double distanceKm) {
        return (int) Math.round((distanceKm / 25.0) * 60);
    }
}
```

### 16.3 Tích hợp vào Room Service

```java
// module/room/service/RoomService.java (snippet)
@Service
@RequiredArgsConstructor
public class RoomService {
    private final H3GeoService h3;
    private final RoomRepository roomRepository;

    public Room createRoom(CreateRoomRequest req) {
        // 1. Validate Minimum 2km
        double distance = h3.estimateRouteKm(
            req.originLat(), req.originLng(),
            req.destLat(),   req.destLng()
        );
        if (distance < 2.0) {
            throw new AppException(ErrorCode.ROUTE_TOO_SHORT,
                "Quãng đường phải ≥ 2km. Bạn nên đi bộ hoặc xe đạp.");
        }

        // 2. Tính H3 cells
        String originH3 = h3.latLngToCell(req.originLat(), req.originLng());
        String destH3   = h3.latLngToCell(req.destLat(),   req.destLng());

        // 3. Estimate ETA
        int etaMin = h3.estimateEtaMinutes(distance);

        // 4. Insert DB
        Room room = Room.builder()
            .hostUserId(req.hostUserId())
            .originLat(req.originLat()).originLng(req.originLng())
            .destLat(req.destLat()).destLng(req.destLng())
            .originH3(originH3).destH3(destH3)
            .distanceKm(distance)
            .etaMinutes(etaMin)
            .status("OPEN")
            .countdownRemainingSec(300)
            .build();

        return roomRepository.save(room);
    }
}
```

### 16.4 Frontend — Haversine preview

```typescript
// src/lib/utils/geo.ts — Haversine phía FE (preview trước khi submit)
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const distance = origin && dest
  ? haversineKm(origin.geometry.location.lat, origin.geometry.location.lng,
                dest.geometry.location.lat,   dest.geometry.location.lng)
  : 0;

const tooShort = distance > 0 && distance < 2;
```

### 16.5 Tổng kết

| Quyết định           | MVP (10 giờ)                             | Phase 2+                    |
| ----------------------- | ----------------------------------------- | --------------------------- |
| **Geocoding**     | Goong Place Autocomplete (FE trực tiếp) | Goong + cache               |
| **Spatial index** | H3 res=9 (in-memory gridDisk)             | H3 + PostGIS nếu scale     |
| **Distance calc** | **Haversine × 1.2**                | Goong Directions hoặc OSRM |
| **ETA estimate**  | Fix 25 km/h                               | Routing engine duration     |
