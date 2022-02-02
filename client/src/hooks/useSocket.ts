import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

import { disconnectSocket, initiateSocket } from "../api/socket";
import { ClientToServerEvents, ServerToClientEvents } from "../types/socket.io";

function useSocket(roomId: string) {
  const [socket, setSocket] =
    useState<Socket<ServerToClientEvents, ClientToServerEvents>>();

  useEffect(() => {
    const newSocket = initiateSocket(roomId);
    setSocket(newSocket);
    return () => {
      disconnectSocket();
    };
  }, [roomId]);

  return socket;
}

export default useSocket;
