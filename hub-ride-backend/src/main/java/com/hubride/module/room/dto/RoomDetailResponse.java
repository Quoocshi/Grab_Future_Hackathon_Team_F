package com.hubride.module.room.dto;

import com.hubride.common.enums.RoomStatus;
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
public class RoomDetailResponse {
    private UUID roomId;
    private RoomStatus status;
    private MemberInfo host;
    private List<MemberInfo> members;
    private AddressInfo origin;
    private AddressInfo dest;
    private Integer countdownSec;
    private Double distanceKm;
    private Integer etaMinutes;
    private PartnerQuoteInfo bestQuote;
    private List<PartnerQuoteInfo> allQuotes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberInfo {
        private UUID userId;
        private String fullName;
        private String role;
        private BigDecimal amountHeld;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressInfo {
        private String label;
        private Double lat;
        private Double lng;
        private String h3Index;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PartnerQuoteInfo {
        private String partner;
        private BigDecimal totalPrice;
        private BigDecimal perPerson;
        private Integer etaMinutes;
        private Double surgeMultiplier;
    }
}
