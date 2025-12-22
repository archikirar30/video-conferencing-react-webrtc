import { useEffect, useRef, useState } from "react";
import { socket } from "./services/socket";
import { useMediaStream } from "./hooks/useMediaStream";
import { usePeerConnection } from "./hooks/usePeerConnection";
import { useSocketRoom } from "./hooks/useSocketRoom";

import { BsCameraVideoOffFill,BsCameraVideoFill,BsFillMicMuteFill,BsFillMicFill } from "react-icons/bs";
import { MdCallEnd } from "react-icons/md";
import "./App.css"

function App() {
  // UI + room state
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);

  // Video refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Media hook
  const {
    streamRef,
    startMedia,
    stopMedia,
    toggleMute,
    toggleCamera,
    isMuted,
    isCameraOff
  } = useMediaStream();

  // Peer hook
  const { pcRef, createPC, closePC } = usePeerConnection();

  // Socket signaling hook
  useSocketRoom({
    socket,
    roomId,
    joined,
    streamRef,
    remoteVideoRef,
    createPC,
    pcRef
  });

  // Join room
  const joinCall = async () => {
    if (!roomId) return alert("Enter room ID");
    await startMedia();
    setJoined(true);
  };

  // Leave call
  const leaveCall = () => {
    stopMedia();
    closePC();

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    socket.emit("leave-room", roomId);
    setJoined(false);
  };

  // Attach local stream AFTER video renders
  useEffect(() => {
    if (!joined) return;
    if (!localVideoRef.current) return;
    if (!streamRef.current) return;

    localVideoRef.current.srcObject = streamRef.current;
  }, [joined]);

  return (
    <div className="app">
      {!joined && (
        <div className="join-container">
          <h2>Join Video Room</h2>
          <input
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button className="primary" onClick={joinCall}>
            Join
          </button>
        </div>
      )}

      {joined && (
        <>
          <header className="header">
            <span>Room: {roomId}</span>
          </header>

          <div className="video-container">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="remote-video"
            />

            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="local-video"
            />
          </div>

          <div className="controls">
            <button onClick={toggleMute}>
              {isMuted ? <BsFillMicMuteFill /> : <BsFillMicFill/> }
            </button>

            <button onClick={toggleCamera}>
              {isCameraOff ? <BsCameraVideoOffFill  /> : <BsCameraVideoFill />}
            </button>

            <button className="danger" onClick={leaveCall}>
              <MdCallEnd />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
