export { v4 as uuidv4 } from 'uuid';
import model from "./model.js";

export function findAllQuizzes() {
    return model.find({});
}

export function findQuizzesForCourse(courseId) {
    return model.find({ course: courseId });
}

export function createQuiz(quiz) {
    const newQuiz = {...quiz, _id: uuidv4() };
    return model.create(newQuiz);
}

export function updateQuiz(quizId, quizUpdates) {
    model.updateOne({ _id: quizId}, { $set: quizUpdates });
}

export function deleteQuiz(quizId) {
    model.deleteOne({ _id: quizId});
}

export function publishQuiz(quizId) {
    model.updateOne({ _id: quizId}, { $set: { published: true } });
}