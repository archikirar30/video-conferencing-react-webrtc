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

const rooms = {};

io.on("connection", (socket) => {

  socket.on("join-room", ({ roomId, username }) => {
    socket.data.username = username
    socket.data.id = roomId
    console.log(`User Data :${socket.data.username}`)
    socket.join(roomId);

    // create room if not exists
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    // Send existing users to new user
    // 🔹 Send existing users to the new user
    socket.emit("existing-users", rooms[roomId]);

    // 🔹 Add current user
    rooms[roomId].push({
      id: socket.id,
      username
    });

    socket.to(roomId).emit("user-joined", {
      id: socket.id,
      username
    });

  });

  socket.on("offer", ({ roomId, offer, username }) => {
    console.log("📨 OFFER:", offer);
    socket.to(roomId).emit("offer", { offer, username });
  });

  socket.on("answer", ({ roomId, answer, username }) => {
    console.log("📨 ANSWER:", answer);
    console.log("Answer user-name", username)
    socket.to(roomId).emit("answer", { roomId, answer, username });
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    console.log("❄ ICE:", candidate);
    socket.to(roomId).emit("ice-candidate", candidate);
  });


   socket.on("leave-room", ({ roomId }) => {
    handleLeave(socket, roomId);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
    // cannot rely on roomId here
  });
});

function handleLeave(socket, roomId) {
  const username = socket.data?.username;

  console.log("🚪 handleLeave called", roomId, username);

  if (!roomId) return;

  socket.to(roomId).emit("user-left", {
    id: socket.id,
    username
  });

  socket.leave(roomId);
}


server.listen(3000, () => {
  console.log("Signaling server running on port 3000");
});
