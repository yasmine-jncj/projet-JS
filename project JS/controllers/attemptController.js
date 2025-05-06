const Attempt = require('../models/attempt.js');

// Record a student's attempt
exports.submitAttempt = async (req, res) => {
    try {
        const attempt = await Attempt.create({
        examId: req.params.examId,
        studentId: req.user._id,
        answers: req.body.answers,
        score: calculateScore(req.body.answers) // Implement your scoring logic
        });
        res.status(201).json(attempt);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Calculate average score for an exam
exports.getExamStats = async (req, res) => {
    const stats = await Attempt.aggregate([
        { $match: { examId: req.params.examId } },
        { $group: { _id: null, avgScore: { $avg: "$score" } } }
    ]);
    res.json(stats[0] || { avgScore: 0 });
};