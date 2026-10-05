const mongoose = require("mongoose");

const STATUSES = [
    "REPORTED",
    "ANALYZING",
    "PRIORITIZED",
    "ASSIGNED_TO_SUPERVISOR",
    "ASSIGNED_TO_TEAM",
    "IN_PROGRESS",
    "RESOLUTION_SUBMITTED",
    "VERIFIED",
    "RESOLVED",
    "REVISIT",
    "REJECTED",
];

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const issueSchema = new mongoose.Schema(
    {
        citizen: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            trim: true,
            default: null,
        },
        severity: {
            type: String,
            enum: SEVERITIES,
            default: "MEDIUM",
        },
        priority: {
            type: String,
            enum: PRIORITIES,
            default: "MEDIUM",
        },
        location: {
            latitude: {
                type: Number,
                required: true,
                min: -90,
                max: 90,
            },
            longitude: {
                type: Number,
                required: true,
                min: -180,
                max: 180,
            },
            accuracy: {
                type: Number,
                default: null,
            },
        },
        evidence: {
            type: [String],
            default: [],
        },
        status: {
            type: String,
            enum: STATUSES,
            default: "REPORTED",
            required: true,
        },
        assignedSupervisor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        assignedTeam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        resolution: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        verification: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Issue = mongoose.model("Issue", issueSchema);

module.exports = Issue;
module.exports.STATUSES = STATUSES;
module.exports.SEVERITIES = SEVERITIES;
module.exports.PRIORITIES = PRIORITIES;
