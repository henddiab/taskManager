const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");

router.post(
  "/task",
  isAuth,
  [body("title").trim().not().isEmpty().withMessage("title must not be wmpty")],
  taskController.createTask,
);

router.put(
  "/task/:taskId",
  isAuth,
  [body("title").trim().not().isEmpty().withMessage("title must not be wmpty")],
  taskController.updateTask,
);

router.delete(
  "/task/:taskId",
  isAuth,
  taskController.deletTask,
);

router.get(
  "/task/:taskId",
  isAuth,
  taskController.getSingleTask,
);

router.get(
  "/task",
  isAuth,
  taskController.getAllTasks,
);

module.exports = router;
