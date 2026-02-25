const User = require("../../models/user.model");
const auth = require("../middleware/auth");
const { Query } = require("./log.resolver");

module.exports = {
    Mutation:
    {
        changeRole: auth.withRole("admin", async (parent,{ userId, role },context) => {
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
    }
    , Query: {
        getUsers: auth.withRole("admin", async () => {
            try {
                const users = await User.find();
                return users;
            } catch (err) {
                throw err;
            }
        }
        ),
    }
};