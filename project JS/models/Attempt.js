// models/Attempt.js
const attemptSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  geolocation: { lat: Number, lng: Number }, // From browser geolocation API
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    answer: { type: String }, // For direct questions
    selectedOptions: [{ type: Number }] // For QCM (array indices)
  }],
  score: { type: Number }, // Calculated after submission (out of 100)
  completedAt: { type: Date, default: Date.now }
});

// models/Attempt.js
attemptSchema.index({ examId: 1, studentId: 1 }, { unique: true }); // Prevent duplicate attempts
attemptSchema.index({ studentId: 1 }); // All attempts by a student
attemptSchema.index({ examId: 1, score: -1 }); // Leaderboard per exam
attemptSchema.index({ completedAt: -1 }); // Sort attempts by submission time