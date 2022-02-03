import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { WEBRTC_CONNECTION_CONFIG } from "../api/WEBRTC_CONFIG";

import useSocket from "../hooks/useSocket";

function Master() {
  const { roomId = "default-room" } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const socket = useSocket(roomId);

  const [status, setStatus] = useState({ camera: false, screen: false });
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [connection, setConnection] = useState<RTCPeerConnection | null>(null);
  const [videoSender, setVideoSender] = useState<RTCRtpSender | null>(null);
  const [audioSender, setAudioSender] = useState<RTCRtpSender | null>(null);

  const [connecting, setConnecting] = useState(false);

  const onShareScreen = async () => {
    setStatus({ camera: false, screen: true });
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    setLocalStream(stream);
  };

  const onShareCamera = async () => {
    setStatus({ camera: true, screen: false });
    // Requesting local stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
    } catch (err: any) {
      alert(`getUserMedia() error: ${err.name}`);
    }
  };

  const onStartConnection = async () => {
    setConnecting(true);
    const pc = new RTCPeerConnection(WEBRTC_CONNECTION_CONFIG);
    setConnection(pc);
    // send the ICE candidates to the person in the room
    pc.onicecandidate = ({ candidate }) => {
      socket?.emit("icecandidate", roomId, candidate);
    };
    socket?.on("icecandidate", (candidate) => {
      if (candidate && pc.connectionState !== "closed") {
        pc?.addIceCandidate(candidate);
      }
    });
    socket?.on("answer", (asnwer) => {
      if (pc.connectionState !== "closed") pc?.setRemoteDescription(asnwer);
    });

    // specify the data to be sent to peer
    if (localStream) {
      setVideoSender(pc.addTrack(localStream.getVideoTracks()[0], localStream));
      setAudioSender(pc.addTrack(localStream.getAudioTracks()[0], localStream));
    }

    // create the offer - sdp
    const offerOptions = {
      offerToReceiveVideo: true,
      offerToReceiveAudio: true,
    };
    const offer = await pc.createOffer(offerOptions);
    await pc.setLocalDescription(offer);

    // send the offer - sdp to the person in the room
    socket?.emit("offer", roomId, offer);
  };

  const onCloseConnection = () => {
    setConnecting(false);
    connection?.close();
    setConnection(null);
    socket?.removeListener("icecandidate");
    socket?.removeListener("answer");
  };

  useEffect(() => {
    socket?.on("joined", () => {
      onCloseConnection();
      onStartConnection();
    });
    return () => {
      socket?.removeListener("joined");
    };
    // eslint-disable-next-line
  }, [connection, socket]);

  // enable switch between screen and camera
  useEffect(() => {
    // @ts-ignore
    if (videoRef.current && videoRef.current.srcObject?.id !== localStream?.id)
      videoRef.current.srcObject = localStream;
    const videoTrack = localStream?.getVideoTracks()[0];
    const audioTrack = localStream?.getAudioTracks()[0];
    if (videoSender && videoTrack) videoSender.replaceTrack(videoTrack);
    if (audioSender && audioTrack) audioSender.replaceTrack(audioTrack);
  }, [audioSender, localStream, videoSender]);

  return (
    <main>
      <section style={{ width: "100%", height: "500px" }}>
        <video
          style={{ backgroundColor: "gray", width: "100%", height: "100%" }}
          ref={videoRef}
          autoPlay
          playsInline
          muted
        />
      </section>
      <button disabled={status.screen} onClick={onShareScreen}>
        Share Screen
      </button>
      <button disabled={status.camera} onClick={onShareCamera}>
        Share Camera
      </button>
      <button onClick={onStartConnection} disabled={!localStream || connecting}>
        Start Connection
      </button>
      <button onClick={onCloseConnection} disabled={!connection || !connecting}>
        Close Connection
      </button>
    </main>
  );
}

export default Master;
