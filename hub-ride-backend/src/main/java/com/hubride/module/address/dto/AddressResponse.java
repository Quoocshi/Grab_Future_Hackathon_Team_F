package com.hubride.module.address.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {
    private UUID id;
    private String label;
    private String fullAddress;
    private Double latitude;
    private Double longitude;
    private String h3Index;
    private String kind;
}
