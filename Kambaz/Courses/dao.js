import model from "./model.js";
import EnrollmentModel from "../Enrollments/model.js";
import { v4 as uuidv4 } from "uuid";

export function findAllCourses() {
    return model.find();
}
export async function findCoursesForEnrolledUser(userId) {
    const enrollments = await EnrollmentModel.find({ user: userId });
    const courseIds = enrollments.map((e) => e.course);
    return model.find({ _id: { $in: courseIds } });
}
export async function createCourse(course) {
    const newCourse = { ...course, _id: uuidv4() };
    return model.create(newCourse);
}
// handle enrollments in the course of deletion
// export async function deleteCourse(courseId) {
//     await EnrollmentModel.deleteMany({ course: courseId });
//     return model.deleteOne({ _id: courseId });
// }
export async function deleteCourse(courseId) {
    await EnrollmentModel.deleteMany({ course: courseId });
    return model.findByIdAndDelete(courseId);
}

export async function updateCourse(courseId, courseUpdates) {
    return model.updateOne({ _id: courseId }, { $set: courseUpdates });
}






