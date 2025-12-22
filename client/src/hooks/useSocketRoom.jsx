import { useEffect } from "react";

export function useSocketRoom({
  socket,
  roomId,
  joined,
  streamRef,
  remoteVideoRef,
  createPC,
  pcRef
}) {
  useEffect(() => {
    if (!joined) return;

    socket.emit("join-room", roomId);

    socket.on("user-joined", async () => {
      const pc = createPC({
        localStream: streamRef.current,
        remoteVideoRef,
        socket,
        roomId
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("offer", { roomId, offer });
    });

    socket.on("offer", async (offer) => {
      const pc = createPC({
        localStream: streamRef.current,
        remoteVideoRef,
        socket,
        roomId
      });

      await pc.setRemoteDescription(offer);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer", { roomId, answer });
    });

    socket.on("answer", async (answer) => {
      await pcRef.current.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", async (candidate) => {
      if (!candidate) return; // 👈 REQUIRED

      try {
        await pcRef.current.addIceCandidate(candidate);
      } catch (err) {
        console.warn("ICE add failed", err);
      }
    });

    socket.on("user-left", () => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      pcRef.current?.close();
      pcRef.current = null;
    });

    return () => socket.removeAllListeners();
  }, [joined]);
}
