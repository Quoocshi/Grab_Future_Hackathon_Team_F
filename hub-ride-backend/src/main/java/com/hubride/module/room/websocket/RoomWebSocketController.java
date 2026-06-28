package com.hubride.module.room.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class RoomWebSocketController {

    public record WsEvent(String event, Object payload) {}

    @MessageMapping("/room/{roomId}/join")
    @SendTo("/topic/room/{roomId}")
    public WsEvent onJoin(@DestinationVariable String roomId, Object payload) {
        log.debug("WS join event for room {}: {}", roomId, payload);
        return new WsEvent("JOIN", payload);
    }

    @MessageMapping("/room/{roomId}/leave")
    @SendTo("/topic/room/{roomId}")
    public WsEvent onLeave(@DestinationVariable String roomId, Object payload) {
        log.debug("WS leave event for room {}: {}", roomId, payload);
        return new WsEvent("LEAVE", payload);
    }
}
