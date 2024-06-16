// server.js
const express = require("express");
const http = require("http");
const {Server} = require("socket.io");
const mongoose = require("mongoose");
const connectDB = require("./db/connect");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const io = new Server({
  cors: "*",
});
io.attach(server);


connectDB();
app.use(cors());

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("sendMessage", (msg) => {
    io.emit("newMessage", msg);
    console.log(msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
