const express = require("express");
const http = require("http");
const multer = require("multer");
const aws = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const { Server } = require("socket.io");
const connectDB = require("./db/connect");
const { Users, Message } = require("./db/schema");
const cors = require("cors");
const { config } = require("dotenv");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

connectDB();
config();
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.options("*", cors());

var allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
};
app.use(allowCrossDomain);

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.get("/", (req, res) => {
  res.send("good to go");
});

app.post("/api/profile-pic", upload.single("profilePic"), async (req, res) => {
  try {
    const { walletAddress } = req.query;

    const file = req.file;
    if (!file) {
      return res.status(400).send("No file uploaded");
    }

    const existingUser = await Users.findOne({ walletAddress });
    if (!existingUser) {
      const newUser = new Users({ username, walletAddress, profilePic });
      await newUser.save();
      return res
        .status(201)
        .json({ message: "Username created successfully", user: newUser });
    }

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${uuidv4()}_${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const data = await s3.upload(uploadParams).promise();
    existingUser.profilePic = data.Location;
    await existingUser.save();
    res.status(200).send({ message: "Profile Pic set successfully", data });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).send("Error uploading file");
  }
});

app.post("/api/profile", async (req, res) => {
  try {
    const { username, walletAddress } = req.query;

    const profilePic = "";
    const existingUser = await Users.findOne({ walletAddress });

    if (!existingUser) {
      const newUser = new Users({ username, walletAddress, profilePic });
      await newUser.save();
      return res
        .status(201)
        .json({ message: "Username created successfully", user: newUser });
    }

    existingUser.username = username;
    await existingUser.save();
    return res
      .status(201)
      .json({ message: "Username updated successfully", user: existingUser });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.get("/api/initialMessages", async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .select("-timestamp ");
    messages.reverse();
    return res.status(200).json(messages);
  } catch (err) {
    console.log(err.message);
  }
});

app.get("/api/user-profile", async (req, res) => {
  try {
    const { walletAddress } = req.query;
    const user = await Users.findOne({ walletAddress });

    if (user) {
      console.log(user);
      return res.status(200).json(user);
    }
  } catch (err) {
    console.log(err.message);
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("sendMessage", async (msg) => {
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
