package com.hubride.module.room.service;

import com.hubride.common.enums.BookingStatus;
import com.hubride.common.enums.MemberRole;
import com.hubride.common.enums.RoomStatus;
import com.hubride.common.exception.AppException;
import com.hubride.common.exception.ErrorCode;
import com.hubride.module.aggregator.AggregatorService;
import com.hubride.module.aggregator.PartnerQuote;
import com.hubride.module.room.dto.DispatchResultResponse;
import com.hubride.module.room.entity.Booking;
import com.hubride.module.room.entity.Room;
import com.hubride.module.room.entity.RoomMember;
import com.hubride.module.room.repository.BookingRepository;
import com.hubride.module.room.repository.RoomMemberRepository;
import com.hubride.module.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DispatchService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final BookingRepository bookingRepository;
    private final AggregatorService aggregatorService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public DispatchResultResponse dispatch(UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (room.getStatus() == RoomStatus.DISPATCHED) {
            throw new AppException(ErrorCode.ROOM_ALREADY_DISPATCHED);
        }
        if (room.getStatus() != RoomStatus.OPEN) {
            throw new AppException(ErrorCode.ROOM_NOT_OPEN);
        }

        List<RoomMember> members = roomMemberRepository.findByRoomId(roomId);
        if (members.isEmpty()) {
            throw new AppException(ErrorCode.DISPATCH_FAILED);
        }

        AggregatorService.QuoteResult result = aggregatorService.getQuotes(room, members.size());

        List<Booking> bookings = members.stream()
                .map(m -> Booking.builder()
                        .roomId(room.getId())
                        .userId(m.getUserId())
                        .partner(result.best().partner())
                        .pricePaid(BigDecimal.valueOf(result.perPersonPrice()))
                        .vehicleType(result.best().vehicleType())
                        .etaMinutes(result.best().etaMinutes())
                        .status(BookingStatus.CONFIRMED)
                        .build())
                .toList();
        bookingRepository.saveAll(bookings);

        room.setStatus(RoomStatus.DISPATCHED);
        room.setDispatchedAt(OffsetDateTime.now());
        roomRepository.save(room);

        DispatchResultResponse response = DispatchResultResponse.builder()
                .roomId(room.getId())
                .bestQuote(mapQuote(result.best(), result.perPersonPrice()))
                .allQuotes(result.all().stream()
                        .map(q -> mapQuote(q, q.priceAfterSurge() / members.size()))
                        .toList())
                .bookings(bookings.stream()
                        .map(b -> DispatchResultResponse.BookingInfo.builder()
                                .bookingId(b.getId())
                                .partner(b.getPartner().name())
                                .pricePaid(b.getPricePaid())
                                .etaMinutes(b.getEtaMinutes())
                                .status(b.getStatus().name())
                                .build())
                        .toList())
                .build();

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId,
                new WsPayload("DISPATCHED", response));

        return response;
    }

    private DispatchResultResponse.QuoteInfo mapQuote(PartnerQuote q, long perPerson) {
        return DispatchResultResponse.QuoteInfo.builder()
                .partner(q.partner().name())
                .totalPrice(q.priceAfterSurge())
                .perPersonPrice(perPerson)
                .etaMinutes(q.etaMinutes())
                .surgeMultiplier(q.surgeMultiplier())
                .vehicleType(q.vehicleType())
                .build();
    }

    public record WsPayload(String event, Object payload) {}
}
