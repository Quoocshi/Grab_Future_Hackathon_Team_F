package com.hubride.module.aggregator;

import com.hubride.common.enums.Partner;
import lombok.Builder;

@Builder
public record PartnerQuote(
        Partner partner,
        long totalPrice,
        int etaMinutes,
        double surgeMultiplier,
        String vehicleType
) {
    public long priceAfterSurge() {
        return Math.round(totalPrice * surgeMultiplier);
    }
}
