package com.hubride.module.address.controller;

import com.hubride.common.response.ApiResponse;
import com.hubride.module.address.dto.AddressResponse;
import com.hubride.module.address.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
@Tag(name = "Addresses", description = "Address search (autocomplete)")
@CrossOrigin(origins = "*")
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    @Operation(summary = "Search addresses by query string")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> searchAddresses(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(addressService.search(q, limit)));
    }
}
