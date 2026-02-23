const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const isAuth = require("../middleware/is-auth");
const role = require("../middleware/role");

router.get("/user", isAuth, role(["admin"]), userController.getUsers);
router.patch(
  "/user/:userId",
  isAuth,
  role(["admin"]),
  userController.changeRole,
);

module.exports = router;
