const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT
const generateJWT = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};

// Local login route
router.post('/login', 
    passport.authenticate('local', { session: false }),
    (req, res) => {
        const token = generateJWT(req.user);
        res.json({ 
        token,
        user: {
            id: req.user._id,
            email: req.user.email,
            role: req.user.role
        }
        });
    }
);

// Protected test route (for development)
router.get('/protected',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        res.json({ 
        message: 'You accessed a protected route',
        user: req.user 
        });
    }
);


const { firstName, lastName, birthDate, gender, institution, program, role, password } = req.body;

module.exports = router;