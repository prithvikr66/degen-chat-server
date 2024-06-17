// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./db/connect");
const { Users, Message } = require("./db/schema");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

connectDB();
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(express.json());
app.options('*',cors());
app.get("/", (req, res) => {
  res.json({ success: true });
});
var allowCrossDomain = function(req,res,next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();  
}
app.use(allowCrossDomain);



app.post("/api/profile", async (req, res) => {
  try {
    const { username, walletAddress } = req.body;
    const profilePic = "";
    const existingUser = await Users.findOne({ username });

    if (existingUser) {
      return res.status(400).json({
        message: "Username Already Taken !",
      });
    }
    const newUser = new Users({ username, walletAddress, profilePic });
    await newUser.save();
    res.status(201).json({ message: "Username created successfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});


app.get("/api/initialMessages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 }).limit(50) .select('-timestamp ');
    messages.reverse();
    return res.status(200).json(messages);
  } catch (err) {
    console.log(err.message);
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("sendMessage", async (msg) => {
    console.log(msg);
    io.emit("newMessage", msg);
    const message = new Message(msg);
    await message.save();
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
