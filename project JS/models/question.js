const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    examId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Exam', 
        required: true,
        immutable: true 
    },
    type: { 
        type: String, 
        enum: ['direct', 'qcm'], 
        required: true 
    },
    text: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 1000 
    },
    media: {
        url: String,
        type: {
        type: String,
        enum: ['image', 'audio', 'video', null],
        default: null
        },
        altText: String
    },
    points: { 
        type: Number, 
        required: true,
        min: 0.5,
        max: 20 
    },
    duration: {  // in seconds
        type: Number,
        required: true,
        min: 10,  // min 10 seconds per question
        max: 600  // max 10 minutes per question
    },
    // For direct questions
    answer: {
        type: String,
        required: function() { return this.type === 'direct'; }
    },
    tolerance: {  // percentage
        type: Number,
        min: 0,
        max: 100,
        default: 0,
        validate: {
        validator: function(v) {
            return this.type === 'direct';
        },
        message: 'Tolerance only applies to direct questions'
        }
    },
    // For QCM questions
    options: {
        type: [{
        text: { 
            type: String, 
            required: true,
            trim: true,
            maxlength: 200 
        },
        isCorrect: { 
            type: Boolean, 
            default: false,
            required: function() { return this.parent().type === 'qcm'; }
        }
        }],
        validate: [
        {
            validator: function(options) {
            if (this.type !== 'qcm') return true;
            return options.length >= 2 && options.some(opt => opt.isCorrect);
            },
            message: 'QCM must have ≥2 options with ≥1 correct answer'
        }
        ]
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    }
    }, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
questionSchema.index({ examId: 1 });
questionSchema.index({ examId: 1, type: 1 });
questionSchema.index({ points: 1 });
questionSchema.index({ createdAt: -1 });

// Virtual for media presence
questionSchema.virtual('hasMedia').get(function() {
    return !!this.media?.url;
});

// Prevent modifying questions after exam starts
questionSchema.pre('save', async function(next) {
    if (this.isModified() && !this.isNew) {
        const exam = await mongoose.model('Exam').findById(this.examId);
        if (exam?.status !== 'draft') {
        throw new Error('Cannot modify questions after exam starts');
        }
    }
    next();
});

module.exports = mongoose.model('Question', questionSchema);
