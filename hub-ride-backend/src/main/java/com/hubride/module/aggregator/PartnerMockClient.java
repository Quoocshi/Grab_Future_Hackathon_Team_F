package com.hubride.module.aggregator;

import com.hubride.module.room.entity.Room;

public interface PartnerMockClient {
    PartnerQuote quote(Room room);
}
