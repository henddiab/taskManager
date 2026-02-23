const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");
const User = require("../models/user.model");

router.post(
  "/signUp",
  [
    body("name").trim().not().isEmpty(),
    body("password").trim().isLength({ min: 5 }),
    body("email")
      .isEmail()
      .withMessage("this is not valid email")
      .custom(async (email, { req }) => {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return Promise.reject("this email already exist");
        }
        return true;
      }),
  ],
  authController.signUp,
);

router.post(
  "/login",
  [
    body("password").trim().isLength({ min: 5 }),
    body("email").isEmail().withMessage("this is not valid email"),
  ],
  authController.login,
);

router.post("/refreshToken", authController.refreshToken);

module.exports = router;
