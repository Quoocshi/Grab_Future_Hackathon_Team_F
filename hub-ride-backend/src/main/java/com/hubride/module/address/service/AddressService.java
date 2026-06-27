package com.hubride.module.address.service;

import com.hubride.module.address.dto.AddressResponse;
import com.hubride.module.address.entity.Address;
import com.hubride.module.address.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;

    public List<AddressResponse> search(String q, int limit) {
        if (q == null || q.isBlank()) {
            return addressRepository.findAll().stream()
                    .limit(limit)
                    .map(this::toResponse)
                    .toList();
        }
        return addressRepository.search(q, limit).stream()
                .map(this::toResponse)
                .toList();
    }

    public Address getById(java.util.UUID id) {
        return addressRepository.findById(id)
                .orElseThrow(() -> new com.hubride.common.exception.AppException(
                        com.hubride.common.exception.ErrorCode.ADDRESS_NOT_FOUND));
    }

    private AddressResponse toResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .label(address.getLabel())
                .fullAddress(address.getFullAddress())
                .latitude(address.getLatitude())
                .longitude(address.getLongitude())
                .h3Index(address.getH3Index())
                .kind(address.getKind())
                .build();
    }
}
