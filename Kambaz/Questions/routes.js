import * as questionDao from "./dao.js";
import * as quizDao from "../Quizzes/dao.js";

export default function QuestionRoutes(app) {

    // create new question
    app.post("/api/quizzes/:quizId/questions", async (req, res) => {
        try {
            const currentUser = req.session["currentUser"];

            if (!currentUser || currentUser.role !== "FACULTY") {
                return res.status(403);
            }

            const { quizId } = req.params;
            const questionData = {
                ...req.body,
                quiz: quizId
            }

        const newQuestion = await questionDao.createQuestion(questionData);

        const questions = await questionDao.findQuestionsForQuiz(quizId);
        const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0) + (newQuestions.points || 0);
        await quizDao.updateQuiz(quizId, { points: totalPoints });

        res.status(201).json(newQuestion);
        } catch (error) {
            res.status(500);
        }
    });

    // get question by ID
    app.get("/api/questoins/:questionId", async (req, res) => {
        try {
            const { questoinId } = req.params;
            const question = await questionDao.findQuestionById(questionId);

            if (!question) {
                return res.status(404);
            }
            res.json(question);
        } catch (error) {
            res.status(500);
        }
    });

    // update question
    app.put("/api/questions/:questionId", async(req, res) => {
        try {
            const currentUser = req.session["currentUser"];
            if (!currentUser || currentUser.role !== "FACULTY") {
                return res.status(403);
            }

            const { questionId } = req.params;
            const status = await questionDao.updateQuestion(questionId, req.body);

            const question = await questionDao.findQuestionById(questionId);
            if (question) {
                const questions = await questionDao.findQuestionsForQuiz(question.quiz);
                const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
                await quizDao.updateQuiz(question.quiz, { points: totalPoints });
            }
            res.json(status);
        } catch (error) {
            res.status(500);
        }
    });

    // delete question
    app.delete("api/questions/:questionId", async (req, res) => {
        try {
            const currentUser = req.session["currentUser"];
            if (!currentUser || currentUser.role !== "FACULTY") {
                return res.status(403);
            }

            const { questionId } = req.params;
            const question = await questionDao.findQuestionById(questionId);
            const quizId = question?.quiz;

            const status = await questionDao.deleteQuestion(questionId);

            if (quizId) {
                const questions = await questionDao.findQuestionsForQuiz(quizId);
                const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
                await quizDao.updateQuiz(quizId, { points: totalPoints });
            }

            res.json(status);
        } catch (error) {
            res.status(500);
        }
    });
}