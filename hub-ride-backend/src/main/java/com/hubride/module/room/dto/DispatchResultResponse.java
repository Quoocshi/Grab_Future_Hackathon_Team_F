package com.hubride.module.room.dto;

import com.hubride.common.enums.BookingStatus;
import com.hubride.common.enums.Partner;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DispatchResultResponse {
    private UUID roomId;
    private QuoteInfo bestQuote;
    private List<QuoteInfo> allQuotes;
    private List<BookingInfo> bookings;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuoteInfo {
        private String partner;
        private long totalPrice;
        private long perPersonPrice;
        private int etaMinutes;
        private double surgeMultiplier;
        private String vehicleType;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingInfo {
        private UUID bookingId;
        private String partner;
        private BigDecimal pricePaid;
        private Integer etaMinutes;
        private String status;
    }
}
