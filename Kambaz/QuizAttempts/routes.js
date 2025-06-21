// Enhanced QuizAttemptRoutes with better date/restriction checking

import * as attemptDao from "./dao.js";
import * as quizDao from "../Quizzes/dao.js";
import * as questionDao from "../Questions/dao.js";

export default function QuizAttemptRoutes(app) {
    
    // Helper function to check quiz availability
    const checkQuizAvailability = (quiz) => {
        const now = new Date();
        
        // Check if quiz is published
        if (!quiz.published) {
            return { canStart: false, reason: "Quiz is not yet published" };
        }
        
        // Check availability date
        if (quiz.availableDate && new Date(quiz.availableDate) > now) {
            return { 
                canStart: false, 
                reason: `Quiz is not available until ${new Date(quiz.availableDate).toLocaleDateString()}` 
            };
        }
        
        // Check until date
        if (quiz.untilDate && new Date(quiz.untilDate) < now) {
            return { 
                canStart: false, 
                reason: `Quiz availability ended on ${new Date(quiz.untilDate).toLocaleDateString()}` 
            };
        }
        
        // Check due date (if it's a hard deadline)
        if (quiz.dueDate && new Date(quiz.dueDate) < now) {
            return { 
                canStart: false, 
                reason: `Quiz due date has passed (${new Date(quiz.dueDate).toLocaleDateString()})` 
            };
        }
        
        return { canStart: true };
    };
    
    // start a new quiz attempt
    app.post("/api/quizzes/:quizId/attempts", async (req, res) => {
    try {
        console.log("START QUIZ ATTEMPT DEBUG");
        console.log("Quiz ID:", req.params.quizId);
        
        const currentUser = req.session["currentUser"];
        console.log("Current user:", currentUser);
        console.log("User role:", currentUser?.role);

        if (!currentUser || currentUser.role !== "STUDENT") {
            console.log("FORBIDDEN: Role check failed");
            return res.status(403).json({ message: "Only students can take quizzes" });
        }

        const { quizId } = req.params;
        console.log("Fetching quiz with ID:", quizId);
        
        const quiz = await quizDao.findQuizById(quizId);
        console.log("Quiz found:", !!quiz);

        if (!quiz) {
            console.log("ERROR: Quiz not found");
            return res.status(404).json({ message: "Quiz not found" });
        }

        // Check quiz availability
        const availabilityCheck = checkQuizAvailability(quiz);
        if (!availabilityCheck.canStart) {
            console.log("ERROR: Quiz not available -", availabilityCheck.reason);
            return res.status(403).json({ message: availabilityCheck.reason });
        }

        console.log("Checking attempt limits...");
        const canTake = await attemptDao.canStudentTakeQuiz(currentUser._id, quizId, quiz.maxAttempts);
        console.log("Can take quiz:", canTake);
        
        if (!canTake) {
            console.log("ERROR: Maximum attempts reached");
            return res.status(403).json({ 
                message: `You have reached the maximum number of attempts (${quiz.maxAttempts}) for this quiz` 
            });
        }

        console.log("Creating new attempt...");
        const attempt = await attemptDao.startNewAttempt(currentUser._id, quizId);
        console.log("Attempt created:", attempt);
        
        res.status(201).json(attempt);
        
    } catch (error) {
        console.error("QUIZ ATTEMPT ERROR");
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        console.error("END ERROR");
        res.status(500).json({ message: "Internal server error", error: error.message });
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
        console.error("Error getting attempt:", error);
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
            console.error("Error saving answer:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });

    app.post("/api/quiz-attempts/:attemptId/submit", async (req, res) => {
        try {
            console.log("SUBMIT QUIZ ATTEMPT DEBUG");
            const { attemptId } = req.params;
            const { answers } = req.body;

            console.log("Attempt ID:", attemptId);
            console.log("Answers received:", answers);

            const attempt = await attemptDao.findAttemptById(attemptId);
            if (!attempt) {
                console.log("ERROR: Attempt not found");
                return res.status(404).json({ message: "Attempt not found" });
            }

            console.log("Found attempt for quiz:", attempt.quiz);
            const questions = await questionDao.findQuestionsForQuiz(attempt.quiz);
            console.log("Found questions:", questions.length);

            let totalScore = 0;
            let totalPoints = 0;

            const gradedAnswers = answers.map(answer => {
                const question = questions.find(q => q._id === answer.question);
                if (!question) {
                    console.log("WARNING: Question not found for ID:", answer.question);
                    return answer;
                }

                totalPoints += question.points;
                let isCorrect = false;
                let pointsEarned = 0;

                console.log(`Grading question ${question._id} (${question.questionType})`);
                console.log("Student answer:", answer.answer);

                switch (question.questionType) {
                    case "Multiple Choice":
                        const correctChoice = question.choices.find(choice => choice.isCorrect);
                        isCorrect = correctChoice && answer.answer === correctChoice.text;
                        console.log("Correct choice:", correctChoice?.text);
                        break;

                    case "True/False":
                        isCorrect = answer.answer === question.correctAnswer;
                        console.log("Correct answer:", question.correctAnswer);
                        break;
                    
                    case "Fill in the Blank":
                        if (answer.answer && question.possibleAnswers) {
                            const studentAnswer = question.caseSensitive ? answer.answer : answer.answer.toLowerCase();
                            const possibleAnswers = question.caseSensitive
                                ? question.possibleAnswers
                                : question.possibleAnswers.map(a => a.toLowerCase());
                            isCorrect = possibleAnswers.includes(studentAnswer);
                            console.log("Possible answers:", possibleAnswers);
                            console.log("Student answer (processed):", studentAnswer);
                        }
                        break;
                }

                if (isCorrect) {
                    pointsEarned = question.points;
                    totalScore += pointsEarned;
                }

                console.log(`Question ${question._id}: ${isCorrect ? 'CORRECT' : 'INCORRECT'} - ${pointsEarned}/${question.points} points`);

                return {
                    ...answer,
                    isCorrect,
                    pointsEarned
                };
            });

            console.log("Total score:", totalScore);
            console.log("Total points:", totalPoints);

            await attemptDao.submitAttempt(attemptId, gradedAnswers, totalScore, totalPoints, new Date());
            const gradedAttempt = await attemptDao.findAttemptById(attemptId);
            
            console.log("SUBMIT COMPLETE");
            res.json({
                ...gradedAttempt,
                score: totalScore,
                totalPoints: totalPoints,
                answers: gradedAnswers
            });
            
        } catch (error) {
            console.error("SUBMIT QUIZ ERROR");
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
            console.error("END ERROR");
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    });

    // get student's attempts for a quiz
    app.get("/api/quizzes/:quizId/attempts", async (req, res) => {
        try {
            const currentUser = req.session["currentUser"];
            const { quizId } = req.params;

            if (!currentUser) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            
            let attempts;
            if (currentUser.role === "FACULTY" || currentUser.role === "ADMIN") {
                attempts = await attemptDao.findAttemptsForQuiz(quizId);
            } else {
                attempts = await attemptDao.findAttemptsForStudentAndQuiz(currentUser._id, quizId);
            }
            res.json(attempts);
        } catch (error) {
            console.error("Error getting attempts:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });

    // get latest attempt for student and quiz
    app.get("/api/quizzes/:quizId/latest-attempt", async (req, res) => {
        try {
            const currentUser = req.session["currentUser"];
            const { quizId } = req.params;
            
            if (!currentUser) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            
            const attempt = await attemptDao.findLatestAttemptForStudentAndQuiz(currentUser._id, quizId);
            if (!attempt) {
                return res.status(404).json({ message: "No attempts found" });
            }
            
            res.json(attempt);
        } catch (error) {
            console.error("Error getting latest attempt:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
}