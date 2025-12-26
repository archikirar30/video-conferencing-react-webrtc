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
  setParticipants,
  setRemoteMuted
}) {
  useEffect(() => {
    if (!joined) return;

    // ---- JOIN ROOM ----
    socket.emit("join-room", { roomId, username });

    // ---- HANDLERS ----

    const handleRoomUsers = (users) => {
      console.log("👥 Room users:", users);
      setParticipants(users);
    };

    const handleUserJoined = async ({ id, username }) => {
      console.log("➕ User joined:", username);

      const pc = createPC({
        localStream: streamRef.current,
        remoteVideoRef,
        socket,
        roomId
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("offer", { roomId, offer, username });
    };

    const handleUserMic = async ({ username, muted }) => {
      console.log("🎤 Remote mic:", username, muted);
      setRemoteMuted(muted);
    }

    const handleOffer = async ({ offer, username }) => {
      console.log("📨 Offer from:", username);

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
    };

    const handleAnswer = async ({ answer }) => {
      console.log("📨 Answer received");
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(answer);
    };

    const handleIceCandidate = async (candidate) => {
      if (!candidate || !pcRef.current) return;
      await pcRef.current.addIceCandidate(candidate);
    };

    const handleUserLeft = ({ id, username }) => {
      console.log("👋 User left:", username);

      setParticipants(prev =>
        prev.filter(user => user.id !== id)
      );

      if (remoteVideoRef.current) {
        remoteVideoRef.current.pause();
        remoteVideoRef.current.srcObject = null;
      }

      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };

    // ---- REGISTER LISTENERS ----
    socket.on("room-users", handleRoomUsers);
    socket.on("user-joined", handleUserJoined);
    socket.on("remote-mic-toggle", handleUserMic);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("user-left", handleUserLeft);

    // ---- CLEANUP ----
    return () => {
      socket.off("room-users", handleRoomUsers);
      socket.off("user-joined", handleUserJoined);
      socket.off("remote-mic-toggle", handleUserMic);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("user-left", handleUserLeft);

      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, [joined, roomId, username]);
}
