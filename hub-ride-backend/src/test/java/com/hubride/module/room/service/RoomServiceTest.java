package com.hubride.module.room.service;

import com.hubride.common.enums.RoomStatus;
import com.hubride.common.exception.AppException;
import com.hubride.common.exception.ErrorCode;
import com.hubride.module.room.config.RoomProperties;
import com.hubride.module.room.entity.Room;
import com.hubride.module.room.repository.RoomMemberRepository;
import com.hubride.module.room.repository.RoomRepository;
import com.hubride.module.user.entity.User;
import com.hubride.module.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RoomMemberRepository roomMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private H3GeoService h3GeoService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private RoomService roomService;
    private RoomProperties roomProperties;

    @BeforeEach
    void setUp() {
        roomProperties = new RoomProperties();
        roomProperties.setCountdownSeconds(30);
        roomService = new RoomService(
                roomRepository,
                roomMemberRepository,
                userRepository,
                h3GeoService,
                roomProperties,
                messagingTemplate);
    }

    @Test
    void joinRoomRejectsOpenRoomAfterCountdownExpires() {
        UUID roomId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Room room = openRoom(roomId, OffsetDateTime.now().minusSeconds(31));

        when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));

        assertThatThrownBy(() -> roomService.joinRoom(roomId, userId))
                .isInstanceOf(AppException.class)
                .extracting(ex -> ((AppException) ex).getErrorCode())
                .isEqualTo(ErrorCode.ROOM_NOT_OPEN);

        verify(roomMemberRepository, never()).save(any());
    }

    @Test
    void joinRoomAllowsOpenRoomBeforeCountdownExpires() {
        UUID roomId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Room room = openRoom(roomId, OffsetDateTime.now().minusSeconds(5));
        User user = User.builder()
                .id(userId)
                .fullName("Mai")
                .phone("0900000002")
                .build();

        when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));
        when(roomMemberRepository.existsByRoomIdAndUserId(roomId, userId)).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(roomMemberRepository.findByRoomId(roomId)).thenReturn(List.of());

        roomService.joinRoom(roomId, userId);

        ArgumentCaptor<com.hubride.module.room.entity.RoomMember> memberCaptor =
                ArgumentCaptor.forClass(com.hubride.module.room.entity.RoomMember.class);
        verify(roomMemberRepository).save(memberCaptor.capture());
        assertThat(memberCaptor.getValue().getUserId()).isEqualTo(userId);
        verify(messagingTemplate).convertAndSend(eq("/topic/room/" + roomId), any(DispatchService.WsPayload.class));
    }

    private Room openRoom(UUID roomId, OffsetDateTime createdAt) {
        return Room.builder()
                .id(roomId)
                .hostUserId(UUID.randomUUID())
                .originH3("origin-cell")
                .destH3("dest-cell")
                .originLat(10.0)
                .originLng(106.0)
                .destLat(11.0)
                .destLng(107.0)
                .status(RoomStatus.OPEN)
                .countdownRemainingSec(30)
                .createdAt(createdAt)
                .build();
    }
}
