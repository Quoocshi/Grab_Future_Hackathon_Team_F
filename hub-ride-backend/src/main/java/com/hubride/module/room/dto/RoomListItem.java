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
public class RoomListItem {
    private UUID roomId;
    private String hostName;
    private String originLabel;
    private String destLabel;
    private Double distanceKm;
    private Integer memberCount;
    private Integer countdownSec;
}
