const Exam = require('../models/exam');
const shortid = require('shortid');
const { body, validationResult } = require('express-validator');

// Validation rules
exports.validateCreateExam = [
    body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
    body('targetAudience').notEmpty().withMessage('Target audience is required')
];

// Create exam
exports.createExam = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const exam = await Exam.create({
        title: req.body.title,
        description: req.body.description,
        targetAudience: req.body.targetAudience,
        createdBy: req.user._id,
        accessLink: `https://yourapp.com/exam/${shortid.generate()}`,
        isActive: true
        });

        res.status(201).json(exam);
    } catch (err) {
        if (err.name === 'ValidationError') {
        return res.status(400).json({ error: Object.values(err.errors).map(e => e.message) });
        }
        res.status(500).json({ error: "Server error" });
    }
};

// List exams with pagination
exports.getExams = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [exams, total] = await Promise.all([
        Exam.find({ createdBy: req.user._id })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),
        Exam.countDocuments({ createdBy: req.user._id })
        ]);

        res.json({
        exams,
        totalPages: Math.ceil(total / limit),
        currentPage: page
        });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

// Get single exam (with ownership check)
exports.getExamById = async (req, res) => {
    try {
        const exam = await Exam.findOne({
        _id: req.params.id,
        createdBy: req.user._id
        });
        if (!exam) return res.status(404).json({ error: "Exam not found" });
        res.json(exam);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
