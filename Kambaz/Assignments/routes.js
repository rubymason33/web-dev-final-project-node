import * as assignmentsDao from "./dao.js";

export default function AssignmentRoutes(app) {
    app.post("/api/courses/:courseId/assignments", async (req, res) => {
        const { courseId } = req.params;
        const newAssignment = { ...req.body, course: courseId };
        const assignment = await assignmentsDao.createAssignment(newAssignment);
        res.send(assignment);
    });

    app.get("/api/courses/:courseId/assignments", async (req, res) => {
        const { courseId } = req.params;
        const assignments = await assignmentsDao.findAssignmentsForCourse(courseId);
        res.send(assignments);
    });

    app.put("/api/assignments/:assignmentId", async (req, res) => {
        const { assignmentId } = req.params;
        const updated = await assignmentsDao.updateAssignment(assignmentId, req.body);
        res.send(updated);
    });

    app.delete("/api/assignments/:assignmentId", async (req, res) => {
        const { assignmentId } = req.params;
        await assignmentsDao.deleteAssignment(assignmentId);
        res.sendStatus(200);
    });
}
