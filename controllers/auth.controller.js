const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

exports.signUp = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // this will exit function execution & try to reach next error middleware
      const err = new Error("validation error");
      err.statusCode = 422;
      err.data = errors.array();
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });
    await user.save();
    res.status(201).json({ message: "new user created" });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // this will exit function execution & try to reach next error middleware
    const err = new Error("validation error");
    err.statusCode = 422;
    err.data = errors.array();
    throw err;
  }
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw (new Error("no user found"), { statusCode: 401 });
    }
    const isEqualPassword = bcrypt.compare(req.body.password, user.password);
    if (!isEqualPassword) {
      throw (new Error("Wrong password"), { statusCode: 401 });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      "secretkey",
      {
        expiresIn: "1h",
      },
    );

    const refreshToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      "refreshsecretkey",
      {
        expiresIn: "7d",
      },
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      token,
      refreshToken,
      userId: user._id,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // Verify token
    const decoded = jwt.verify(refreshToken, "refreshsecretkey");

    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      "secretkey",
      {
        expiresIn: "1h",
      },
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
};
