package com.hubride.module.aggregator;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PartnerRegistry {

    private final List<PartnerMockClient> clients;

    public List<PartnerMockClient> getAll() {
        return clients;
    }
}
