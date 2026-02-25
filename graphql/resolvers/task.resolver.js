const auth = require("../middleware/auth");
const Task = require("../../models/task.model");
const { GraphQLUpload } = require("graphql-upload");
const path = require("path");
const fs = require("fs");
const Log = require("../../models/log.model");
const { mongoose, Query } = require("mongoose");

module.exports = {
    Upload: GraphQLUpload,
    Mutation: {
        createTask: auth.withAuth(async (parent, { title, description, assignedTo, image }, context) => {
            if (!context.userId) throw new Error("Not authenticated");

            let imageUrl = null;

            if (image) {
                const uploadedImage = await image;

                if (!["image/jpeg", "image/png", "image/webp"].includes(uploadedImage.file.mimetype)) {
                    throw new Error("Only images are allowed");
                }

                const uploadDir = path.join(__dirname, "../../images");

                if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

                const uniqueName = `${Date.now()}-${uploadedImage.file.filename}`;
                const filePath = path.join(uploadDir, uniqueName);

                const stream = uploadedImage.file.createReadStream();
                const out = fs.createWriteStream(filePath);
                stream.pipe(out);

                await new Promise((resolve, reject) => {
                    out.on("finish", resolve);
                    out.on("error", reject);
                });

                imageUrl = `images/${uniqueName}`;
            }

            const newTask = await Task.create({
                title,
                description,
                status: 'pending',
                assignedTo,
                creator: context.userId,
                imageUrl,
            });

            await newTask.save();
            return newTask;
        }),

        updateTask: auth.withAuth(async (parent, args, context) => {
            const { id, title, description, status, assignedTo, image } = args;
            console.log(id, title, description, status, assignedTo, image);

            const task = await Task.findById(new mongoose.Types.ObjectId(id));
            if (!task) throw new Error("Task not found");

            if (title) task.title = title;
            if (description) task.description = description;
            if (status) task.status = status;
            if (assignedTo) task.assignedTo = assignedTo;

            if (image) {
                // process new image
                const uploadedImage = await image;

                if (!["image/png", "image/jpeg", "image/webp"].includes(uploadedImage.file.mimetype)) {
                    throw new Error("Only images are allowed");
                }

                const uniqueName = `${Date.now()}-${uploadedImage.file.filename}`;
                const filePath = path.join(__dirname, "../../images", uniqueName);

                const stream = uploadedImage.file.createReadStream();
                const out = fs.createWriteStream(filePath);
                stream.pipe(out);
                await new Promise((resolve, reject) => {
                    out.on("finish", resolve);
                    out.on("error", reject);
                });

                if (task.imageUrl) clearImage(task.imageUrl);

                task.imageUrl = `images/${uniqueName}`;
            }

            await task.save();
            await new Log({
                action: "Task Updated",
                task: task._id,
                user: context.userId
            }).save();

            return task;
        }),
        deleteTask: auth.withAuth(async (parent, { id }, context) => {
            try {
                const task = await Task.findById(id);
                if (!task) throw new Error("Task not found");
                if (task.creator.toString() !== context.userId) throw new Error("Not authorized");
                await task.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
                await new Log({
                    action: "Task Deleted",
                    task: task._id,
                    user: context.userId,
                }).save();
                return true;
            }
            catch (err) {
                throw err;
            }
        },
        ),
    },
    Query: {
        tasks: auth.withAuth(async (parent, args, context) => {
            try {
                return await Task.find().populate("assignedTo").populate("creator");
            } catch (err) {
                throw err;
            }
        }
        ),

        task: auth.withAuth(async (parent, { id }, context) => {
            try {
                const task = await Task.findById(id).populate("assignedTo").populate("creator");
                if (!task) throw new Error("Task not found");
                if (task.creator.toString() !== context.userId) throw new Error("Not authorized");
                return task;
            } catch (err) {
                throw err;
            }
        }
        ),
    }
};


clearImage = (filePath) => {
    filePath = path.join(__dirname, "../../", filePath);
    fs.unlink(filePath, (err) => {
        if (err) console.log(err);
    });
}