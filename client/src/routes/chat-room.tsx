import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { WEBRTC_CONNECTION_CONFIG } from "../api/WEBRTC_CONFIG";
import useSocket from "../hooks/useSocket";

import "./chat-room.scss";

const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

const mediaConstraints = {
  audio: true,
  video: true,
};

function ChatRoom() {
  const { roomId = "default-room" } = useParams();
  const socket = useSocket(roomId);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const firstCameraRef = useRef<HTMLVideoElement>(null);
  const secondCameraRef = useRef<HTMLVideoElement>(null);

  const firstScreenRef = useRef<HTMLVideoElement>(null);
  const secondScreenRef = useRef<HTMLVideoElement>(null);
  const [isShareScreen, setIsShareScreen] = useState(false);

  useEffect(() => {
    if (socket) {
      console.log("run");

      invite();
      socket.on("offer", async (offer) => {
        createPeerConnection();
        const connection = pcRef.current;
        if (connection) {
          connection.setRemoteDescription(offer);
          const localStream = await navigator.mediaDevices.getUserMedia(
            mediaConstraints
          );
          firstCameraRef.current &&
            (firstCameraRef.current.srcObject = localStream);

          // send stream back to the initiator
          localStream
            .getTracks()
            .forEach((track) => connection.addTrack(track, localStream));

          // create answer
          const answer = await connection.createAnswer();
          connection.setLocalDescription(answer);

          // send the answer to the server
          socket.emit("answer", roomId, answer);
        }
      });

      socket.on("answer", (answer) => {
        pcRef.current?.setRemoteDescription(answer);
      });

      socket.on("icecandidate", (candidate) => {
        candidate && pcRef.current?.addIceCandidate(candidate);
      });
    }
    return () => {
      console.log("clean up");

      socket?.removeAllListeners();
      closeVideoCall();
    };
    // eslint-disable-next-line
  }, [socket]);

  async function invite() {
    createPeerConnection();
    try {
      const localStream = await navigator.mediaDevices.getUserMedia(
        mediaConstraints
      );

      if (firstCameraRef.current)
        firstCameraRef.current.srcObject = localStream;
      // add stream to connection
      localStream
        .getTracks()
        .forEach((track) => pcRef.current?.addTrack(track, localStream));
    } catch (err) {
      handleGetUserMediaError(err as Error);
    }
  }

  function createPeerConnection() {
    pcRef.current = new RTCPeerConnection(WEBRTC_CONNECTION_CONFIG);
    const connection = pcRef.current;
    connection.onicecandidate = handleICECandidateEvent;
    connection.ontrack = handleTrackEvent;
    connection.onnegotiationneeded = handleNegotiationNeededEvent;
    connection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
    // @ts-ignore
    connection.onremovetrack = handleRemoveTrackEvent;
  }

  function handleICECandidateEvent(e: RTCPeerConnectionIceEvent) {
    if (e.candidate) {
      socket?.emit("icecandidate", roomId, e.candidate);
    }
  }

  function handleTrackEvent(e: RTCTrackEvent) {
    secondCameraRef.current &&
      (secondCameraRef.current.srcObject = e.streams[0]);
  }

  function handleRemoveTrackEvent() {
    const stream = secondCameraRef.current?.srcObject as MediaStream;
    if (stream && stream.getTracks().length === 0) {
      closeVideoCall();
    }
  }

  async function handleNegotiationNeededEvent() {
    const connection = pcRef.current;
    if (connection) {
      const offer = await connection.createOffer(offerOptions);
      await connection.setLocalDescription(offer);

      // send to peer
      socket?.emit("offer", roomId, offer);
    }
  }

  function handleICEConnectionStateChangeEvent() {
    if (pcRef.current?.iceConnectionState === "failed") {
      closeVideoCall();
    }
  }

  function handleGetUserMediaError(e: Error) {
    switch (e.name) {
      case "NotFoundError":
        alert(
          "Unable to open your call because no camera and/or microphone" +
            "were found."
        );
        break;
      case "SecurityError":
      case "PermissionDeniedError":
        // Do nothing; this is the same as the user canceling the call.
        break;
      default:
        alert("Error opening your camera and/or microphone: " + e.message);
        break;
    }

    closeVideoCall();
  }

  function closeVideoCall() {
    const connection = pcRef.current;
    if (connection) {
      connection.ontrack = null;
      // @ts-ignore
      connection.onremovetrack = null;
      connection.onicecandidate = null;
      connection.onnegotiationneeded = null;

      if (secondCameraRef.current?.srcObject) {
        (secondCameraRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (firstCameraRef.current?.srcObject) {
        (firstCameraRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }

      connection.close();
      pcRef.current = null;
    }
    firstCameraRef.current?.removeAttribute("src");
    firstCameraRef.current?.removeAttribute("srcObject");

    secondCameraRef.current?.removeAttribute("src");
    secondCameraRef.current?.removeAttribute("srcObject");
  }
  return (
    <main className="chat-room">
      <h1 style={{ textAlign: "center", marginTop: "1rem" }}>
        Chat Room: {roomId}
      </h1>
      <div className="cameras">
        <h2>Cameras</h2>
        <video ref={firstCameraRef} autoPlay playsInline muted />
        <video ref={secondCameraRef} autoPlay playsInline />
      </div>
      <div style={{ marginTop: "30px" }} />
      <button onClick={() => setIsShareScreen((prev) => !prev)}>
        {!isShareScreen ? "Share Screen" : "Stop Screen Sharing"}
      </button>
      {isShareScreen && (
        <div className="screens">
          <h2>Screens</h2>
          <video ref={firstScreenRef} autoPlay playsInline />
          <video ref={secondScreenRef} autoPlay playsInline />
        </div>
      )}
    </main>
  );
}

export default ChatRoom;
