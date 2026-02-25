const auth = require("../middleware/auth");
const Task = require("../../models/task.model");

module.exports = {
    createTask: auth.withAuth("user", async ({ title, description, imageUrl }, context) => {
        try {
            const task = new Task({
                title,
                description,
                status: "pending",
                creator: context.userId,
                assignedTo: context.userId,
                imageUrl
            });
            await task.save();
            await new Log({
                action: "Task Created",
                task: task._id,
                user: context.userId,
            }).save();
            return task;
        } catch (err) {
            throw err;
        }
    }
    ),

    updateTask: auth.withAuth("user", async ({ id, title, description, status, assignedTo, imageUrl }, context) => {
        try {
            const task = await Task.findById(id);
            if (!task) throw new Error("Task not found");
            if (task.creator.toString() !== context.userId) throw new Error("Not authorized");
            if (title) task.title = title;
            if (description) task.description = description;
            if (status) task.status = status;
            if (assignedTo) task.assignedTo = assignedTo;
            if (imageUrl) task.imageUrl = imageUrl;
            await task.save();
            await new Log({
                action: "Task Updated",
                task: task._id,
                user: context.userId,
            }).save();
            return task;
        } catch (err) {
            throw err;
        }
    }
    ),

    deleteTask: auth.withAuth("user", async ({ id }, context) => {
        try {
            const task = await Task.findById(id);
            if (!task) throw new Error("Task not found");
            if (task.creator.toString() !== context.userId) throw new Error("Not authorized");
            await task.remove();
            await new Log({
                action: "Task Deleted",
                task: task._id,
                user: context.userId,
            }).save();
            return true;
        }
        catch (err) {
            throw err;
        }
    }
    ),

    tasks: auth.withAuth("user", async (args, context) => {
        try {
            return await Task.find({ creator: context.userId }).populate("assignedTo").populate("creator");
        } catch (err) {
            throw err;
        }
    }
    ),

    task: auth.withAuth("user", async ({ id }, context) => {
        try {
            const task = await Task.findById(id).populate("assignedTo").populate("creator");
            if (!task) throw new Error("Task not found");
            if (task.creator.toString() !== context.userId) throw new Error("Not authorized");
            return task;
        } catch (err) {
            throw err;
        }
    }
    ),
};