const taskSchema = `
  scalar Upload

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
    createTask(
      title: String!
      description: String
      assignedTo: ID!
      image: Upload
    ): task!
    updateTask(
      id: ID!
      title: String
      description: String
      status: String
      assignedTo: ID
      image: Upload
    ): task!
    deleteTask(id: ID!): Boolean!
  }
`;

module.exports = taskSchema;