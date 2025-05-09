const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middlewares/auth');
const { check, validationResult } = require('express-validator');
const Question = require('../models/question');

// Input validation rules
const validateQuestion = [
    check('text', 'Question text is required').notEmpty().trim(),
    check('type', 'Invalid question type').isIn(['qcm', 'direct']),
    check('points', 'Points must be between 0.5 and 20').isFloat({ min: 0.5, max: 20 }),
    check('duration', 'Duration must be between 10 and 600 seconds').isInt({ min: 10, max: 600 }),
    
    // Conditional validation based on question type
    check('options').custom((value, { req }) => {
        if (req.body.type === 'qcm') {
        if (!Array.isArray(value) || value.length < 2) {
            throw new Error('QCM must have at least 2 options');
        }
        if (!value.some(opt => opt.isCorrect)) {
            throw new Error('QCM must have at least 1 correct option');
        }
        }
        return true;
    }),
    check('answer').custom((value, { req }) => {
        if (req.body.type === 'direct' && !value) {
        throw new Error('Direct questions require an answer');
        }
        return true;
    })
];

// @desc    Add a question to an exam
// @route   POST /api/v1/exams/:examId/questions
// @access  Private/Teacher
router.post(
    '/:examId/questions',
    authMiddleware,
    questionController.restrictTo('teacher'),
    validateQuestion,
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        // Verify exam exists and belongs to teacher
        const exam = await Exam.findOne({
        _id: req.params.examId,
        createdBy: req.user.id
        });
        if (!exam) {
        return res.status(404).json({
            status: 'fail',
            message: 'Exam not found or you are not the owner'
        });
        }

        next();
    },
    questionController.addQuestion
);

// @desc    Get all questions for an exam
// @route   GET /api/v1/exams/:examId/questions
// @access  Private (Teacher or Student if exam is active)
router.get(
    '/:examId/questions',
    authMiddleware,
    questionController.getQuestions
);

// @desc    Update a question
// @route   PATCH /api/v1/questions/:id
// @access  Private/Teacher
router.patch(
    '/questions/:id',
    authMiddleware,
    questionController.restrictTo('teacher'),
    validateQuestion,
    questionController.updateQuestion
);

// @desc    Delete a question
// @route   DELETE /api/v1/questions/:id
// @access  Private/Teacher
router.delete(
    '/questions/:id',
    authMiddleware,
    questionController.restrictTo('teacher'),
    questionController.deleteQuestion
);

module.exports = router;
