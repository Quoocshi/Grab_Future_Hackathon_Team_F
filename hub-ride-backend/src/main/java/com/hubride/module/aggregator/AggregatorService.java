package com.hubride.module.aggregator;

import com.hubride.module.room.entity.Room;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AggregatorService {

    private final PartnerRegistry registry;

    public record QuoteResult(PartnerQuote best, List<PartnerQuote> all, int memberCount, long perPersonPrice) {}

    public QuoteResult getQuotes(Room room, int memberCount) {
        List<PartnerQuote> all = registry.getAll().stream()
                .map(c -> c.quote(room))
                .toList();

        PartnerQuote best = all.stream()
                .min(Comparator.comparingLong(PartnerQuote::priceAfterSurge))
                .orElseThrow();

        long perPerson = best.priceAfterSurge() / memberCount;

        return new QuoteResult(best, all, memberCount, perPerson);
    }
}
