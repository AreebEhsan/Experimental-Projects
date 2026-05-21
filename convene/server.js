const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
require("dotenv").config();

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  isUsernameTaken,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

const botName = "Convene Bot";

async function attachRedisAdapter() {
  if (!process.env.REDIS_URL) return;

  const { createClient } = require("redis");
  const { createAdapter } = require("@socket.io/redis-adapter");

  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();

  pubClient.on("error", (err) => console.error("Redis pub error:", err));
  subClient.on("error", (err) => console.error("Redis sub error:", err));

  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));
  console.log("Socket.io Redis adapter attached");
}

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    username = typeof username === "string" ? username.trim() : "";
    room = typeof room === "string" ? room.trim() : "";

    if (!username || !room) {
      socket.emit("joinError", "Username and room are required");
      return;
    }

    if (isUsernameTaken(username, room)) {
      socket.emit("joinError", `Username "${username}" is taken in ${room}`);
      return;
    }

    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    socket.emit("message", formatMessage(botName, "Welcome to Convene!"));

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    if (!user) return;
    const text = typeof msg === "string" ? msg.trim() : "";
    if (!text) return;
    io.to(user.room).emit("message", formatMessage(user.username, text));
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

attachRedisAdapter()
  .catch((err) => {
    console.error("Failed to attach Redis adapter, continuing without it:", err);
  })
  .finally(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
