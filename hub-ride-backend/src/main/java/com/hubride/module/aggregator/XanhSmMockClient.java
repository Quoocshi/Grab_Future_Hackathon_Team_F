package com.hubride.module.aggregator;

import com.hubride.common.enums.Partner;
import com.hubride.module.room.entity.Room;
import org.springframework.stereotype.Component;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class XanhSmMockClient implements PartnerMockClient {

    @Override
    public PartnerQuote quote(Room room) {
        ThreadLocalRandom rnd = ThreadLocalRandom.current();
        long basePrice = rnd.nextLong(50_000, 90_001);
        int eta = rnd.nextInt(10, 26);

        return PartnerQuote.builder()
                .partner(Partner.XANH_SM)
                .totalPrice(basePrice)
                .etaMinutes(eta)
                .surgeMultiplier(1.0)
                .vehicleType("CAR_4")
                .build();
    }
}
