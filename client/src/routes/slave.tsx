import { useEffect, useRef } from "react";
import { useParams } from "react-router";

import { WEBRTC_CONNECTION_CONFIG } from "../api/WEBRTC_CONFIG";
import useSocket from "../hooks/useSocket";

function Slave() {
  const { roomId = "default-room" } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const socket = useSocket(roomId);

  useEffect(() => {
    const connection = new RTCPeerConnection(WEBRTC_CONNECTION_CONFIG);
    // @ts-ignore
    window.slave = connection;
    // send the ICE candidates to everyone in the room
    connection.onicecandidate = ({ candidate }) => {
      socket?.emit("icecandidate", roomId, candidate);
    };

    // setup event handlers
    socket?.on("icecandidate", (candidate) => {
      if (candidate) connection.addIceCandidate(candidate);
    });

    socket?.on("offer", async (offer) => {
      await connection.setRemoteDescription(offer);

      // create the answer
      const answer = await connection.createAnswer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true,
      });
      connection.setLocalDescription(answer);

      // send the answer to master
      socket.emit("answer", roomId, answer);
    });

    connection.ontrack = (e) => {
      console.log("streams ontrack", e.streams);
      console.log(e.streams[0].getTracks());

      if (videoRef.current) videoRef.current.srcObject = e.streams[0];
    };
  }, [socket, roomId]);

  return (
    <main>
      <video ref={videoRef} autoPlay playsInline controls />
    </main>
  );
}

export default Slave;
