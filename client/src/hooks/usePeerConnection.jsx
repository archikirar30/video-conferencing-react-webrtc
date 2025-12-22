import { useRef } from "react";
import { createPeerConnection } from "../webrtc/peer";

export function usePeerConnection() {
  const pcRef = useRef(null);

  const createPC = ({ localStream, remoteVideoRef, socket, roomId }) => {
    pcRef.current = createPeerConnection({
      localStream,
      remoteVideoRef,
      socket,
      roomId
    });
    return pcRef.current;
  };

  const closePC = () => {
    if (!pcRef.current) return;
    pcRef.current.close();
    pcRef.current = null;
  };

  return {
    pcRef,
    createPC,
    closePC
  };
}
