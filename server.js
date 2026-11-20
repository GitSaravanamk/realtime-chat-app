const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: 1e6
});

const PORT = process.env.PORT || 3000;
const onlineUsers = new Map(); // socket.id -> username

app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", online: onlineUsers.size });
});

function broadcastUsers() {
  const users = [...onlineUsers.values()].sort((a, b) => a.localeCompare(b));
  io.emit("users:update", users);
}

io.on("connection", (socket) => {
  socket.on("user:join", (rawName, callback) => {
    const reply = typeof callback === "function" ? callback : () => {};
    const username = String(rawName || "").trim().replace(/\s+/g, " ");

    if (username.length < 2 || username.length > 20) {
      return reply({ ok: false, error: "Username must be 2–20 characters." });
    }
    if (!/^[\p{L}\p{N}_ -]+$/u.test(username)) {
      return reply({ ok: false, error: "Use only letters, numbers, spaces, _ or -." });
    }

    const alreadyOnline = [...onlineUsers.values()]
      .some((name) => name.toLowerCase() === username.toLowerCase());

    if (alreadyOnline) {
      return reply({ ok: false, error: "That username is already online. Choose another." });
    }

    onlineUsers.set(socket.id, username);
    socket.data.username = username;
    reply({ ok: true, username });
    socket.broadcast.emit("system:message", {
      text: `${username} joined the chat`,
      time: new Date().toISOString()
    });
    broadcastUsers();
  });

  socket.on("chat:message", (rawMessage) => {
    const username = socket.data.username;
    if (!username) return;

    const message = String(rawMessage || "").trim();
    if (!message || message.length > 500) return;

    io.emit("chat:message", {
      username,
      message,
      time: new Date().toISOString()
    });
  });

  socket.on("disconnect", () => {
    const username = onlineUsers.get(socket.id);
    if (!username) return;

    onlineUsers.delete(socket.id);
    io.emit("system:message", {
      text: `${username} left the chat`,
      time: new Date().toISOString()
    });
    broadcastUsers();
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Real-Time Chat Server running at http://localhost:${PORT}`);
});
