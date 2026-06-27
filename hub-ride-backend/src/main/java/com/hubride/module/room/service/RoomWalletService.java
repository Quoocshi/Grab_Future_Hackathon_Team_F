package com.hubride.module.room.service;

import com.hubride.common.exception.AppException;
import com.hubride.common.exception.ErrorCode;
import com.hubride.module.room.config.RoomProperties;
import com.hubride.module.room.entity.RoomMember;
import com.hubride.module.room.repository.RoomMemberRepository;
import com.hubride.module.user.entity.User;
import com.hubride.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomWalletService {

    private final UserRepository userRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final RoomProperties roomProperties;

    public BigDecimal hold(User user) {
        BigDecimal amount = roomProperties.getHoldAmount();
        if (user.getWalletBalance().compareTo(amount) < 0) {
            throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);
        }
        user.setWalletBalance(user.getWalletBalance().subtract(amount));
        userRepository.save(user);
        return amount;
    }

    public BigDecimal refund(RoomMember member) {
        BigDecimal held = safeAmount(member.getAmountHeld());
        if (held.signum() == 0) return BigDecimal.ZERO;

        User user = userRepository.findByIdForUpdate(member.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setWalletBalance(user.getWalletBalance().add(held));
        member.setAmountHeld(BigDecimal.ZERO);
        userRepository.save(user);
        roomMemberRepository.save(member);
        return held;
    }

    public BigDecimal refundAll(List<RoomMember> members) {
        return members.stream()
                .map(this::refund)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void settle(RoomMember member, BigDecimal fare) {
        BigDecimal held = safeAmount(member.getAmountHeld());
        User user = userRepository.findByIdForUpdate(member.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (held.compareTo(fare) >= 0) {
            user.setWalletBalance(user.getWalletBalance().add(held.subtract(fare)));
        } else {
            BigDecimal outstanding = fare.subtract(held);
            if (user.getWalletBalance().compareTo(outstanding) < 0) {
                throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);
            }
            user.setWalletBalance(user.getWalletBalance().subtract(outstanding));
        }

        member.setAmountHeld(BigDecimal.ZERO);
        userRepository.save(user);
        roomMemberRepository.save(member);
    }

    private BigDecimal safeAmount(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }
}
