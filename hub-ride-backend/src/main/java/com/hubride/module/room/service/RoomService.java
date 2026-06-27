package com.hubride.module.room.service;

import com.hubride.common.enums.MemberRole;
import com.hubride.common.enums.RoomStatus;
import com.hubride.common.exception.AppException;
import com.hubride.common.exception.ErrorCode;
import com.hubride.common.exception.RoomExpiredException;
import com.hubride.module.room.config.RoomProperties;
import com.hubride.module.room.dto.*;
import com.hubride.module.room.entity.Room;
import com.hubride.module.room.entity.RoomMember;
import com.hubride.module.room.repository.RoomMemberRepository;
import com.hubride.module.room.repository.RoomRepository;
import com.hubride.module.user.entity.User;
import com.hubride.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final UserRepository userRepository;
    private final H3GeoService h3;
    private final RoomProperties roomProperties;
    private final RoomWalletService walletService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public CreateRoomResponse createRoom(CreateRoomRequest req) {
        double distance = h3.estimateRouteKm(
                req.getOriginLat(), req.getOriginLng(),
                req.getDestLat(), req.getDestLng());

        if (distance < 2.0) {
            throw new AppException(ErrorCode.ROUTE_TOO_SHORT);
        }

        User host = userRepository.findByIdForUpdate(req.getHostUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        BigDecimal amountHeld = walletService.hold(host);

        String originH3 = h3.latLngToCell(req.getOriginLat(), req.getOriginLng());
        String destH3 = h3.latLngToCell(req.getDestLat(), req.getDestLng());
        int etaMin = h3.estimateEtaMinutes(distance);

        Room room = Room.builder()
                .hostUserId(req.getHostUserId())
                .originH3(originH3)
                .destH3(destH3)
                .originLat(req.getOriginLat())
                .originLng(req.getOriginLng())
                .destLat(req.getDestLat())
                .destLng(req.getDestLng())
                .originLabel(req.getOriginLabel())
                .destLabel(req.getDestLabel())
                .distanceKm(distance)
                .etaMinutes(etaMin)
                .status(RoomStatus.OPEN)
                .countdownRemainingSec(roomProperties.getCountdownSeconds())
                .members(new ArrayList<>())
                .build();
        room = roomRepository.save(room);

        RoomMember hostMember = RoomMember.builder()
                .room(room)
                .userId(host.getId())
                .role(MemberRole.HOST)
                .amountHeld(amountHeld)
                .build();
        roomMemberRepository.save(hostMember);

        return CreateRoomResponse.builder()
                .roomId(room.getId())
                .countdownSec(room.getCountdownRemainingSec())
                .origin(CreateRoomResponse.AddressInfo.builder()
                        .label(req.getOriginLabel())
                        .lat(req.getOriginLat())
                        .lng(req.getOriginLng())
                        .h3Index(originH3)
                        .build())
                .dest(CreateRoomResponse.AddressInfo.builder()
                        .label(req.getDestLabel())
                        .lat(req.getDestLat())
                        .lng(req.getDestLng())
                        .h3Index(destH3)
                        .build())
                .distanceKm(distance)
                .etaMinutes(etaMin)
                .hostName(host.getFullName())
                .build();
    }

    public List<RoomListItem> searchNearbyRooms(double originLat, double originLng,
                                                 double destLat, double destLng,
                                                 UUID excludeUserId) {
        String originH3 = h3.latLngToCell(originLat, originLng);
        List<String> searchArea = h3.gridDisk(originH3);
        String[] cellArray = searchArea.toArray(new String[0]);

        List<Room> candidates = roomRepository.findOpenRoomsInCells(cellArray, excludeUserId);

        String destH3 = h3.latLngToCell(destLat, destLng);
        List<String> destArea = h3.gridDisk(destH3);

        Map<UUID, User> userMap = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return candidates.stream()
                .filter(r -> destArea.contains(r.getDestH3()))
                .map(r -> {
                    double userDistance = h3.straightLineKm(
                            r.getOriginLat(), r.getOriginLng(),
                            originLat, originLng);
                    User host = userMap.get(r.getHostUserId());
                    int memberCount = roomMemberRepository.findByRoomId(r.getId()).size();
                    return RoomListItem.builder()
                            .roomId(r.getId())
                            .hostName(host != null ? host.getFullName() : "Unknown")
                            .originLabel(r.getOriginLabel() != null ? r.getOriginLabel() : r.getOriginLat() + "," + r.getOriginLng())
                            .destLabel(r.getDestLabel() != null ? r.getDestLabel() : r.getDestLat() + "," + r.getDestLng())
                            .distanceKm(Math.round(userDistance * 100.0) / 100.0)
                            .memberCount(memberCount)
                            .countdownSec(remainingSeconds(r))
                            .build();
                })
                .sorted((a, b) -> Double.compare(a.getDistanceKm(), b.getDistanceKm()))
                .limit(10)
                .toList();
    }

    @Transactional
    public RoomDetailResponse getRoomDetail(UUID roomId) {
        Room room = roomRepository.findByIdForUpdate(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        List<RoomMember> members = roomMemberRepository.findByRoomId(roomId);
        expireIfInsufficient(room, members);
        Map<UUID, User> userMap = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        User host = userMap.get(room.getHostUserId());

        List<RoomDetailResponse.MemberInfo> memberInfos = members.stream()
                .map(m -> {
                    User u = userMap.get(m.getUserId());
                    return RoomDetailResponse.MemberInfo.builder()
                            .userId(m.getUserId())
                            .fullName(u != null ? u.getFullName() : "Unknown")
                            .role(m.getRole().name())
                            .amountHeld(m.getAmountHeld())
                            .build();
                })
                .toList();

        return RoomDetailResponse.builder()
                .roomId(room.getId())
                .status(room.getStatus())
                .host(RoomDetailResponse.MemberInfo.builder()
                        .userId(host.getId())
                        .fullName(host.getFullName())
                        .role("HOST")
                        .amountHeld(members.stream()
                                .filter(m -> m.getUserId().equals(host.getId()))
                                .map(RoomMember::getAmountHeld)
                                .findFirst()
                                .orElse(BigDecimal.ZERO))
                        .build())
                .members(memberInfos)
                .origin(RoomDetailResponse.AddressInfo.builder()
                        .label(room.getOriginLabel() != null ? room.getOriginLabel() : room.getOriginLat() + "," + room.getOriginLng())
                        .lat(room.getOriginLat())
                        .lng(room.getOriginLng())
                        .h3Index(room.getOriginH3())
                        .build())
                .dest(RoomDetailResponse.AddressInfo.builder()
                        .label(room.getDestLabel() != null ? room.getDestLabel() : room.getDestLat() + "," + room.getDestLng())
                        .lat(room.getDestLat())
                        .lng(room.getDestLng())
                        .h3Index(room.getDestH3())
                        .build())
                .countdownSec(remainingSeconds(room))
                .distanceKm(room.getDistanceKm())
                .etaMinutes(room.getEtaMinutes())
                .build();
    }

    @Transactional(noRollbackFor = RoomExpiredException.class)
    public JoinRoomResponse joinRoom(UUID roomId, UUID userId) {
        Room room = roomRepository.findByIdForUpdate(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (room.getStatus() != RoomStatus.OPEN) {
            throw new AppException(ErrorCode.ROOM_NOT_OPEN);
        }

        List<RoomMember> currentMembers = roomMemberRepository.findByRoomId(roomId);
        if (remainingSeconds(room) == 0) {
            expireIfInsufficient(room, currentMembers);
            if (room.getStatus() == RoomStatus.EXPIRED) throw new RoomExpiredException();
            throw new AppException(ErrorCode.ROOM_COUNTDOWN_FINISHED);
        }

        if (currentMembers.stream().anyMatch(m -> m.getUserId().equals(userId))) {
            throw new AppException(ErrorCode.USER_ALREADY_IN_ROOM);
        }

        User user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        BigDecimal amountHeld = walletService.hold(user);

        RoomMember member = RoomMember.builder()
                .room(room)
                .userId(user.getId())
                .role(MemberRole.JOINER)
                .amountHeld(amountHeld)
                .build();
        roomMemberRepository.save(member);

        List<RoomMember> allMembers = roomMemberRepository.findByRoomId(roomId);
        BigDecimal totalHeld = allMembers.stream()
                .map(RoomMember::getAmountHeld)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        JoinRoomResponse response = JoinRoomResponse.builder()
                .memberCount(allMembers.size())
                .totalHeld(totalHeld)
                .build();

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId,
                new DispatchService.WsPayload("JOIN", java.util.Map.of("memberCount", allMembers.size())));

        return response;
    }

    @Transactional(noRollbackFor = RoomExpiredException.class)
    public RefundResponse cancelRoom(UUID roomId, UUID userId) {
        Room room = roomRepository.findByIdForUpdate(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (!room.getHostUserId().equals(userId)) {
            throw new AppException(ErrorCode.ONLY_HOST_CAN_CANCEL);
        }

        if (room.getStatus() != RoomStatus.OPEN) {
            if (room.getStatus() == RoomStatus.EXPIRED) throw new RoomExpiredException();
            throw new AppException(ErrorCode.ROOM_NOT_OPEN);
        }

        List<RoomMember> members = roomMemberRepository.findByRoomId(roomId);
        if (remainingSeconds(room) == 0) {
            expireIfInsufficient(room, members);
            if (room.getStatus() == RoomStatus.EXPIRED) throw new RoomExpiredException();
            throw new AppException(ErrorCode.ROOM_COUNTDOWN_FINISHED);
        }

        BigDecimal refundedAmount = walletService.refundAll(members);
        room.setStatus(RoomStatus.CANCELLED);
        roomRepository.save(room);

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId,
                new DispatchService.WsPayload("CANCELLED", java.util.Map.of(
                        "roomId", roomId.toString(),
                        "refundedAmount", refundedAmount)));

        return RefundResponse.builder().refundedAmount(refundedAmount).build();
    }

    @Transactional(noRollbackFor = RoomExpiredException.class)
    public RefundResponse leaveRoom(UUID roomId, UUID userId) {
        Room room = roomRepository.findByIdForUpdate(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (room.getStatus() != RoomStatus.OPEN) {
            if (room.getStatus() == RoomStatus.EXPIRED) throw new RoomExpiredException();
            throw new AppException(ErrorCode.ROOM_NOT_OPEN);
        }

        List<RoomMember> members = roomMemberRepository.findByRoomId(roomId);
        if (remainingSeconds(room) == 0) {
            expireIfInsufficient(room, members);
            if (room.getStatus() == RoomStatus.EXPIRED) throw new RoomExpiredException();
            throw new AppException(ErrorCode.ROOM_COUNTDOWN_FINISHED);
        }

        RoomMember member = members.stream()
                .filter(candidate -> candidate.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_IN_ROOM));

        if (member.getRole() == MemberRole.HOST) {
            throw new AppException(ErrorCode.ONLY_HOST_CAN_CANCEL);
        }

        BigDecimal refundedAmount = walletService.refund(member);
        roomMemberRepository.delete(member);

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId,
                new DispatchService.WsPayload("LEAVE", java.util.Map.of(
                        "userId", userId.toString(),
                        "refundedAmount", refundedAmount)));

        return RefundResponse.builder().refundedAmount(refundedAmount).build();
    }

    int remainingSeconds(Room room) {
        OffsetDateTime deadline = room.getCreatedAt().plusSeconds(room.getCountdownRemainingSec());
        long millis = Duration.between(OffsetDateTime.now(), deadline).toMillis();
        if (millis <= 0) return 0;
        return (int) Math.ceil(millis / 1000.0);
    }

    private void expireIfInsufficient(Room room, List<RoomMember> members) {
        if (room.getStatus() != RoomStatus.OPEN || remainingSeconds(room) > 0 || members.size() >= 2) {
            return;
        }

        BigDecimal refundedAmount = walletService.refundAll(members);
        room.setStatus(RoomStatus.EXPIRED);
        roomRepository.save(room);
        messagingTemplate.convertAndSend(
                "/topic/room/" + room.getId(),
                new DispatchService.WsPayload("EXPIRED", java.util.Map.of(
                        "roomId", room.getId().toString(),
                        "refundedAmount", refundedAmount)));
    }
}
