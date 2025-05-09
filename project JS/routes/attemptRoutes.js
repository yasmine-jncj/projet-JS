const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attemptController');
const authMiddleware = require('../middlewares/auth');
const { check } = require('express-validator');

// Submit exam attempt
router.post(
    '/exams/:examId/attempts',
    authMiddleware,
    [
        check('answers').isArray().withMessage('Answers must be an array'),
        check('answers.*.questionId').isMongoId(),
        check('answers.*.answer').optional().isString(),
        check('answers.*.selectedOptions').optional().isArray(),
        check('geolocation.lat').isFloat({ min: -90, max: 90 }),
        check('geolocation.lng').isFloat({ min: -180, max: 180 })
    ],
    attemptController.submitAttempt
);

// Get exam statistics (teacher only)
router.get(
    '/exams/:examId/stats',
    authMiddleware,
    attemptController.restrictTo('teacher'),
    attemptController.getExamStats
);

// Get user's attempt history
router.get(
    '/me/attempts',
    authMiddleware,
    attemptController.restrictTo('student'),
    attemptController.getMyAttempts
);

module.exports = router;
