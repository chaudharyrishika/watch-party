const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new Server(server, {
  cors: { origin: "*" }
});

// Store all rooms and participants in memory
const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 🔹 User joins a room
  socket.on("join_room", ({ roomId, username }) => {
    socket.join(roomId);

    // Create room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = {
        host: socket.id,
        participants: {}
      };
    }

    // Assign role (host or participant)
    const role =
      rooms[roomId].host === socket.id ? "host" : "participant";

    rooms[roomId].participants[socket.id] = {
      username,
      role
    };

    // Broadcast updated participants list
    io.to(roomId).emit("user_joined", {
      participants: rooms[roomId].participants
    });
  });

  // ▶️ Play event (only host allowed)
  socket.on("play", ({ roomId }) => {
    if (rooms[roomId]?.host !== socket.id) return;
    io.to(roomId).emit("play");
  });

  // ⏸️ Pause event (only host allowed)
  socket.on("pause", ({ roomId }) => {
    if (rooms[roomId]?.host !== socket.id) return;
    io.to(roomId).emit("pause");
  });

  // ⏩ Seek event (sync time)
  socket.on("seek", ({ roomId, time }) => {
    if (rooms[roomId]?.host !== socket.id) return;
    io.to(roomId).emit("seek", { time });
  });

  // 🎬 Change video for all users
  socket.on("change_video", ({ roomId, videoId }) => {
    if (rooms[roomId]?.host !== socket.id) return;
    io.to(roomId).emit("change_video", { videoId });
  });

  // 🚪 User leaves room manually
  socket.on("leave_room", ({ roomId }) => {
    socket.leave(roomId);

    if (rooms[roomId]) {
      delete rooms[roomId].participants[socket.id];

      // If host leaves → assign new host
      if (rooms[roomId].host === socket.id) {
        const users = Object.keys(rooms[roomId].participants);
        rooms[roomId].host = users[0] || null;

        if (users[0]) {
          rooms[roomId].participants[users[0]].role = "host";
        }
      }

      // Broadcast updated participants
      io.to(roomId).emit("user_joined", {
        participants: rooms[roomId].participants
      });
    }
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});