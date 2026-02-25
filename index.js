const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { graphqlUploadExpress } = require("graphql-upload");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

// Import your schema and resolvers
const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");

// Import your middlewares & routes
const errorMiddleware = require("./middleware/error");
const authRoutes = require("./routes/auth.route");
const taskRoutes = require("./routes/task.route");
const userRoutes = require("./routes/user.route");
const logRoutes = require("./routes/log.route");

// Initialize Express
const app = express();

// Serve images folder
const imageDir = path.join(__dirname, "images");
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });
app.use("/images", express.static(imageDir));

// Enable GraphQL file uploads
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }));

// Body parser for REST routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register REST routes
app.use("/auth", authRoutes);
app.use("/", taskRoutes);
app.use("/", userRoutes);
app.use("/", logRoutes);

// Register error middleware
app.use(errorMiddleware);

// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // Extract JWT token from headers
    let userId = null;
    let role = null;

    const authHeader = req.get("Authorization");
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, "secretkey"); // replace with your secret
        userId = decoded.userId;
        role = decoded.role;
      } catch (err) {
        console.log("Invalid token");
      }
    }

    return { userId, role, req };
  },
});

// Start server
(async () => {
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  // Connect to MongoDB
  mongoose
    .connect(
      `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.h7kobbz.mongodb.net/${process.env.MONGO_DB}`,
    )
    .then(() => {
      app.listen(process.env.PORT || 3000, () => {
        console.log(`Server running at http://localhost:${process.env.PORT || 3000}/graphql`);
      });
    })
    .catch((err) => {
      console.log("MongoDB connection error:", err);
    });
})();