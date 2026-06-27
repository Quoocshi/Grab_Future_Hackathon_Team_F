package com.hubride.module.room.controller;

import com.hubride.common.response.ApiResponse;
import com.hubride.module.room.dto.*;
import com.hubride.module.room.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@Tag(name = "Rooms", description = "Room management (host, join, browse)")
@CrossOrigin(origins = "*")
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    @Operation(summary = "Host creates a new room")
    public ResponseEntity<ApiResponse<CreateRoomResponse>> createRoom(
            @Valid @RequestBody CreateRoomRequest request) {
        CreateRoomResponse response = roomService.createRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Room created"));
    }

    @GetMapping
    @Operation(summary = "Search nearby open rooms")
    public ResponseEntity<ApiResponse<List<RoomListItem>>> searchRooms(
            @RequestParam double originLat,
            @RequestParam double originLng,
            @RequestParam double destLat,
            @RequestParam double destLng,
            @RequestParam(required = false) UUID excludeUserId) {
        return ResponseEntity.ok(ApiResponse.ok(
                roomService.searchNearbyRooms(originLat, originLng, destLat, destLng, excludeUserId)));
    }

    @GetMapping("/{roomId}")
    @Operation(summary = "Get room detail")
    public ResponseEntity<ApiResponse<RoomDetailResponse>> getRoomDetail(@PathVariable UUID roomId) {
        return ResponseEntity.ok(ApiResponse.ok(roomService.getRoomDetail(roomId)));
    }

    @PostMapping("/{roomId}/join")
    @Operation(summary = "User joins a room")
    public ResponseEntity<ApiResponse<JoinRoomResponse>> joinRoom(
            @PathVariable UUID roomId,
            @Valid @RequestBody JoinRoomRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(roomService.joinRoom(roomId, request.getUserId())));
    }

    @PostMapping("/{roomId}/cancel")
    @Operation(summary = "Host cancels a room")
    public ResponseEntity<ApiResponse<Void>> cancelRoom(
            @PathVariable UUID roomId,
            @RequestParam UUID userId) {
        roomService.cancelRoom(roomId, userId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Room cancelled"));
    }
}
