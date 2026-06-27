import { requestJson } from "@/lib/api-client";
import type {
  CreateRoomRequest,
  CreateRoomResponse,
  DispatchResult,
  JoinRoomResponse,
  RefundResponse,
  RoomDetail,
  RoomListItem,
} from "@/types/room";

type SearchRoomsParams = {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  excludeUserId?: string;
};

export function createRoom(payload: CreateRoomRequest) {
  return requestJson<CreateRoomResponse>("/rooms", {
    init: {
      method: "POST",
      body: JSON.stringify(payload),
    },
  });
}

export function searchRooms(params: SearchRoomsParams) {
  const query = new URLSearchParams({
    originLat: String(params.originLat),
    originLng: String(params.originLng),
    destLat: String(params.destLat),
    destLng: String(params.destLng),
  });
  if (params.excludeUserId) query.set("excludeUserId", params.excludeUserId);
  return requestJson<RoomListItem[]>(`/rooms?${query.toString()}`);
}

export function getRoom(roomId: string) {
  return requestJson<RoomDetail>(`/rooms/${roomId}`);
}

export function joinRoom(roomId: string, userId: string) {
  return requestJson<JoinRoomResponse>(`/rooms/${roomId}/join`, {
    init: {
      method: "POST",
      body: JSON.stringify({ userId }),
    },
  });
}

export function dispatchRoom(roomId: string) {
  return requestJson<DispatchResult>(`/rooms/${roomId}/dispatch`, {
    init: { method: "POST" },
  });
}

export function cancelRoom(roomId: string, userId: string) {
  return requestJson<RefundResponse>(`/rooms/${roomId}/cancel?userId=${userId}`, {
    init: { method: "POST" },
  });
}

export function leaveRoom(roomId: string, userId: string) {
  return requestJson<RefundResponse>(`/rooms/${roomId}/members/${userId}`, {
    init: { method: "DELETE" },
  });
}
