import mongoose from "mongoose";
import Enrollment from "../Enrollments/model.js"
const courseSchema = new mongoose.Schema({
    _id: String,
    title: String,
    number: String,
    startDate: Date,
    endDate: Date,
    credits: Number,
    image: String,
    description: String,
    },
    { collection: "courses" }
);

// delete enrollmetns involving a delted course
courseSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await Enrollment.deleteMany({ course: doc._id });
        console.log(`Deleted enrollments for course ${doc._id}`);
    }
});
export default courseSchema;

