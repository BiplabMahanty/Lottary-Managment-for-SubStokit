

const mongoose = require("mongoose");

require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_CONN, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));
