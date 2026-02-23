// express
const express = require("express");
const app = express();

// fs
const fs = require("fs");

// path
const path = require("path");

const https = require("https");
const privateKey = fs.readFileSync("private.key");
const certificate = fs.readFileSync("certificate.crt");


// mongoose
const mongoose = require("mongoose");

const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

// create a write stream (in append mode) for logging
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" },
);


app.use(compression());
app.use(helmet());
app.use(morgan("combined", { stream: accessLogStream }));

// use body parser to parse request body
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
    `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.h7kobbz.mongodb.net/${process.env.MONGO_DB}`,
  )
  .then((res) => {
    // https.createServer({ key: privateKey, cert: certificate }, app).listen(process.env.PORT);
    app.listen(process.env.PORT, () => {
      console.log(`Server running on ${process.env.PORT}`);
    });
  })
  .catch((err) => { });
