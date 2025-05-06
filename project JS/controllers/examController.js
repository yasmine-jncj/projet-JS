const Exam = require('../models/Exam');
const shortid = require('shortid');

// Create an exam
exports.createExam = async (req, res) => {
    try {
        const exam = await Exam.create({
        title: req.body.title,
        createdBy: req.user._id, // From auth middleware
        uniqueLink: `https://yourapp.com/exam/${shortid.generate()}`
        });
        res.status(201).json(exam);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// List exams for a teacher
exports.getExams = async (req, res) => {
    const exams = await Exam.find({ createdBy: req.user._id });
    res.json(exams);
};