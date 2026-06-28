package com.hubride.module.user.service;

import com.hubride.module.user.dto.UserResponse;
import com.hubride.module.user.entity.User;
import com.hubride.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse getUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.hubride.common.exception.AppException(
                        com.hubride.common.exception.ErrorCode.USER_NOT_FOUND));
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .walletBalance(user.getWalletBalance())
                .build();
    }
}
