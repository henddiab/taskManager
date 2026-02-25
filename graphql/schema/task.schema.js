const taskSchema = (`
    type task {
    id: ID!
    title: String!
    description: String
    status: String!
    assignedTo: User!
    creator: User!
    imageUrl: String
  }
    extend type RootQuery {
    tasks: [task!]!
    task(id: ID!): task
  }

  extend type RootMutation {
    createTask(title: String!, description: String, status: String!, assignedTo: ID!, creator: ID!, imageUrl: String): task!
    updateTask(id: ID!, title: String, description: String, status: String, assignedTo: ID, imageUrl: String): task!
    deleteTask(id: ID!): Boolean!
  }
`);

module.exports = taskSchema;