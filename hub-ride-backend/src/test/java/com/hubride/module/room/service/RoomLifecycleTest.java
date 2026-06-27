package com.hubride.module.room.service;

import com.hubride.module.room.entity.Room;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RoomLifecycleTest {

    private final RoomService roomService = new RoomService(
            null, null, null, null, null, null, null);

    @Test
    void expiredRoomHasNoRemainingTime() {
        Room room = Room.builder()
                .createdAt(OffsetDateTime.now().minusSeconds(31))
                .countdownRemainingSec(30)
                .build();

        assertEquals(0, roomService.remainingSeconds(room));
    }

    @Test
    void activeRoomDerivesRemainingTimeFromCreatedAt() {
        Room room = Room.builder()
                .createdAt(OffsetDateTime.now())
                .countdownRemainingSec(30)
                .build();

        int remaining = roomService.remainingSeconds(room);

        assertTrue(remaining >= 29 && remaining <= 30);
    }
}
