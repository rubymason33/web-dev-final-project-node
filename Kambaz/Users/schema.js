import mongoose from "mongoose";
import Enrollment from "../Enrollments/model.js";

const userSchema = new mongoose.Schema({
    _id: String,
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: String,
    email: String,
    lastName: String,
    dob: Date,
    role: {
    type: String,
    enum: ["STUDENT", "FACULTY", "ADMIN", "USER"],
    default: "USER",
    },
    loginId: String,
    section: String,
    lastActivity: Date,
    totalActivity: String,
    },
    { collection: "users" }
);

// delete enrollments involving a delted user
userSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await Enrollment.deleteMany({ user: doc._id });
        console.log(`Deleted enrollments for user ${doc._id}`);
    }
});

export default userSchema;

