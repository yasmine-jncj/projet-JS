const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/user');

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per window
    message: 'Too many attempts, please try again later'
});

// JWT generation helper
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            iat: Date.now()
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
router.post('/login', 
    authLimiter,
    [
        check('email').isEmail().normalizeEmail().withMessage('Valid email required'),
        check('password').exists().withMessage('Password required')
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ 
            status: 'error',
            message: info?.message || 'Login failed'
            });
        }

      // Generate token
        const token = generateToken(user);

      // Set secure HTTP-only cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.json({
            status: 'success',
            token,
            user: {
            id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName
            }
        });
        })(req, res, next);
    }
    );

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
router.post('/register',
    [
        check('email').isEmail().normalizeEmail(),
        check('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/)
        .withMessage('Password must contain uppercase, lowercase, and number'),
        check('role').isIn(['student', 'teacher']),
        // Add other field validations...
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        try {
        // Check for existing user
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({
            status: 'fail',
            message: 'Email already in use'
            });
        }

        // Create new user
        const newUser = await User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role,
            // ... other fields
        });

      // Generate token
        const token = generateToken(newUser);

        res.status(201).json({
            status: 'success',
            token,
            user: {
            id: newUser._id,
            email: newUser.email,
            role: newUser.role
            }
        });

        } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
        }
    }
    );

    // @desc    Logout user
    // @route   GET /api/v1/auth/logout
    // @access  Private
    router.get('/logout', 
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        res.clearCookie('jwt');
        res.json({ status: 'success', message: 'Logged out successfully' });
    }
    );

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
    router.get('/me',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        res.json({
        status: 'success',
        data: {
            user: req.user
        }
        });
    }
    );

module.exports = router;
