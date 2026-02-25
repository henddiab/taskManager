const logSchema = (`
    type log {
    id: ID!
    action: String!
    createdAt: String!
    user: User!
    }

    extend type RootQuery {
    taskLogs(taskId: ID!): [log!]!
    } 
 `);

module.exports = logSchema;   