const mongoose = require("mongoose");

const ROLES = ["CITIZEN", "ADMIN", "SUPERVISOR", "FIELD_TEAM"];

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
            select: false,
        },
        role: {
            type: String,
            enum: ROLES,
            default: "CITIZEN",
            required: true,
        },
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.set("toJSON", {
    transform(_doc, ret) {
        delete ret.passwordHash;
        return ret;
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
module.exports.ROLES = ROLES;
