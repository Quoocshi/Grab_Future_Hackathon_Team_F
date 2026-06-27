package com.hubride.common.exception;

import com.hubride.common.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        HttpStatus status = switch (ex.getErrorCode()) {
            case ROOM_NOT_FOUND, ADDRESS_NOT_FOUND, USER_NOT_FOUND -> HttpStatus.NOT_FOUND;
            case BAD_REQUEST, ROUTE_TOO_SHORT -> HttpStatus.BAD_REQUEST;
            case ONLY_HOST_CAN_CANCEL -> HttpStatus.FORBIDDEN;
            case INSUFFICIENT_BALANCE -> HttpStatus.UNPROCESSABLE_ENTITY;
            case ROOM_NOT_OPEN, USER_ALREADY_IN_ROOM, USER_NOT_IN_ROOM,
                 ROOM_ALREADY_DISPATCHED, ROOM_EXPIRED, ROOM_COUNTDOWN_ACTIVE,
                 ROOM_COUNTDOWN_FINISHED -> HttpStatus.CONFLICT;
            case DISPATCH_FAILED -> HttpStatus.BAD_GATEWAY;
            default -> HttpStatus.INTERNAL_SERVER_ERROR;
        };
        return ResponseEntity.status(status)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .findFirst()
                .orElse("Validation failed");
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Internal server error: " + ex.getMessage()));
    }
}
