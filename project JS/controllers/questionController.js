const Question = require('../models/question');

// Add a question to an exam
exports.addQuestion = async (req, res) => {
    try {
        const question = await Question.create({
        examId: req.params.examId,
        type: req.body.type,
        text: req.body.text,
        options: req.body.options || null,
        tolerance: req.body.tolerance || null
        });
        res.status(201).json(question);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// controllers/questionController.js
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

exports.addQuestion = upload.single('media'), async (req, res) => {
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
    // Save mediaUrl to question
};

// Fetch questions for an exam
exports.getQuestions = async (req, res) => {
    const questions = await Question.find({ examId: req.params.examId });
    res.json(questions);
};