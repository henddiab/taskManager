// express
const express = require("express");
const app = express();

// mongoose
const mongoose = require("mongoose");

// use body parser to parse request body
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// swagger
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const basicAuth = require("express-basic-auth");

// swagger config
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Manager API",
      version: "1.0.0"
    },
    servers: [
      {
        url: "https://your-render-url.onrender.com"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// protect swagger
app.use(
  "/api-docs",
  basicAuth({
    users: {
      [process.env.SWAGGER_USER]: process.env.SWAGGER_PASS
    },
    challenge: true
  }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// path
const path = require("path");

// Reads multipart/form-data
// Extracts files from incoming requests
// Saves them to disk
const multer = require("multer");

// control where files will be storaged
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // files will be stored on desk /images
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    // how uploaded files are named
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname,
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true); // accept file
  } else {
    cb(null, false); // reject file
  }
};

// register multer
// Handles single file uploads
// Expects the file field to be named "image" : <input type="file" name="image" />
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"),
);

// serve static files(images)
// For every request that starts with /images, use this middleware.
app.use("/images", express.static(path.join(__dirname, "images")));

// middlewares
const errorMiddleware = require("./middleware/error");

// register error middleware
app.use(errorMiddleware);

// register auth routes
const authRoutes = require("./routes/auth.route");
app.use("/auth", authRoutes);

// register task routes
const taskRoutes = require("./routes/task.route");
app.use("/", taskRoutes);

// register user routes
const userRoutes = require("./routes/user.route");
app.use("/", userRoutes);

// connect to mongo database
mongoose
  .connect(
    "mongodb+srv://henddiab132_db:EAhW2pqZEFWoAQqK@cluster0.h7kobbz.mongodb.net/taskManager",
  )
  .then((res) => {
    app.listen(3000);
  })
  .catch((err) => {});
