const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const placeRoutes = require("./routes/placeRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const meetupRoutes = require("./routes/meetupRoutes");
const userRoutes = require('./routes/userRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
app.set("io", io);
require('dotenv').config();

app.use(cors());
app.use(express.json());

// 🛠️ Logger
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// 🗂️ Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =========================
// 📌 API ROUTES
// =========================

app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/auth", authRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/messages", require("./routes/messageRoutes"));

try {
  app.use("/api/users", require("./routes/userRoutes"));
} catch (e) {
  console.log("⚠️ userRoutes not found or has error");
}

app.use("/api/meetups", meetupRoutes);
app.use("/api/notifications", require("./routes/notificationRoutes"));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_meetup_chat", (meetupId) => {
    socket.join(`meetup_${meetupId}`);
    console.log(`User joined room meetup_${meetupId}`);
  });

  socket.on("send_meetup_message", (messageData) => {
    io.to(`meetup_${messageData.meetupId}`).emit(
      "receive_meetup_message",
      messageData
    );
  });
  socket.on("typing", (data) => {
  socket.to(`meetup_${data.meetupId}`).emit("user_typing", data);
});

socket.on("stop_typing", (data) => {
  socket.to(`meetup_${data.meetupId}`).emit("user_stop_typing", data);
});

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// =========================
// 🚀 SERVER START
// =========================

const PORT = 5000;

mongoose
  .connect(
    "mongodb+srv://GP_db_user:Bh8ZUmcmA8Ch2cC1@cluster0.l8gnj0g.mongodb.net/spots-db?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("MongoDB connected Successfully ✅");
    server.listen(PORT, () =>
      console.log(`Server running on port ${PORT} 🚀`)
    );
  })
  .catch((err) => console.log("MongoDB error ❌", err));