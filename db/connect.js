const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://pokeharsh:1234@cluster0.3xo6scr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
  } catch (err) {
    console.log(err.message);
  }
};
module.exports = connectDB;
