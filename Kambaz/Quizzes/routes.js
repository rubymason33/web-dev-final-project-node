import * as quizzesDao from "./dao.js"
export default function QuizRoutes(app) {

    app.post("/api/courses/:courseId/quizzes", async (req, res) => {
        const { courseId } = req.params;
        const newQuiz = { ...req.body, course: courseId };
        const quiz = await quizzesDao.createQuiz(newQuiz);
        res.send(quiz);
    });

    app.get("/api/courses/:courseId/quizzes", async (req, res) => {
        const { courseId } = req.params;
        const quizzes = await quizzesDao.findQuizzesForCourse(courseId);
        res.send(quizzes);
    });

    app.put("/api/quizzes/:quizId", async (req, res) => {
        const { quizId } = req.params;
        const updated = await quizzesDao.updateQuiz(quizId, req.body);
        res.send(updated);
    });

    app.delete("/api/quizzes/:quizId", async (req, res) => {
        const { quizId } = req.params;
        await quizzesDao.deleteQuiz(quizId);
        console.log("deleted")
        res.sendStatus(200);
    });
}