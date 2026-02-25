const userResolver = require("./user.resolver");
const taskResolver = require("./task.resolver");
const logResolver = require("./log.resolver");
const authResolver = require("./auth.resolver");

module.exports = {
    ...userResolver,
    ...taskResolver,
    ...logResolver,
    ...authResolver,
}