package com.hubride.module.room.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoomRequest {

    @NotNull(message = "hostUserId is required")
    private UUID hostUserId;

    @NotNull(message = "originLat is required")
    private Double originLat;

    @NotNull(message = "originLng is required")
    private Double originLng;

    @NotBlank(message = "originLabel is required")
    private String originLabel;

    @NotNull(message = "destLat is required")
    private Double destLat;

    @NotNull(message = "destLng is required")
    private Double destLng;

    @NotBlank(message = "destLabel is required")
    private String destLabel;
}
