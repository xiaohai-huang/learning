export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  answer: (answer: RTCSessionDescriptionInit) => void;
  icecandidate: (candidate: RTCIceCandidate | null | undefined) => void;
  offer: (offer: RTCSessionDescriptionInit) => void;
  joined: () => void;
}

export interface ClientToServerEvents {
  icecandidate: (
    roomId: string,
    candidate: RTCIceCandidate | null | undefined
  ) => void;
  offer: (roomId: string, offer: RTCSessionDescriptionInit) => void;
  answer: (roomId: string, answer: RTCSessionDescriptionInit) => void;
  "join-room": (roomId: string) => void;
}
