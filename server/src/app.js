const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "CivicFlow server is running",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;