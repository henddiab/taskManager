const { buildSchema } = require("graphql");

const userSchema = require("./user.schema");
const taskSchema = require("./task.schema");
const logSchema = require("./log.schema");

module.exports = buildSchema(`
  ${userSchema}
  ${taskSchema}
  ${logSchema}
`);