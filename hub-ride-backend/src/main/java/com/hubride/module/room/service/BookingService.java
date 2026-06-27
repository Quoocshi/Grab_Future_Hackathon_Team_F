package com.hubride.module.room.service;

import com.hubride.common.exception.AppException;
import com.hubride.common.exception.ErrorCode;
import com.hubride.module.room.dto.BookingResponse;
import com.hubride.module.room.entity.Booking;
import com.hubride.module.room.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;

    public List<BookingResponse> getBookingsByUser(UUID userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public BookingResponse getBookingById(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        return toResponse(booking);
    }

    private BookingResponse toResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .roomId(b.getRoomId())
                .userId(b.getUserId())
                .partner(b.getPartner())
                .pricePaid(b.getPricePaid())
                .vehicleType(b.getVehicleType())
                .etaMinutes(b.getEtaMinutes())
                .status(b.getStatus())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
