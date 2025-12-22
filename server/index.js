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

io.on("connection", (socket) => {

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined");
  });

  socket.on("offer", ({ roomId, offer }) => {
    console.log("📨 OFFER:", offer);
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    console.log("📨 ANSWER:", answer);
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    console.log("❄ ICE:", candidate);
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  socket.on("leave-room", (roomId) => {
  socket.leave(roomId);
  socket.to(roomId).emit("user-left");
});


  socket.on("disconnecting", () => {
  for (const room of socket.rooms) {
    if (room !== socket.id) {
      socket.to(room).emit("user-left");
    }
  }
});
});


server.listen(3000, () => {
  console.log("Signaling server running on port 3000");
});
