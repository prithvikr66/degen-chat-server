const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://pkunofficial66:WpeYUJqtkBce7Rxv@cluster0.baim4sk.mongodb.net/"
    );
  } catch (err) {
    console.log(err.message);
  }
};
module.exports = connectDB;
