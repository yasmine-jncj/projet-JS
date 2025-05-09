const Question = require('../models/question');
const { body, validationResult } = require('express-validator');
const path = require('path');

// Configure multer as shown above
const upload = multer({ /*...*/ });

// Validation rules
exports.validateQuestion = [
    body('type').isIn(['qcm', 'direct']),
    body('text').notEmpty().trim(),
    body('points').isInt({ min: 1 }),
    body('timeLimit').isInt({ min: 10 }) // Min 10 seconds
];

// Add question (with media support)
exports.addQuestion = [
    upload.single('media'),
    async (req, res) => {
        try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Validate question type specifics
        if (req.body.type === 'qcm' && (!req.body.options || req.body.options.length < 2)) {
            return res.status(400).json({ error: 'QCM requires at least 2 options' });
        }

        if (req.body.type === 'direct' && !req.body.answer) {
            return res.status(400).json({ error: 'Direct question requires an answer' });
        }

      // Build question data
        const questionData = {
            examId: req.params.examId,
            type: req.body.type,
            text: req.body.text,
            points: req.body.points,
            timeLimit: req.body.timeLimit,
            mediaUrl: req.file ? `/uploads/questions/${req.file.filename}` : null
        };

      // Type-specific fields
        if (req.body.type === 'qcm') {
            questionData.options = req.body.options;
        } else {
            questionData.answer = req.body.answer;
            questionData.tolerance = req.body.tolerance || 0;
        }

        const question = await Question.create(questionData);
        res.status(201).json(question);

        } catch (err) {
        // Handle file upload errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large (max 10MB)' });
        }
        res.status(400).json({ error: err.message });
        }
    }
];

// Get questions with optional filtering
exports.getQuestions = async (req, res) => {
    try {
        const questions = await Question.find({ 
        examId: req.params.examId,
        ...(req.query.type && { type: req.query.type }) // Filter by type if provided
        }).sort({ createdAt: 1 }); // Oldest first

        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};
