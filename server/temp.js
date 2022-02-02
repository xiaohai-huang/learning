import { io } from "socket.io-client";
const SERVER_ADDRESS = "http://localhost:4000";

const socket = io(SERVER_ADDRESS);

var stream;
openButton.addEventListener("click", async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });
  mainScreen.srcObject = stream;
});

startButton.addEventListener("click", async () => {
  const pc1 = new RTCPeerConnection({});
  const pc2 = new RTCPeerConnection({});
  pc1.onicecandidate = (e) => {
    socket.emit("icecandidate", e.candidate);
  };
  pc2.ontrack = (e) => {
    console.log("streams ontrack", e.streams);
    remoteScreen.srcObject = e.streams[0];
  };

  pc1.addTrack(stream.getVideoTracks()[0], stream);
  //   stream.getTracks().forEach((track) => pc1.addTrack(track, stream));

  const offerOptions = {
    offerToReceiveVideo: 1,
  };
  const offer = await pc1.createOffer(offerOptions);
  // after creating the offer - rtc session description
  await pc1.setLocalDescription(offer);

  // send the offer to the other end aka remote
  await pc2.setRemoteDescription(offer);

  // pc2 create the answer
  const answer = await pc2.createAnswer();
  pc2.setLocalDescription(answer);

  // send the answer to pc1
  await pc1.setRemoteDescription(answer);
});
