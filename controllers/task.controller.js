const Task = require("../models/task.model");
const Log = require("../models/log.model");
const path = require("path");
const fs = require("fs");

exports.createTask = async (req, res, next) => {
  try {
    const task = new Task({
      ...req.body,
      status: "pending",
      creator: req.userId,
      imageUrl: req.file.path,
    });
    await task.save();
    await new Log({
      action: "Task Created",
      task: task._id,
      user: req.userId,
    }).save();

    res.status(200).json({
      meaasge: "new task created",
      task: task,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  const taskId = req.params.taskId;
  const imageUrl = req.file?.path;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error("no task found");
    }

    if (imageUrl && task.imageUrl !== imageUrl) {
      clearImage(task.imageUrl);
    }

    const allowedFields = ["title", "description", "status"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();
    await new Log({
      action: "Task Updated",
      task: task._id,
      user: req.userId,
    }).save();

    res.status(200).json({
      meaasge: "task updated",
      task: task,
    });
  } catch (err) {
    next(err);
  }
};

exports.deletTask = async (req, res, next) => {
  const taskId = req.params.taskId;
  try {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new Error("task not found");
    }

    await task.deleteOne({ _id: taskId });

    if (task.imageUrl) {
      clearImage(task.imageUrl);
    }
    res.status(200).json({
      message: "task deleted",
    });
  } catch (err) {
    next(err);
  }
};

exports.getSingleTask = async (req, res, next) => {
  const taskId = req.params.taskId;

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new Error("no task found");
    }
    res.status(200).json({
      task: task,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllTasks = async (req, res, next) => {
  try {
    let tasks;
    const page = +req.query.page || 1;
    const perPage = 5;
    if (!page) {
      tasks = await Task.find();
    }
    tasks = await Task.find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate("assignedTo", "name email");

    if (!tasks.length) {
      throw new Error("no tasks found");
    }
    res.status(200).json({
      tasks: tasks,
    });
  } catch (err) {
    next(err);
  }
};

// delete file from disk
const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
