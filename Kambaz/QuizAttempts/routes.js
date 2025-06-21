import * as attemptDao from "./dao.js";
import * as quizDao from "../Quizzes/dao.js";
import * as questionDao from "../Questions/dao.js";

export default function QuizAttemptRoutes(app) {
    
    // start a new quiz attempt
    app.post("/api/quizzes/:quizId/attempts", async (req, res) => {
    try {
        const currentUser = req.session["currentUser"];
        if (!currentUser || currentUser.role !== "STUDENT") {
            return res.status(403).json({ message: "Forbidden - Role check failed" });
        }

        const { quizId } = req.params;
        
        const quiz = await quizDao.findQuizById(quizId);

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        if (!quiz.published) {
            return res.status(403).json({ message: "Forbidden - Quiz not published" });
        }

        const canTake = await attemptDao.canStudentTakeQuiz(currentUser._id, quizId, quiz.maxAttempts);
        
        if (!canTake) {
            return res.status(403).json({ message: "Forbidden - Maximum attempts reached" });
        }

        const now = new Date();
        
        if (quiz.availableDate && now < quiz.availableDate) {
            return res.status(403).json({ message: "Forbidden - Quiz not yet available" });
        }
        if (quiz.untilDate && now > quiz.untilDate) {
            return res.status(403).json({ message: "Forbidden - Quiz no longer available" });
        }
        
        const attempt = await attemptDao.startNewAttempt(currentUser._id, quizId);
        res.status(201).json(attempt);
        
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

    // get quiz attempt by ID
    app.get("/api/quiz-attempts/:attemptId", async (req, res) => {
    try {
        const { attemptId } = req.params;
        const attempt = await attemptDao.findAttemptById(attemptId);

        if (!attempt) {
            return res.status(404).json({ message: "Attempt not found" });
        }
        
        res.json(attempt);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        }
    });

    // save answer during quiz (like auto-save)
    app.put("/api/quiz-attempts/:attemptId/answer", async (req, res) => {
        try {
            const { attemptId } = req.params;
            const { questionId, answer } = req.body;

            const updateResult = await attemptDao.saveAnswers(attemptId, questionId, answer);

            if (updateResult.modifiedCount === 0) {
                await attemptDao.addAnswer(attemptId, questionId, answer);
            }

            res.json({ success: true});
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    });

    app.post("/api/quiz-attempts/:attemptId/submit", async (req, res) => {
        try {
            const { attemptId } = req.params;
            const { answers } = req.body;

            const attempt = await attemptDao.findAttemptById(attemptId);
            if (!attempt) {
                return res.status(404).json({ message: "Not found" });
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
            res.status(500).json({ message: "Internal server error" });
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
            res.status(500).json({ message: "Internal server error" });
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
            res.status(500).json({ message: "Internal server error" });
        }
    });

}