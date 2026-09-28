const bcrypt = require("bcryptjs");
const User = require("../models/User");

const ALLOWED_STAFF_ROLES = ["SUPERVISOR", "FIELD_TEAM"];

const createStaff = async (req, res) => {
    try {
        const { name, email, password, role, departmentId } = req.body;

        if (!name || !name.trim() || !email || !email.trim() || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password, and role are required",
            });
        }

        const trimmedRole = String(role).trim().toUpperCase();

        if (trimmedRole === "ADMIN") {
            return res.status(400).json({
                success: false,
                message: "Cannot create ADMIN accounts through this endpoint",
            });
        }

        if (!ALLOWED_STAFF_ROLES.includes(trimmedRole)) {
            return res.status(400).json({
                success: false,
                message: `Invalid staff role: ${role}. Allowed roles are: ${ALLOWED_STAFF_ROLES.join(", ")}`,
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const newStaff = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash,
            role: trimmedRole,
            departmentId: departmentId || null,
        });

        return res.status(201).json({
            success: true,
            message: "Staff account created successfully",
            user: {
                id: newStaff._id,
                name: newStaff.name,
                email: newStaff.email,
                role: newStaff.role,
                departmentId: newStaff.departmentId,
                createdAt: newStaff.createdAt,
                updatedAt: newStaff.updatedAt,
            },
        });
    } catch (error) {
        console.error("Create staff error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

module.exports = {
    createStaff,
};
