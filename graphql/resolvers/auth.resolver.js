const User = require("../../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require('validator');
const { refreshToken } = require("../../controllers/auth.controller");

module.exports = {
    login: async ({ email, password }) => {
        try {
            if (validator.isEmpty(email) || validator.isEmpty(password)) {
                throw new Error("Email and password are required");
            }
            if (!validator.isEmail(email)) {
                throw new Error("Invalid email format");
            }
            const user = await User.findOne({ email: email });
            if (!user) {
                throw new Error("no user found");
            }
            const isEqualPassword = await bcrypt.compare(password, user.password);
            if (!isEqualPassword) {
                throw new Error("Wrong password");
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
            return {
                userId: user._id,
                token: token,
                refreshToken: refreshToken,
            };
        }
        catch (err) {
            throw err;
        }
    },

    signUp: async ({ name, email, password, role }) => {
        try {
            if (validator.isEmpty(name) || validator.isEmpty(email) || validator.isEmpty(password)) {
                throw new Error("Name, email and password are required");
            }
            if (!validator.isEmail(email)) {
                throw new Error("Invalid email format");
            }

            const existingUser = await User.findOne({ email: email });
            if (existingUser) {
                throw new Error("User already exists");
            }
            const hashedPassword = await bcrypt.hash(password, 12);
            const user = new User({
                name: name,
                email: email,
                password: hashedPassword,
                role: role || "user",
            });
            const result = await user.save();
            return {
                id: result._id,
                name: result.name,
                email: result.email,
                role: result.role,
                refreshToken: result.refreshToken,
            };
        }
        catch (err) {
            throw err;
        }
    },
    refreshToken: async ({ refreshToken }) => {
        try {
            if (validator.isEmpty(refreshToken)) {
                throw new Error("Refresh token is required");
            }
            const decodedToken = jwt.verify(refreshToken, "refreshsecretkey");
            const user = await User.findById(decodedToken.userId);
            if (!user || user.refreshToken !== refreshToken) {
                throw new Error("Invalid refresh token");
            }
            const newToken = jwt.sign(
                {
                    userId: user._id,
                    role: user.role,
                },
                "   secretkey",
                {
                    expiresIn: "1h",
                },
            );
            await user.save();
            return {
                userId: user._id,
                token: newToken,
                refreshToken: user.refreshToken,
            };
        }
        catch (err) {
            throw err;
        }
    },
};