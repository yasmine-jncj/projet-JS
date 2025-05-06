const express = require('express');
const { submitAttempt, getExamStats } = require('../controllers/attemptController');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

await Attempt.create({
    examId: examId,
    studentId: studentUserId,
    answers: [
        { questionId: "q1", answer: "4" }
    ],
    score: 100
});
const stats = await Attempt.aggregate([
    { $match: { examId: examId } },
    { $group: { _id: null, avgScore: { $avg: "$score" } } }
]);

router.post('/:examId/attempts', authMiddleware, submitAttempt);
router.get('/:examId/stats', authMiddleware, getExamStats);

module.exports = router;