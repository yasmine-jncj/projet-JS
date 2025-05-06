// models/Question.js
const questionSchema = new mongoose.Schema({
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    type: { type: String, enum: ['direct', 'qcm'], required: true },
    text: { type: String, required: true },
    media: { type: String }, // URL to image/audio/video
    tolerance: { 
        type: Number, 
        min: 0, 
        max: 100,
        validate: {
        validator: function(v) {
            return this.type === 'direct' ? true : v === undefined;
        },
        message: 'Tolerance only applies to direct questions' }},
    options: [{ text: String, isCorrect: Boolean }], // For QCM
    points: { type: Number, required: true },
    duration: { type: Number, required: true }, // Seconds//
    options: {
        type: [{
            text: { type: String, required: true },
            isCorrect: { type: Boolean, default: false }
        }],
        validate: [ // Ensure at least 1 correct option for QCM
            function(options) {
                if (this.type === 'qcm') {
                return options.some(opt => opt.isCorrect);
                }
                return true;
            },
            'QCM must have at least one correct option'
            ]
        }
});


// models/Question.js
questionSchema.index({ examId: 1 }); // All questions for an exam
questionSchema.index({ examId: 1, type: 1 }); // Filter by exam + question type (QCM/direct)
questionSchema.index({ points: 1 }); // For score calculation