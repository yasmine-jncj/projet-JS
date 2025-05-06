// modals/Exam.js
const examSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    targetGroup: { type: String, required: true }, // e.g., "S4, groupe A"
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uniqueLink: { type: String, unique: true }, // Generated automatically
    createdAt: { type: Date, default: Date.now },
    duree: { type: Number, min: 1 }, // Ensure positive duration (minutes)
});

// models/Exam.js
examSchema.index({ createdBy: 1 });
examSchema.index({ uniqueLink: 1 }, { unique: true });
examSchema.index({ createdAt: -1 });
examSchema.index({ createdBy: 1, createdAt: -1 });

// routes/exams.js
const express = require('express');
const router = express.Router();
const shortid = require('shortid');
const Exam = require('./Exam'); // Your exam model

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