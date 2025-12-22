// src/webrtc/peer.js

export function createPeerConnection({
  localStream,
  remoteVideoRef,
  socket,
  roomId
}) {
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }
    ]
  });

  // Add local tracks
  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });

  // Remote stream
  pc.ontrack = (event) => {
    console.log("📺 Remote track received");
    remoteVideoRef.current.srcObject = event.streams[0];
  };

  // ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", {
        roomId,
        candidate: event.candidate
      });
    }
  };

  return pc;
}
