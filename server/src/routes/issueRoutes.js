const express = require("express");
const {
    createIssue,
    getMyIssues,
    getIssueById,
} = require("../controllers/issueController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("CITIZEN"));

router.post("/", createIssue);
router.get("/my", getMyIssues);
router.get("/:id", getIssueById);

module.exports = router;
