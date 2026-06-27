-- ============================================================
-- Hub-Ride Migration v2 — Add origin_label, dest_label columns
-- Chạy 1 lần duy nhất trên Neon (sau khi init.sql cũ đã chạy)
-- ============================================================

-- 1. Thêm 2 cột mới
ALTER TABLE rooms
    ADD COLUMN IF NOT EXISTS origin_label VARCHAR(200),
    ADD COLUMN IF NOT EXISTS dest_label   VARCHAR(200);

-- 2. Xóa FK constraints cũ (bảng rooms đang reference addresses)
--    Nếu bạn muốn dùng origin_address_id / dest_address_id sau này
--    thì bỏ comment 2 dòng dưới và chạy lại ALTER TABLE (giữ nguyên nếu chưa cần)
-- ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_origin_address_id_fkey;
-- ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_dest_address_id_fkey;

-- 3. Verify
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'rooms' AND column_name = 'origin_label')
    THEN RAISE NOTICE 'Migration OK: origin_label added';
    ELSE  RAISE WARNING 'origin_label still missing!';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'rooms' AND column_name = 'dest_label')
    THEN RAISE NOTICE 'Migration OK: dest_label added';
    ELSE  RAISE WARNING 'dest_label still missing!';
    END IF;
END $$;
