// src/webrtc/peer.js

export function createPeerConnection({
    localStream,
    remoteVideoRef,
    socket,
    roomId
}) {
    const pc = new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.relay.metered.ca:80",
            },
            {
                urls: "turn:in.relay.metered.ca:80",
                username: import.meta.env.VITE_TURN_USERNAME,
                credential:import.meta.env.VITE_TURN_CREDENTIAL,
            },
            {
                urls: "turn:in.relay.metered.ca:80?transport=tcp",
                username: import.meta.env.VITE_TURN_USERNAME,
                credential: import.meta.env.VITE_TURN_CREDENTIAL,
            },
            {
                urls: "turn:in.relay.metered.ca:443",
                username: import.meta.env.VITE_TURN_USERNAME,
                credential: import.meta.env.VITE_TURN_CREDENTIAL,
            },
            {
                urls: "turns:in.relay.metered.ca:443?transport=tcp",
                username: import.meta.env.VITE_TURN_USERNAME,
                credential: import.meta.env.VITE_TURN_CREDENTIAL,
            },
        ],
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
        if (!event.candidate) {
            // ICE gathering finished — ignore
            return;
        }

        console.log("ICE:", event.candidate.candidate);
        if (event.candidate) {
            socket.emit("ice-candidate", {
                roomId,
                candidate: event.candidate
            });
        }
    };

    return pc;
}