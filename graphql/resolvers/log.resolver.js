const { Query } = require("mongoose");
const Log = require("../../models/log.model");
const Task = require("../../models/task.model");
const auth = require("../middleware/auth");

module.exports = {
    Query: {
        taskLogs: auth.withAuth(async (parent, { taskId }, context) => {
            try {
                const task = await Task.findById(taskId);
                if (!task) {
                    throw new Error("Task not found");
                }

                const logs = await Log.find({ task: taskId })
                    .populate("user", "name email")
                return logs;

            } catch (err) {
                throw new Error("Server error");
            }
        }
        )
    }
};