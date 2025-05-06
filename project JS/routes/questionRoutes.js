const express = require('express');
const { addQuestion, getQuestions } = require('../controllers/questionController');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();
await Question.create({
    examId: examId,
    type: "qcm",
    text: "What is 2+2?",
    options: [
        { text: "3", isCorrect: false },
        { text: "4", isCorrect: true }
        ]
});
const questions = await Question.find({ examId: examId });

router.post('/:examId/questions', authMiddleware, addQuestion);
router.get('/:examId/questions', authMiddleware, getQuestions);

module.exports = router;