package com.hubride.module.room.controller;

import com.hubride.common.response.ApiResponse;
import com.hubride.module.room.dto.BookingResponse;
import com.hubride.module.room.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Booking queries after dispatch")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    @Operation(summary = "List all bookings for a user")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByUser(
            @RequestParam UUID userId) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getBookingsByUser(userId)));
    }

    @GetMapping("/{bookingId}")
    @Operation(summary = "Get booking detail")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable UUID bookingId) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getBookingById(bookingId)));
    }
}
