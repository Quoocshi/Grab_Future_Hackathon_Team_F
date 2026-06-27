package com.hubride.module.room.service;

import com.hubride.common.exception.AppException;
import com.hubride.common.exception.ErrorCode;
import com.hubride.module.room.config.RoomProperties;
import com.hubride.module.room.entity.RoomMember;
import com.hubride.module.room.repository.RoomMemberRepository;
import com.hubride.module.user.entity.User;
import com.hubride.module.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RoomWalletServiceTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final RoomMemberRepository memberRepository = mock(RoomMemberRepository.class);
    private RoomWalletService walletService;

    @BeforeEach
    void setUp() {
        RoomProperties properties = new RoomProperties();
        properties.setHoldAmount(BigDecimal.valueOf(100_000));
        walletService = new RoomWalletService(userRepository, memberRepository, properties);
    }

    @Test
    void holdDeductsConfiguredAmount() {
        User user = userWithBalance(500_000);

        BigDecimal held = walletService.hold(user);

        assertEquals(0, held.compareTo(BigDecimal.valueOf(100_000)));
        assertEquals(0, user.getWalletBalance().compareTo(BigDecimal.valueOf(400_000)));
    }

    @Test
    void holdRejectsInsufficientBalance() {
        User user = userWithBalance(50_000);

        AppException error = assertThrows(AppException.class, () -> walletService.hold(user));

        assertEquals(ErrorCode.INSUFFICIENT_BALANCE, error.getErrorCode());
        assertEquals(0, user.getWalletBalance().compareTo(BigDecimal.valueOf(50_000)));
    }

    @Test
    void settleChargesFareAndReturnsUnusedHold() {
        User user = userWithBalance(400_000);
        RoomMember member = member(user, 100_000);
        when(userRepository.findByIdForUpdate(user.getId())).thenReturn(Optional.of(user));

        walletService.settle(member, BigDecimal.valueOf(35_000));

        assertEquals(0, user.getWalletBalance().compareTo(BigDecimal.valueOf(465_000)));
        assertEquals(0, member.getAmountHeld().compareTo(BigDecimal.ZERO));
    }

    @Test
    void refundReturnsEntireHold() {
        User user = userWithBalance(400_000);
        RoomMember member = member(user, 100_000);
        when(userRepository.findByIdForUpdate(user.getId())).thenReturn(Optional.of(user));

        BigDecimal refunded = walletService.refund(member);

        assertEquals(0, refunded.compareTo(BigDecimal.valueOf(100_000)));
        assertEquals(0, user.getWalletBalance().compareTo(BigDecimal.valueOf(500_000)));
        assertEquals(0, member.getAmountHeld().compareTo(BigDecimal.ZERO));
    }

    private User userWithBalance(long balance) {
        return User.builder()
                .id(UUID.randomUUID())
                .fullName("Demo rider")
                .phone(UUID.randomUUID().toString())
                .walletBalance(BigDecimal.valueOf(balance))
                .build();
    }

    private RoomMember member(User user, long held) {
        return RoomMember.builder()
                .userId(user.getId())
                .amountHeld(BigDecimal.valueOf(held))
                .build();
    }
}
