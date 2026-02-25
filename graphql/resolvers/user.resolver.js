const User = require("../../models/user.model");
const auth = require("../middleware/auth");

module.exports = {
    changeRole: auth.withRole("admin", async ({ userId, role }) => {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error("no user found");
            }
            user.role = role;
            await user.save();
            return "Role changed successfully";
        } catch (err) {
            throw err;
        }
    },
    ),
    getUsers: auth.withRole("admin", async () => {
        try {
            const users = await User.find();
            return users;
        } catch (err) {
            throw err;
        }
    }
    ),
};