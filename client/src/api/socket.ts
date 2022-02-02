import { io, Socket } from "socket.io-client";
import { SERVER_ADDRESS } from "../config";
import { ClientToServerEvents, ServerToClientEvents } from "../types/socket.io";

let socket: Socket<ServerToClientEvents, ClientToServerEvents>;

export const initiateSocket = (roomId: string) => {
  socket = io(SERVER_ADDRESS);
  socket.emit("join-room", roomId);
  return socket;
};

export const disconnectSocket = () => {
  console.log("Disconnecting socket...");
  socket.disconnect();
};

export const getSocket = () => {
  return socket;
};
