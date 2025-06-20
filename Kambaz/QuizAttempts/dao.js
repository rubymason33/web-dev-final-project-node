import { v4 as uuidv4 } from 'uuid';
import model from "./model.js";

export function findAttemptById(attemptId) {
    model.findById(attemptId);
}

export function createAttempt(attempt) {
    const newAttempt = {...attempt, _id: uuidv4() };
    return model.create(newAttempt);
}

export function updateAttempt(attemptId, attemptUpdates) {
    model.updateOne({ _id: attemptId }, { $set: attemptUpdayes });
}

export function deleteAttempt(attemptId) {
    model.deleteOne({ _id: attemptId });
}

export function findAttemptsForStudentAndQuiz(studentId, quizId) {
    model.find({ student: studentId, quiz: quizId}).sort({ attemptNumber: -1});
}

export function findLatestAttemptForStudentAndQuiz(studentId, quizId) {
    model.findOne({ student: studentId, quiz: quizId}).sort({ attemptNumber: -1});
}

export function getAttemptCountForStudentAndQuiz(studentId, quizId) {
    model.countDocuments({ student: studentId, quiz: quizId});
}

export function findAttemptsForQuiz(quizId) {
    model.find({ quiz: quizId }).populate('student', 'firstName lastName username');
}

export const canStudentTakeQuiz = async (studentId, quizId, maxAttempts) => {
    const attemptCount = await getAttemptCountForStudentAndQuiz(studentId, quizId);
    return attemptCount < maxAttempts;
}

export const startNewAttempt = async (studentId, quizId) => {
    const attemptCount = await getAttemptCountForStudentAndQuiz(studentId, quizId);
    const newAttemptNumber = attemptCount + 1;

    const attempt = {
        __id: uuidv4(),
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
}

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
        { $set: { "answers.$.answer": answer }}
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
                    pointsEarner: 0
                }
            }
        }
    );
}