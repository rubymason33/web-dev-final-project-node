import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    _id: String,
    quiz: { type: String, ref: "QuizModel", required: true },
    title: { type: String, required: true },
    questionType: {
        type: String,
        enum: ["Multiple Choice", "True/False", "Fill in the Blank"],
        required: true
    },
    points: { type: Number, default: 1 },
    questionText: { type: String, required: true },
    
    // multiple choice
    choices: [{
        text: String,
        isCorrect: { type: Boolean, default: false }
    }],
    
    // true/false
    correctAnswer: Boolean,
    
    // fill in the Blank
    possibleAnswers: [String],
    caseSensitive: { type: Boolean, default: false },
    
    order: { type: Number, default: 0 },
    
}, { collection: "questions" });

export default questionSchema;