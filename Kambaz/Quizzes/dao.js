import { v4 as uuidv4 } from 'uuid';
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
    return model.findByIdAndUpdate(quizId, { $set: quizUpdates }, { new: true });
}

export function deleteQuiz(quizId) {
    return model.deleteOne({ _id: quizId});
}

export function publishQuiz(quizId) {
    return model.updateOne({ _id: quizId}, { $set: { published: true } });
}

export function findQuizById(quizId) {
    return model.findById(quizId);
}
