package com.hubride.module.room.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoomResponse {
    private UUID roomId;
    private Integer countdownSec;
    private AddressInfo origin;
    private AddressInfo dest;
    private Double distanceKm;
    private Integer etaMinutes;
    private String hostName;

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
}
