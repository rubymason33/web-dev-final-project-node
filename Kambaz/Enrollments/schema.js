import mongoose from "mongoose";
const enrollmentSchema = new mongoose.Schema({
    _id: String,
    course: { type: String, ref: "CourseModel" },
    user:   { type: String, ref: "UserModel"   },
    grade: Number,
    letterGrade: String,
    enrollmentDate: Date,
    status: {
        type: String,
        enum: ["ENROLLED", "DROPPED", "COMPLETED"],
        default: "ENROLLED",
    },
    role: String,
    section: String,
    lastActivity: Date,
    totalActivity: String,
},
    { collection: "enrollments" }
);
export default enrollmentSchema;

