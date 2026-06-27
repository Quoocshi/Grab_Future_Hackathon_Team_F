package com.hubride.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // Room errors
    ROOM_NOT_FOUND("Room not found"),
    ROUTE_TOO_SHORT("Quãng đường phải ≥ 2km. Bạn nên đi bộ hoặc xe đạp."),
    ROOM_NOT_OPEN("Room is not open for joining"),
    USER_ALREADY_IN_ROOM("User is already in this room"),
    USER_NOT_IN_ROOM("User is not a member of this room"),
    ONLY_HOST_CAN_CANCEL("Only the host can cancel the room"),
    ROOM_ALREADY_DISPATCHED("Room has already been dispatched"),
    ROOM_EXPIRED("Room expired because fewer than 2 riders joined"),
    ROOM_COUNTDOWN_ACTIVE("Room countdown is still active"),
    ROOM_COUNTDOWN_FINISHED("Room countdown has finished and members are locked"),

    // Address errors
    ADDRESS_NOT_FOUND("Address not found"),

    // User errors
    USER_NOT_FOUND("User not found"),
    INSUFFICIENT_BALANCE("Insufficient wallet balance for the 100,000 VND pre-pay hold"),

    // Dispatch errors
    DISPATCH_FAILED("Dispatch failed — no available partners"),

    // Generic
    BAD_REQUEST("Bad request"),
    INTERNAL_ERROR("Internal server error");

    private final String message;
}
