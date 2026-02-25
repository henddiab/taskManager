const userResolver = require("./user.resolver");
const taskResolver = require("./task.resolver");
const logResolver = require("./log.resolver");
const authResolver = require("./auth.resolver");

module.exports = {
    RootQuery: {
        ...userResolver.Query,
        ...taskResolver.Query,
        ...logResolver.Query,
        ...authResolver.Query,
    },
    RootMutation: {
        ...userResolver.Mutation,
        ...taskResolver.Mutation,
        ...logResolver.Mutation,
        ...authResolver.Mutation,
    },
}