const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  examId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Exam', 
    required: true 
  },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  geolocation: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 2 && 
                  v[0] >= -180 && v[0] <= 180 && 
                  v[1] >= -90 && v[1] <= 90;
        },
        message: 'Invalid coordinates'
      }
    }
  },
  answers: [{
    questionId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Question',
      required: true 
    },
    answer: { 
      type: String,
      validate: {
        validator: function(v) {
          return !this.selectedOptions;
        }
      }
    },
    selectedOptions: {
      type: [Number],
      validate: {
        validator: function(v) {
          return !this.answer && 
                  v.every(index => Number.isInteger(index) && index >= 0);
        }
      }
    },
    answeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['in-progress', 'submitted', 'graded'],
    default: 'in-progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: Date,
  gradedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
attemptSchema.index({ examId: 1, studentId: 1 }, { unique: true });
attemptSchema.index({ studentId: 1 });
attemptSchema.index({ examId: 1, score: -1 });
attemptSchema.index({ geolocation: '2dsphere' }); // For geospatial queries
attemptSchema.index({ submittedAt: -1 });

// Virtual for duration (in minutes)
attemptSchema.virtual('duration').get(function() {
  if (!this.submittedAt) return null;
  return (this.submittedAt - this.startedAt) / (1000 * 60);
});

// Prevent modifying completed attempts
attemptSchema.pre('save', function(next) {
  if (this.isModified() && this.status === 'graded') {
    throw new Error('Cannot modify graded attempt');
  }
  next();
});

module.exports = mongoose.model('Attempt', attemptSchema);
