const Log = require("../models/log.model"); // adjust path if needed
const Task = require("../models/task.model");

exports.getTaskLogs = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Fetch logs for the task and populate user and task info
        const logs = await Log.find({ task: taskId })
            .populate("user", "name email")
            .populate("task", "title description");

        return res.json({ logs });
    } catch (err) {
        console.error("Error fetching task logs:", err);
        return res.status(500).json({ message: "Server error" });
    }
};