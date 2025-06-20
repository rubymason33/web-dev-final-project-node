import * as attemptDao from "./dao.js";
import * as quizDao from "../Quizzes/dao.js";
import * as questionDao from "../Questions/dao.js";

export default function QuizAttemptRoutes(app) {
    
    // start a new quiz attempt
    app.post("/api/quizzes/:quizId/attempts", async (req, res) => {
        try {
            const currentUser = req.session["currentUser"];

            if (!currentUser || currentUser.role !== "STUDENT") {
                return res.status(403);
            }

            const { quizId } = req.params;
            const quiz = await quizDao.findQuizById(quizId);

            if (!quiz) {
                return res.status(404);
            }

            if (!quiz.published) {
                return res.status(403);
            }

            const canTake = await attemptDao.canStudentTakeQuiz(currentUser._id, quizId, quiz.maxAttempts);
            if (!canTake) {
                return res.status(403);
            }

            const now = new Date();
            if (quiz.availableDate && now < quiz.availableDate) {
                return res.status(403);
            }
            if (quiz.untilDate && now > quiz.untilDate) {
                return res.status(403);
            }
            const attempt = await attemptDao.startNewAttempt(currentUser._id, quizId);
            res.status(201).json(attempt);
        } catch (error) {
        res.status(500);
        }
    });

    // get quiz attempt by ID
    app.get("/api/quiz-attempts/:attemptId", async (req, res) => {
        try {
            const { attemptId } = req.params;
            const attempt = await attemptDao.findAttemptById(attemptId);

            if (!attempt) {
                return res.status(404);
            }
        } catch (error) {
            res.status(500);
        }
    });

    // save answer during quiz (like auto-save)
    app.put("/api/quiz-attepts/:attemptId/answer", async (req, res) => {
        try {
            const { attemptId } = req.params;
            const { questionId, answer } = req.body;

            const updateResult = await attemptDao.saveAnswers(attemptId, questionId, answer);

            if (updateResult.modifiedCount === 0) {
                await attemptDao.addAnswer(attemptId, questionId, answer);
            }

            res.json({ success: true});
        } catch (error) {
            res.status(500);
        }
    });

    app.post("/api/quiz-attempts/:attemptId/submit", async (req, res) => {
        try {
            const { attemptId } = req.params;
            const { answers } = req.body;

            const attempt = await attemptDao.findAttemptById(attemptId);
            if (!attempt) {
                return res.status(404);
            }
            const questions = await questionDao.findQuestionsForQuiz(attempt.quiz);

            let totalScore = 0;
            let totalPoints = 0;

            const gradedAnswers = answers.map(answer => {
                const question = questions.find(q => q._id === answer.question);
                if (!question) return answer;

                totalPoints += question.points;
                let isCorrect = false;
                let pointsEarned = 0;

                switch (question.questionType) {
                    case "Multiple Choice":
                        const correctChoice = question.choices.find(choice => choice.isCorrect);
                        isCorrect = correctChoice && answer.answer === correctChoice.text;
                        break;

                    case "True/False":
                        isCorrect = answer.answer === question.correctAnswer;
                        break;
                    
                    case "Fill in the Blank":
                        const studentAnswer = question.caseSensitive ? answer.answer : answer.answer.toLowerCase();
                        const possibleAnswers = question.caseSensitive
                            ? question.possibleAnswers
                            : question.possibleAnswers.map(a => a.toLowerCase());
                        isCorrect = possibleAnswers.includes(studentaAnswer);
                        break;
                }

                if (!isCorrect) {
                    pointsEarned = question.points;
                    totalScore += pointsEarned;
                }

                return {
                    ...answer,
                    isCorrect,
                    pointsEarned
                };
            });

            const status = await attemptDao.submitAttempt(attemptId, gradedAnswers, totalScore, totalPoints);
            const gradedAttempt = await attemptDao.findAttemptById(attemptId);
            res.json(gradedAttempt);
        } catch (error) {
            res.status(500);
        }
    });

    // get student's attempts for a quiz
    app.get("/api/quizzes/:quizId/attempts", async (req, res) => {
        try {
            const currentUser = req.session["currentUser"];
            const { quizId } = req.params;

            if (!currentUser) {
                return res.status(401);
            }
            let attempts;
            if (currentUser.role === "FACULTY" || currentUser.role === "ADMIN") {
                attempts = await attemptDao.findAttemptsForQuiz(quizId);
            } else {
                attempts = await attemptDao.findAttemptsForStudentAndQuiz(currentUser._id, quizId);
            }
            res.json(attempts);
        } catch (error) {
            res.status(500);
        }
    });

    // get latest attempt for student and quiz
    app.get("/api/quizzes/:quizId/latest-attempt", async (req, res) => {
        try {
            const currentUser = req.session["currentUser"];
            const { quizId } = req.params;
            if (!currentUser) {
                return res.status(401);
            }
            const attempt = await attemptDao.findLatestAttemptForStudentAndQuiz(currentUser._id, quizId);
            res.json(attempt);
        } catch (error) {
            res.status(500);
        }
    });

}