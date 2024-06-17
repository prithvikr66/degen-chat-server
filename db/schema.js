const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  walletAddress: String,
  profilePic: String,
});
const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Users = mongoose.model("Users", userSchema);
const Message = mongoose.model("Message", messageSchema);

module.exports = { Message, Users };
