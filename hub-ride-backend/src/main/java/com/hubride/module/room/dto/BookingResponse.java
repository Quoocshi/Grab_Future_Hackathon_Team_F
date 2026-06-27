package com.hubride.module.room.dto;

import com.hubride.common.enums.BookingStatus;
import com.hubride.common.enums.Partner;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private UUID id;
    private UUID roomId;
    private UUID userId;
    private Partner partner;
    private BigDecimal pricePaid;
    private String vehicleType;
    private Integer etaMinutes;
    private BookingStatus status;
    private OffsetDateTime createdAt;
}
