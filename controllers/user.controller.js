const User = require("../models/user.model");

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

exports.changeRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      throw new Error("no user found");
    }
    if (!req.body.role) {
      throw new Error("user role required");
    }
    user.role = req.body.role;
    await user.save();

    res.json({ message: "Role updated" });
  } catch (err) {
    next(err);
  }
};
