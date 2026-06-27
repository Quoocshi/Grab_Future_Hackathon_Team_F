package com.hubride.common.exception;

public class RoomExpiredException extends AppException {
    public RoomExpiredException() {
        super(ErrorCode.ROOM_EXPIRED);
    }
}
