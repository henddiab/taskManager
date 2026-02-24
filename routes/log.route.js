const express = require("express");
const router = express.Router();
const getTaskLogs = require("../controllers/log.controller");

// GET logs for a task
router.get("/:taskId/logs", getTaskLogs.getTaskLogs);

module.exports = router;