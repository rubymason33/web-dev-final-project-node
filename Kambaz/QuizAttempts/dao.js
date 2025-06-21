import { v4 as uuidv4 } from 'uuid';
import model from "./model.js";

export function findAttemptById(attemptId) {
    return model.findById(attemptId); // Added return
}

export function createAttempt(attempt) {
    const newAttempt = { ...attempt, _id: uuidv4() };
    return model.create(newAttempt);
}

export function updateAttempt(attemptId, attemptUpdates) {
    return model.updateOne({ _id: attemptId }, { $set: attemptUpdates }); // Fixed typo: attemptUpdayes -> attemptUpdates, added return
}

export function deleteAttempt(attemptId) {
    return model.deleteOne({ _id: attemptId }); // Added return
}

export function findAttemptsForStudentAndQuiz(studentId, quizId) {
    return model.find({ student: studentId, quiz: quizId }).sort({ attemptNumber: -1 }); // Added return
}

export function findLatestAttemptForStudentAndQuiz(studentId, quizId) {
    return model.findOne({ student: studentId, quiz: quizId }).sort({ attemptNumber: -1 }); // Added return
}

export function getAttemptCountForStudentAndQuiz(studentId, quizId) {
    return model.countDocuments({ student: studentId, quiz: quizId }); // Added return
}

export function findAttemptsForQuiz(quizId) {
    return model.find({ quiz: quizId }).populate('student', 'firstName lastName username'); // Added return
}

export const canStudentTakeQuiz = async (studentId, quizId, maxAttempts) => {
    const attemptCount = await getAttemptCountForStudentAndQuiz(studentId, quizId);
    return attemptCount < maxAttempts;
};

export const startNewAttempt = async (studentId, quizId) => {
    const attemptCount = await getAttemptCountForStudentAndQuiz(studentId, quizId);
    const newAttemptNumber = attemptCount + 1;

    const attempt = {
        _id: uuidv4(), // Fixed typo: __id -> _id
        quiz: quizId,
        student: studentId,
        attemptNumber: newAttemptNumber,
        answers: [],
        score: 0,
        totalPoints: 0,
        percentage: 0,
        startedAt: new Date()
    };
    return model.create(attempt);
};

export function submitAttempt(attemptId, answers, score, totalPoints) {
    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

    return model.updateOne(
        { _id: attemptId },
        {
            $set: {
                answers,
                score,
                totalPoints,
                percentage,
                completedAt: new Date()
            }
        }
    );
}

export function saveAnswers(attemptId, questionId, answer) {
    return model.updateOne(
        { _id: attemptId, "answers.question": questionId },
        { $set: { "answers.$.answer": answer } }
    );
}

export function addAnswer(attemptId, questionId, answer) {
    return model.updateOne(
        {
            _id: attemptId
        },
        {
            $push: {
                answers: {
                    question: questionId,
                    answer: answer,
                    isCorrect: false,
                    pointsEarned: 0
                }
            }
        }
    );
}