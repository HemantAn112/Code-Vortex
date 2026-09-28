const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Load environment variables from server root .env
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config(); // fallback if run from server root

const User = require("../models/User");

async function createAdmin() {
    const adminName = (process.env.ADMIN_NAME || "System Admin").trim();
    const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "";

    if (!adminEmail || !adminPassword) {
        console.error("==================================================");
        console.error("ERROR: ADMIN_EMAIL and ADMIN_PASSWORD are required.");
        console.error("==================================================");
        console.error("Please supply them via environment variables before running this script.");
        console.error("");
        console.error("Examples:");
        console.error("  Linux/macOS / Git Bash:");
        console.error("    ADMIN_NAME=\"Admin User\" ADMIN_EMAIL=\"admin@civicflow.com\" ADMIN_PASSWORD=\"yourSecretPassword\" node src/scripts/createAdmin.js");
        console.error("");
        console.error("  Windows PowerShell:");
        console.error("    $env:ADMIN_NAME=\"Admin User\"; $env:ADMIN_EMAIL=\"admin@civicflow.com\"; $env:ADMIN_PASSWORD=\"yourSecretPassword\"; node src/scripts/createAdmin.js");
        console.error("");
        console.error("  Windows Command Prompt:");
        console.error("    set ADMIN_NAME=Admin User&& set ADMIN_EMAIL=admin@civicflow.com&& set ADMIN_PASSWORD=yourSecretPassword&& node src/scripts/createAdmin.js");
        console.error("==================================================");
        process.exit(1);
    }

    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error("ERROR: MONGO_URI is missing from environment variables.");
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB successfully.");

        // Check if ANY admin already exists in the system
        const existingAdmin = await User.findOne({ role: "ADMIN" });
        if (existingAdmin) {
            console.log("--------------------------------------------------");
            console.log(`An ADMIN account already exists: ${existingAdmin.email}`);
            console.log("Skipping admin creation. Only one initial admin should be seeded.");
            console.log("--------------------------------------------------");
            return;
        }

        // Check if the specified email is already in use by another role
        const emailInUse = await User.findOne({ email: adminEmail });
        if (emailInUse) {
            console.error(`ERROR: A user with email '${adminEmail}' already exists with role '${emailInUse.role}'.`);
            process.exitCode = 1;
            return;
        }

        // Hash password securely with bcryptjs
        const passwordHash = await bcrypt.hash(adminPassword, 12);

        // Create the admin user
        const newAdmin = await User.create({
            name: adminName,
            email: adminEmail,
            passwordHash,
            role: "ADMIN",
        });

        console.log("==================================================");
        console.log("Initial ADMIN account created successfully!");
        console.log(`Name:  ${newAdmin.name}`);
        console.log(`Email: ${newAdmin.email}`);
        console.log(`Role:  ${newAdmin.role}`);
        console.log("==================================================");
    } catch (error) {
        console.error("Failed to create initial admin account:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

createAdmin();
