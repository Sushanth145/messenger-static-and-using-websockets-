const http = require("http");
const express = require("express");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store connected users
const users = {};

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Save user when they join with a username
  socket.on("register", (username) => {
    users[username] = socket.id;
    console.log(`🔹 ${username} registered with ID: ${socket.id}`);
  });

  // Handle private messaging
  socket.on("private-message", ({ sender, recipient, message }) => {
    const recipientSocketId = users[recipient];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receive-message", { sender, message });
      console.log(`📩 ${sender} sent a message to ${recipient}: ${message}`);
    } else {
      socket.emit("error-message", "Recipient not found!");
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    for (let username in users) {
      if (users[username] === socket.id) {
        delete users[username];
        console.log(`🔹 ${username} removed from active users`);
      }
    }
  });
});

app.use(express.static(path.resolve("./public")));

app.get("/", (req, res) => {
  return res.sendFile(path.resolve("./public/index.html"));
});

server.listen(9000, () => console.log(`🚀 Server Started at PORT: 9000`));
