const express = require("express");
const cors = require("cors"); // Import cors

const app = express();
require('dotenv').config();
require("./models/db");
const bodyParser = require("body-parser");
const path = require("path");


const sellerRouter=require("./router/sellerRouter")
const multiAdminRouter=require( "./router/multiAdminRouter");


const PORT = process.env.PORT || 8000;

// Enable CORS - Add this BEFORE other middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from React app
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(express.json()); 

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.get("/", (req, res) => {
    res.json({ message: "This API is connected" });
});

app.use('/api/seller', sellerRouter);
app.use('/api/admin', multiAdminRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});