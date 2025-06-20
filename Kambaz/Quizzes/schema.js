import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  _id: String,
  title: { type: String, required: true },
  description: String,
  course: { type: String, ref: "CourseModel", required: true },
  createdBy: { type: String, ref: "UserModel", required: true },
  quizType: {
    type: String,
    enum: ["Graded Quiz", "Practice Quiz", "Graded Survey", "Ungraded Survey"],
    default: "Graded Quiz"
  },
  points: { type: Number, default: 0 },
  assignmentGroup: {
    type: String,
    enum: ["Quizzes", "Exams", "Assignments", "Project"],
    default: "Quizzes"
  },
  shuffleAnswers: { type: Boolean, default: true },
  timeLimit: { type: Number, default: 20 },
  multipleAttempts: { type: Boolean, default: false },
  maxAttempts: { type: Number, default: 1 },
  showCorrectAnswers: {
    type: String,
    enum: ["Immediately", "After Due Date", "After Last Attempt", "Never", "On Specific Date"],
    default: "Immediately"
  },
  showCorrectAnswersDate: Date,
  accessCode: { type: String, default: "" },
  oneQuestionAtTime: { type: Boolean, default: true },
  webcamRequired: { type: Boolean, default: false },
  lockQuestionsAfterAnswering: { type: Boolean, default: false },
  dueDate: Date,
  availableDate: Date,
  untilDate: Date,
  published: { type: Boolean, default: false }
}, { collection: "quizzes" });

export default quizSchema;