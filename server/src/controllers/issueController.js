const mongoose = require("mongoose");
const Issue = require("../models/Issue");

const createIssue = async (req, res) => {
    try {
        const { description, category, severity, priority, location } = req.body;

        if (!description || typeof description !== "string" || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: "Description is required",
            });
        }

        if (!location || typeof location !== "object") {
            return res.status(400).json({
                success: false,
                message: "Location with latitude and longitude is required",
            });
        }

        const { latitude, longitude, accuracy } = location;

        if (
            latitude === undefined ||
            latitude === null ||
            typeof latitude !== "number" ||
            Number.isNaN(latitude) ||
            latitude < -90 ||
            latitude > 90
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid latitude between -90 and 90 is required",
            });
        }

        if (
            longitude === undefined ||
            longitude === null ||
            typeof longitude !== "number" ||
            Number.isNaN(longitude) ||
            longitude < -180 ||
            longitude > 180
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid longitude between -180 and 180 is required",
            });
        }

        const validSeverities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
        const validPriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

        const issueData = {
            citizen: req.user.id,
            description: description.trim(),
            location: {
                latitude,
                longitude,
                ...(typeof accuracy === "number" && !Number.isNaN(accuracy)
                    ? { accuracy }
                    : {}),
            },
            status: "REPORTED",
            evidence: [],
        };

        if (category && typeof category === "string" && category.trim()) {
            issueData.category = category.trim();
        }

        if (severity && validSeverities.includes(String(severity).toUpperCase())) {
            issueData.severity = String(severity).toUpperCase();
        }

        if (priority && validPriorities.includes(String(priority).toUpperCase())) {
            issueData.priority = String(priority).toUpperCase();
        }

        const issue = await Issue.create(issueData);

        return res.status(201).json({
            success: true,
            issue,
        });
    } catch (error) {
        console.error("Create issue error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const getMyIssues = async (req, res) => {
    try {
        const issues = await Issue.find({ citizen: req.user.id })
            .sort({ createdAt: -1 })
            .populate("citizen", "name email role")
            .populate("assignedSupervisor", "name email role")
            .populate("assignedTeam", "name email role");

        return res.status(200).json({
            issues,
        });
    } catch (error) {
        console.error("Get my issues error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const getIssueById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        const issue = await Issue.findById(id)
            .populate("citizen", "name email role")
            .populate("assignedSupervisor", "name email role")
            .populate("assignedTeam", "name email role");

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        const citizenId = issue.citizen?._id
            ? issue.citizen._id.toString()
            : issue.citizen?.toString();

        if (citizenId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied to this issue",
            });
        }

        return res.status(200).json({
            success: true,
            issue,
        });
    } catch (error) {
        console.error("Get issue by ID error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

module.exports = {
    createIssue,
    getMyIssues,
    getIssueById,
};
