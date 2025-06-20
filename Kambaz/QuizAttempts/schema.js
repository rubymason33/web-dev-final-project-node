import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema({
  _id: String,
  quiz: { type: String, ref: "QuizModel", required: true },
  student: { type: String, ref: "UserModel", required: true },
  attemptNumber: { type: Number, required: true },
  answers: [{
    question: { type: String, ref: "QuestionModel" },
    answer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    pointsEarned: Number
  }],
  score: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  startedAt: Date,
  completedAt: Date,
}, { collection: "quizAttempts" });

export default quizAttemptSchema;