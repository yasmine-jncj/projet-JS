const Attempt = require('../models/attempt');
const Exam = require('../models/exam');

exports.submitAttempt = async (req, res) => {
    try {
        // 1) Validate exam exists and is active
        const exam = await Exam.findOne({
        _id: req.params.examId,
        status: 'active'
        });
        if (!exam) {
        return res.status(404).json({
            status: 'fail',
            message: 'Exam not found or not active'
        });
    }

    // 2) Prevent duplicate attempts
    const existingAttempt = await Attempt.findOne({
        examId: req.params.examId,
        studentId: req.user.id
    });
    if (existingAttempt) {
        return res.status(400).json({
            status: 'fail',
            message: 'You have already attempted this exam'
        });
    }

    // 3) Create attempt
    const attempt = await Attempt.create({
        examId: req.params.examId,
        studentId: req.user.id,
        geolocation: {
            type: 'Point',
            coordinates: [req.body.geolocation.lng, req.body.geolocation.lat]
        },
        answers: req.body.answers,
        score: calculateScore(req.body.answers, exam.questions),
        startedAt: new Date(req.body.startedAt),
        submittedAt: new Date()
    });

    res.status(201).json({
        status: 'success',
        data: { attempt }
    });

    } catch (err) {
    res.status(400).json({
        status: 'fail',
        message: err.message
    });
    }
};

exports.getExamStats = async (req, res) => {
    try {
        const stats = await Attempt.aggregate([
        { $match: { examId: mongoose.Types.ObjectId(req.params.examId) } },
        {
            $group: {
                _id: null,
                avgScore: { $avg: '$score' },
                minScore: { $min: '$score' },
                maxScore: { $max: '$score' },
                passRate: {
                    $avg: {
                        $cond: [{ $gte: ['$score', exam.passingScore] }, 1, 0]
                    }
                },
                totalAttempts: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: stats[0] || {
            avgScore: 0,
            minScore: 0,
            maxScore: 0,
            passRate: 0,
            totalAttempts: 0
        }
    });
} catch (err) {
    res.status(500).json({
        status: 'error',
        message: 'Failed to calculate statistics'
        });
    }
};
