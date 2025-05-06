const express = require('express');
const { createExam, getExams } = require('../controllers/examController');
const authMiddleware = require('../middlewares/auth'); // Protect routes
const router = express.Router();
const exam = await Exam.create({
    title: "Midterm 2025",
    createdBy: teacherUserId,
    uniqueLink: generatedLink
});
const exams = await Exam.find({ createdBy: teacherUserId });

router.post('/', authMiddleware, createExam);
router.get('/', authMiddleware, getExams);

module.exports = router;
// routes/exams.js
const shortid = require('shortid');
const Exam = require('../models/Exam');

router.post('/generate-link', async (req, res) => {
    const { examId } = req.body;
    
    try {
        // 1. Find the exam
        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ error: 'Exam not found' });

        // 2. Generate unique link
        const uniqueId = shortid.generate();
        const examLink = `${req.protocol}://${req.get('host')}/exam/${uniqueId}`;

        // 3. Save to database
        exam.uniqueLink = examLink;
        await exam.save();

        // 4. Send back the link
        res.json({ link: examLink });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;