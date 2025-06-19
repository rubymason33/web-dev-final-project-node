import mongoose from "mongoose";
const schema = new mongoose.Schema(
    {
        _id: String,
        title: String,
        course: { type: String, ref: "CourseModel" },
        availableFrom: Date,
        availableUntil: Date,
        dueDate: Date,
        points: Number,
        modules: String,
        description: String
    },
    { collection: "assignments" }
);
export default schema;