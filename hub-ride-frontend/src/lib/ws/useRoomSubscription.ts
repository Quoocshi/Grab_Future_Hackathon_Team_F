"use client";

import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { RoomEvent } from "@/types/room";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8081/ws";

export function useRoomSubscription(roomId: string | undefined, onEvent: (event: RoomEvent) => void) {
  useEffect(() => {
    if (!roomId) return;

    const client = new Client({
      reconnectDelay: 2500,
      webSocketFactory: () => new SockJS(WS_URL.replace(/^ws/, "http")),
      onConnect: () => {
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          try {
            onEvent(JSON.parse(message.body) as RoomEvent);
          } catch {
            onEvent({ event: "UNKNOWN", payload: message.body });
          }
        });
      },
    });

    client.activate();
    return () => {
      void client.deactivate();
    };
  }, [onEvent, roomId]);
}
