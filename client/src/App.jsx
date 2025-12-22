import { useEffect, useRef, useState } from "react";
import { socket } from "./services/socket";
import { createPeerConnection } from "./webrtc/peer";

function App() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);


  // Step 1: Get camera
  useEffect(() => {
    if (!joined) return;

    async function initMedia() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      localVideoRef.current.srcObject = stream;

      socket.emit("join-room", roomId);
    }

    initMedia();
  }, [joined]);

  // Step 2: Socket events
  useEffect(() => {
    if (!joined) return;

    socket.on("user-joined", async () => {
      console.log("👤 User joined");

      peerConnectionRef.current = createPeerConnection({
        localStream: localStreamRef.current,
        remoteVideoRef,
        socket,
        roomId
      });

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      socket.emit("offer", { roomId, offer });
    });

    socket.on("offer", async (offer) => {
      console.log("📨 Offer received");

      peerConnectionRef.current = createPeerConnection({
        localStream: localStreamRef.current,
        remoteVideoRef,
        socket,
        roomId
      });

      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      socket.emit("answer", { roomId, answer });
    });

    socket.on("answer", async (answer) => {
      console.log("📨 Answer received");

      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on("ice-candidate", async (candidate) => {
      console.log("❄ ICE candidate");

      await peerConnectionRef.current.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    });

    socket.on("user-left", () => {
      console.log("👋 Remote user left");

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    });


    return () => socket.removeAllListeners();
  }, [joined]);

  const toggleMute = () => {
    if (!localStreamRef.current) return;

    localStreamRef.current.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });

    setIsMuted(prev => !prev);
  };

  const toggleCamera = () => {
    if (!localStreamRef.current) return;

    localStreamRef.current.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });

    setIsCameraOff(prev => !prev);
  };

  const leaveCall = () => {
    console.log("🚪 Leaving call");

    // 1. Stop local media
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // 2. Close PeerConnection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // 3. Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // 4. Inform server
    socket.emit("leave-room", roomId);

    // 5. Reset UI state
    setJoined(false);
    setIsMuted(false);
    setIsCameraOff(false);
  };




  return (
    <div>
      {!joined && (
        <>
          <input
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={() => setJoined(true)}>Join</button>
        </>
      )}

      {joined && (
        <>
          <video ref={localVideoRef} autoPlay muted playsInline />
          <video ref={remoteVideoRef} autoPlay playsInline />
          <div style={{ marginTop: 10 }}>
            <button onClick={toggleMute}>
              {isMuted ? "Unmute 🎤" : "Mute 🔇"}
            </button>

            <button onClick={toggleCamera}>
              {isCameraOff ? "Camera ON 📷" : "Camera OFF 🚫"}
            </button>
            <button
              onClick={leaveCall}
              style={{ background: "red", color: "white", marginLeft: 10 }}
            >
              Leave Call ❌
            </button>

          </div>

        </>
      )}

    </div>
  );
}

export default App;
