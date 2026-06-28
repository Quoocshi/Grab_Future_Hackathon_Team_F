-- ============================================================
-- Hub-Ride MVP Schema — PostgreSQL (Neon)
-- Run once via psql, pgAdmin, or Neon Console
-- ============================================================

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------
-- USERS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name      VARCHAR(100) NOT NULL,
    phone          VARCHAR(20)  NOT NULL UNIQUE,
    wallet_balance DECIMAL(12, 2) NOT NULL DEFAULT 500000.00,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- ADDRESSES
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS addresses (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label        VARCHAR(200) NOT NULL,
    full_address TEXT         NOT NULL,
    latitude     DOUBLE PRECISION NOT NULL,
    longitude    DOUBLE PRECISION NOT NULL,
    h3_index     VARCHAR(20)  NOT NULL,
    kind         VARCHAR(20)  NOT NULL DEFAULT 'POPULAR'  -- HUB | POPULAR | CUSTOM
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
    origin_label            VARCHAR(200),
    dest_label              VARCHAR(200),
    status                  VARCHAR(20)  NOT NULL DEFAULT 'OPEN',  -- OPEN | DISPATCHED | CANCELLED | EXPIRED
    countdown_remaining_sec INT          NOT NULL DEFAULT 300,
    distance_km             DOUBLE PRECISION,
    eta_minutes             INT,
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    dispatched_at           TIMESTAMPTZ
);

-- -------------------------------------------------------
-- ROOM MEMBERS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS room_members (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id     UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id),
    role        VARCHAR(10)  NOT NULL DEFAULT 'JOINER',  -- HOST | JOINER
    amount_held DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    joined_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
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
-- INDEXES
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_rooms_status_origin_h3
    ON rooms(origin_h3) WHERE status = 'OPEN';

CREATE INDEX IF NOT EXISTS idx_room_members_user
    ON room_members(user_id);

CREATE INDEX IF NOT EXISTS idx_bookings_user
    ON bookings(user_id, created_at DESC);

-- -------------------------------------------------------
-- MIGRATION: add columns if not exist (for existing DB)
-- -------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'origin_label') THEN
        ALTER TABLE rooms ADD COLUMN origin_label VARCHAR(200);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'dest_label') THEN
        ALTER TABLE rooms ADD COLUMN dest_label VARCHAR(200);
    END IF;
END $$;

-- -------------------------------------------------------
-- SEED DATA: 5 demo users
-- -------------------------------------------------------
INSERT INTO users (id, full_name, phone, wallet_balance) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Lan',   '0900000001', 500000.00),
    ('00000000-0000-0000-0000-000000000002', 'Mai',   '0900000002', 500000.00),
    ('00000000-0000-0000-0000-000000000003', 'Khoa',  '0900000003', 500000.00),
    ('00000000-0000-0000-0000-000000000004', 'Hung',  '0900000004', 500000.00),
    ('00000000-0000-0000-0000-000000000005', 'Linh',  '0900000005', 500000.00)
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------
-- SEED DATA: 20 demo addresses (TP.HCM area)
-- -------------------------------------------------------
INSERT INTO addresses (id, label, full_address, latitude, longitude, h3_index, kind) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'KTX Khu A',
     'Khu A, Đại học Quốc gia TP.HCM, Đông Hòa, Dĩ An, Bình Dương',
     10.8701, 106.8008, '89459aaa1a3ffff', 'HUB'),
    ('a0000000-0000-0000-0000-000000000002', 'KTX Khu B',
     'Khu B, Đại học Quốc gia TP.HCM, Đông Hòa, Dĩ An, Bình Dương',
     10.8750, 106.8050, '89459aac27ffff', 'HUB'),
    ('a0000000-0000-0000-0000-000000000003', 'Nhà Văn hóa SV',
     'Nhà Văn hóa Sinh viên, ĐHQG TP.HCM, Đông Hòa, Dĩ An, Bình Dương',
     10.8680, 106.7980, '89459aaa8affff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000004', 'Cổng chính ĐHQG',
     'Cổng chính ĐHQG TP.HCM, Linh Trung, Thủ Đức, TP.HCM',
     10.8710, 106.7930, '89459aaac7ffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000005', 'ĐH Bách Khoa',
     'Đại học Bách Khoa TP.HCM, Lý Thường Kiệt, Q.10, TP.HCM',
     10.7726, 106.6650, '89459a4645ffff', 'HUB'),
    ('a0000000-0000-0000-0000-000000000006', 'ĐH Sư Phạm Kỹ Thuật',
     'Đại học Sư Phạm Kỹ Thuật TP.HCM, Võ Văn Tần, Q.3, TP.HCM',
     10.7875, 106.6930, '89459a2e2bffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000007', 'Quận 1',
     'Quận 1, TP.HCM',
     10.7756, 106.6980, '89459a26a7ffff', 'HUB'),
    ('a0000000-0000-0000-0000-000000000008', 'Bến Thành',
     'Chợ Bến Thành, Đường Lê Lợi, Quận 1, TP.HCM',
     10.7720, 106.6980, '89459a26a7ffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000009', 'Phố đi bộ Nguyễn Huệ',
     'Phố đi bộ Nguyễn Huệ, Quận 1, TP.HCM',
     10.7740, 106.7040, '89459a26c3ffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000010', 'Ga Sài Gòn',
     'Ga Sài Gòn, Nguyễn Thông, Quận 3, TP.HCM',
     10.7875, 106.6805, '89459a2c1bffff', 'HUB'),
    ('a0000000-0000-0000-0000-000000000011', 'Sân bay Tân Sơn Nhất',
     'Sân bay Tân Sơn Nhất, Tân Bình, TP.HCM',
     10.8188, 106.6519, '89459a1a5bffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000012', 'Lotte Mart Q7',
     'Lotte Mart, Đường Nguyễn Lương Bằng, Quận 7, TP.HCM',
     10.7280, 106.7210, '89459a2a1ffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000013', 'ĐH Kinh tế',
     'Đại học Kinh tế TP.HCM, Nguyễn Văn Linh, Q.7, TP.HCM',
     10.7310, 106.7080, '89459a29d7ffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000014', 'ĐH Nông Lâm',
     'Đại học Nông Lâm TP.HCM, Tam Bình, Thủ Đức, TP.HCM',
     10.8688, 106.7750, '89459aa9d7ffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000015', 'Coopmart',
     'Coopmart, Điện Biên Phủ, Q.Bình Thạnh, TP.HCM',
     10.8030, 106.7180, '89459a24dfffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000016', 'BigC',
     'BigC, Xô Viết Nghệ Tĩnh, Q.Bình Thạnh, TP.HCM',
     10.8010, 106.7080, '89459a24cfffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000017', 'Crescent Mall',
     'Crescent Mall, Đại lộ Nguyễn Văn Linh, Q.7, TP.HCM',
     10.7285, 106.7270, '89459a29effff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000018', 'Phú Mỹ Hưng',
     'Khu đô thị Phú Mỹ Hưng, Quận 7, TP.HCM',
     10.7300, 106.7370, '89459a2a37ffff', 'POPULAR'),
    ('a0000000-0000-0000-0000-000000000019', 'Quận 3',
     'Quận 3, TP.HCM',
     10.7848, 106.6890, '89459a2cafffff', 'HUB'),
    ('a0000000-0000-0000-0000-000000000020', 'Quận Bình Thạnh',
     'Quận Bình Thạnh, TP.HCM',
     10.8038, 106.7130, '89459a24efffff', 'HUB')
ON CONFLICT DO NOTHING;
