package com.hubride.module.room.repository;

import com.hubride.common.enums.RoomStatus;
import com.hubride.module.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {

    List<Room> findByStatus(RoomStatus status);

    @Query(value = """
        SELECT * FROM rooms
        WHERE status = 'OPEN'
          AND origin_h3 = ANY(:h3Cells)
          AND host_user_id != :excludeUserId
          AND created_at > NOW() - INTERVAL '10 minutes'
        ORDER BY created_at DESC
        LIMIT 50
        """, nativeQuery = true)
    List<Room> findOpenRoomsInCells(@Param("h3Cells") String[] h3Cells, @Param("excludeUserId") UUID excludeUserId);

    List<Room> findByHostUserId(UUID hostUserId);
}
