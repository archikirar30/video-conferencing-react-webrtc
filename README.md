# 🎥 PeerMeet — Real-Time Video Conferencing App (WebRTC + React)

PeerMeet is a real-time, peer-to-peer video conferencing web application built using **WebRTC**, **React**, and **Socket.IO**.  
It enables users to join rooms, communicate via video/audio, see participant names, and manage mute/unmute and camera states — similar to Google Meet at a basic level.

---

## 🚀 Features

- 🔗 Peer-to-peer video & audio communication using WebRTC
- 🏠 Room-based video calling
- 👤 Display participant usernames
- 🎙️ Mute / Unmute audio with live indicator
- 📷 Camera On / Off support
- 🔄 Real-time signaling with Socket.IO
- 🌐 Cross-platform browser support
- 🧠 Clean React hooks–based architecture

---

## 🛠️ Tech Stack

**Frontend**
- React.js
- WebRTC APIs
- Socket.IO Client
- CSS (custom UI)

**Backend**
- Node.js
- Express.js
- Socket.IO

**Networking**
- STUN / TURN Servers
- Optional Ngrok for local testing

---

## Project Structure
video-conferencing-react-webrtc/
```bash
│
├── client/                          # Frontend (React)
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── assets/                  # Icons, images (optional)
│   │
│   │   ├── components/              # Reusable UI components
│   │   │   ├── VideoTile.jsx
│   │   │   ├── Controls.jsx
│   │   │   └── JoinRoom.jsx
│   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useMediaStream.jsx   # Camera & mic handling
│   │   │   ├── usePeerConnection.jsx# RTCPeerConnection logic
│   │   │   └── useSocketRoom.jsx    # Socket.IO signaling
│   │
│   │   ├── services/
│   │   │   └── socket.js            # Socket.IO client setup
│   │
│   │   ├── webrtc/
│   │   │   └── peer.js              # WebRTC peer configuration
│   │
│   │   ├── styles/
│   │   │   └── App.css              # Global styles
│   │
│   │   ├── App.jsx                  # Main application
│   │   └── main.jsx                 # React entry point
│   │
│   ├── .env                         # Frontend env vars
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Backend (Node + Socket.IO)
│   ├── index.js                     # Socket.IO server
│   ├── rooms.js                     # Room management logic
│   ├── package.json
│   └── .env                         # Backend env vars
│
├── .gitignore
├── README.md
└── package-lock.json

```
---
## Backend Setup

**📦 Prerequisites**
```bash
Node.js v16 or higher

npm or yarn
```

**📥 Install Dependencies**
```bash
cd server
npm install
```

**Dependencies used:**
```bash
express – basic HTTP server

socket.io – real-time signaling

cors – allow frontend connections
```

**Environment Variables** 

Create a .env file inside the server folder:
```bash

PORT=3000
```
You can change the port if required.

**▶️ Start the Backend Server**
```bash
node index.js
or (if using nodemon)
```

**Expected output:**
```bash
🚀 Signaling server running on port 3000

🌐 Expose Backend for Cross-Network Testing (Ngrok)
```

If frontend and backend are on different networks, expose the backend using ngrok:
```bash
ngrok http 3000
```

You will get a public URL like:
```bash
https://abcd-12-34-56.ngrok-free.app
```

Use this URL in the frontend socket configuration.

---
## Frontend Setup

**Install Dependencies**
```bash
cd client
npm install
```

**Environmnet Variables(client/.env)** 
```bash
VITE_BACKEND_URL=https://your-backend-url.ngrok.app

VITE_TURN_USERNAME=your_metered_username
VITE_TURN_CREDENTIAL=your_metered_credential
```

**WebRTC Configuration**
ICE servers are configured in:
```bash
src/webrtc/peer.js
```
Includes:
- STUN server for IP discovery

- TURN server (Metered) for NAT traversal
```bash
iceServers: [
  { urls: "stun:stun.relay.metered.ca:80" },
  {
    urls: "turn:in.relay.metered.ca:80",
    username: import.meta.env.VITE_TURN_USERNAME,
    credential: import.meta.env.VITE_TURN_CREDENTIAL,
  }
]
```
---
## 📌 Future Improvements

- Multi-user support (grid layout)
- Screen sharing
- Chat messaging
- Recording support
- Authentication
- Production deployment

---
## 👩‍💻 Author

Archi Kirar
UI Frontend / Full Stack Developer
🔗GitHub:https://github.com/archikirar30
