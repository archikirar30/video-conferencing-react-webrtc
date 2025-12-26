const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 🔑 Room state
const rooms = {};

io.on("connection", (socket) => {
  console.log("🔌 Connected:", socket.id);

  // ---------------- JOIN ROOM ----------------
  socket.on("join-room", ({ roomId, username }) => {
    if (!roomId || !username) return;

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.username = username;

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    rooms[roomId].push({
      id: socket.id,
      username
    });

    console.log(`👥 ${username} joined ${roomId}`);

    // Send full list to everyone
    io.to(roomId).emit("room-users", rooms[roomId]);

    // Notify others (not self)
    socket.to(roomId).emit("user-joined", {
      id: socket.id,
      username
    });
  });

  // ---------------- OFFER ----------------
  socket.on("offer", ({ roomId, offer, username }) => {
    socket.to(roomId).emit("offer", { offer, username });
  });

  // ---------------- ANSWER ----------------
  socket.on("answer", ({ roomId, answer, username }) => {
    socket.to(roomId).emit("answer", { answer, username });
  });

  // ---------------- ICE ----------------
  socket.on("ice-candidate", ({ roomId, candidate }) => {
    if (!candidate) return;
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  // ---------------- LEAVE ROOM ----------------
  socket.on("leave-room", () => {
    handleLeave(socket);
  });

  // ---------------- DISCONNECT ----------------
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
    handleLeave(socket);
  });
});

// ---------------- LEAVE HANDLER ----------------
function handleLeave(socket) {
  const { roomId, username } = socket.data;
  if (!roomId) return;

  console.log(`🚪 ${username} left ${roomId}`);

  // Remove user from room state
  rooms[roomId] = rooms[roomId]?.filter(
    user => user.id !== socket.id
  );

  // Notify others
  socket.to(roomId).emit("user-left", {
    id: socket.id,
    username
  });

  // Update user list
  io.to(roomId).emit("room-users", rooms[roomId]);

  socket.leave(roomId);

  // Cleanup empty room
  if (rooms[roomId]?.length === 0) {
    delete rooms[roomId];
    console.log(`🧹 Deleted empty room ${roomId}`);
  }
}

// ---------------- START SERVER ----------------
server.listen(3000, () => {
  console.log("🚀 Signaling server running on port 3000");
});
