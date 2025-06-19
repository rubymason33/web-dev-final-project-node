import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

// export function findAssignmentsForCourse(courseId) {
//     const { assignments } = Database;
//     return assignments.filter(a => a.course === courseId);
// }

// export function createAssignment(assignment) {
//     const newAssignment = { ...assignment, _id: uuidv4() };
//     Database.assignments = [...Database.assignments, newAssignment];
//     return newAssignment;
// }

// export function deleteAssignment(assignmentId) {
//     const { assignments } = Database;
//     Database.assignments = assignments.filter(a => a._id !== assignmentId);
// }

// export function updateAssignment(assignmentId, assignmentUpdates) {
//     const { assignments } = Database;
//     const assignment = assignments.find(a => a._id === assignmentId);
//     Object.assign(assignment, assignmentUpdates);
//     return assignment;
// }

export function findAssignmentsForCourse(courseId) {
    return model.find({ course: courseId })
}

export function createAssignment(assignment) {
    const newAssignment = { ...assignment, _id: uuidv4() };
    return model.create(newAssignment);
}

export function deleteAssignment(assignmentId) {
    return model.deleteOne({ _id: assignmentId })
}

export function updateAssignment(assignmentId, assignmentUpdates) {
    return model.updateOne({ _id: assignmentId}, assignmentUpdates)
}
