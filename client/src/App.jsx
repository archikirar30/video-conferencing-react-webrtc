import { useEffect, useRef, useState } from "react";
import { socket } from "./services/socket";
import { useMediaStream } from "./hooks/useMediaStream";
import { usePeerConnection } from "./hooks/usePeerConnection";
import { useSocketRoom } from "./hooks/useSocketRoom";

import { BsCameraVideoOffFill, BsCameraVideoFill, BsFillMicMuteFill, BsFillMicFill } from "react-icons/bs";
import { MdCallEnd } from "react-icons/md";
import "./App.css"

function App() {
  // UI + room state
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [username, setUserName] = useState("");
  const [remoteUserName, setRemoteUserName] = useState(null)
  const [participants, setParticipants] = useState([]);


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
    username,
    joined,
    streamRef,
    remoteVideoRef,
    createPC,
    pcRef,
    setRemoteUserName,
    setParticipants
  });

  // Join room
  const joinCall = async () => {
    if (!roomId) return alert("Enter room ID");
    await startMedia();
    setJoined(true);
  };

  // Leave call
  const leaveCall = () => {
    socket.emit("leave-room", { roomId });

    stopMedia();
    closePC();

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setRemoteUserName(null); // 👈 THIS FIXES STUCK NAME
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
          <input
            placeholder="Enter UserName"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
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
            {/* Remote */}
            <div className="video-tile remote-tile">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="video"
              />
              {remoteUserName && (
                <div className="name-tag">{remoteUserName}</div>
              )}
            </div>

            {/* Local */}
            <div className="video-tile local-tile">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="video"
              />
              <div className="name-tag you">{username} (You)</div>
            </div>
          </div>
          <div className="controls">
            <button onClick={toggleMute}>
              {isMuted ? <BsFillMicMuteFill /> : <BsFillMicFill />}
            </button>

            <button onClick={toggleCamera}>
              {isCameraOff ? <BsCameraVideoOffFill /> : <BsCameraVideoFill />}
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
