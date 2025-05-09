const mongoose = require('mongoose');
const shortid = require('shortid');

const examSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Exam title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    targetGroup: {
        type: String,
        required: [true, 'Target group is required'],
        enum: {
        values: ['S4 groupe A', 'S4 groupe B', '2e année MIP'], // Example groups
        message: 'Invalid target group'
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        immutable: true // Prevent changing after creation
    },
    uniqueLink: {
        type: String,
        unique: true,
        immutable: true // Prevent link modification
    },
    duration: { // Renamed from "duree" for consistency
        type: Number,
        required: [true, 'Duration is required'],
        min: [1, 'Duration must be at least 1 minute'],
        max: [300, 'Duration cannot exceed 300 minutes (5 hours)']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    maxAttempts: {
        type: Number,
        default: 1,
        min: 1
    }
    }, {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true }, // Include virtuals when converted to JSON
    toObject: { virtuals: true }
    });

    // Virtual for question count
    examSchema.virtual('questionCount', {
    ref: 'Question',
    localField: '_id',
    foreignField: 'examId',
    count: true
    });

    // Pre-save hook for link generation
    examSchema.pre('save', function(next) {
    if (!this.uniqueLink) {
        this.uniqueLink = `${process.env.BASE_URL}/exam/${shortid.generate()}`;
    }
    next();
});

// Indexes
examSchema.index({ createdBy: 1 });
examSchema.index({ uniqueLink: 1 }, { unique: true });
examSchema.index({ createdAt: -1 });
examSchema.index({ isActive: 1 });
examSchema.index({ targetGroup: 1 });

module.exports = mongoose.model('Exam', examSchema);
