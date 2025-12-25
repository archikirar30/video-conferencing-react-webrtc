import { useEffect } from "react";

export function useSocketRoom({
  socket,
  roomId,
  username,
  joined,
  streamRef,
  remoteVideoRef,
  createPC,
  pcRef,
  setRemoteUserName
}) {
  useEffect(() => {
  if (!joined) return;

  socket.emit("join-room", { roomId, username });

  // 🟢 Existing user
  socket.on("user-joined", async ({ username }) => {
    setRemoteUserName(prev => prev ?? username);

    const pc = createPC({
      localStream: streamRef.current,
      remoteVideoRef,
      socket,
      roomId
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("offer", { roomId, offer, username });
  });

  // 🟢 New user
  socket.on("offer", async ({ offer, username}) => {
    setRemoteUserName(prev => prev ?? username);

    const pc = createPC({
      localStream: streamRef.current,
      remoteVideoRef,
      socket,
      roomId
    });

    await pc.setRemoteDescription(offer);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answer", { roomId, answer, username });
  });

  socket.on("answer", async ({ answer }) => {
    await pcRef.current.setRemoteDescription(answer);
  });

  socket.on("ice-candidate", async (candidate) => {
    if (!candidate) return;
    await pcRef.current.addIceCandidate(candidate);
  });

  socket.on("user-left", () => {
    setRemoteUserName(null);

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  });

  return () => {
    socket.removeAllListeners();
  };
}, [joined]);

}
