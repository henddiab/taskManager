const userSchema = (`
    type RootQuery {
        login(email: String!, password: String!): AuthData!
        refreshToken(refreshToken: String!): AuthData!
        getUsers: [User!]!
    }

    type RootMutation {
       signUp(name: String!, email: String!, password: String!, role: String): User!
       changeRole(userId: String!, role: String!): String!
    }

    type User {
    id: ID!
    name: String!
    email: String!
    password: String!
    role: String!
    refreshToken: String
    } 

    type AuthData {
    userId: String!
    token: String!
    refreshToken: String!
    }

    schema {
    query: RootQuery
    mutation: RootMutation
    }
`);


module.exports = userSchema;