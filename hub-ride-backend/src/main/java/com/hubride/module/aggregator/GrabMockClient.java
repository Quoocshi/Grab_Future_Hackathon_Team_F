package com.hubride.module.aggregator;

import com.hubride.common.enums.Partner;
import com.hubride.module.room.entity.Room;
import org.springframework.stereotype.Component;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class GrabMockClient implements PartnerMockClient {

    @Override
    public PartnerQuote quote(Room room) {
        ThreadLocalRandom rnd = ThreadLocalRandom.current();
        long basePrice = rnd.nextLong(60_000, 120_001);
        double surge = Math.round((1.0 + rnd.nextDouble()) * 10) / 10.0;
        int eta = rnd.nextInt(10, 26);

        return PartnerQuote.builder()
                .partner(Partner.GRAB)
                .totalPrice(basePrice)
                .etaMinutes(eta)
                .surgeMultiplier(surge)
                .vehicleType("CAR_4")
                .build();
    }
}
