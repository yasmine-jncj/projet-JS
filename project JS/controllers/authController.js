import { create, findOne } from '../models/user';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

// Validation middleware
export const validateRegister = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('role').isIn(['student', 'teacher'])
];

export const validateLogin = [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
];

// Helper function
function isPasswordStrong(password) {
    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password);
}

// Register a new user
export async function register(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        if (!isPasswordStrong(req.body.password)) {
        return res.status(400).json({ 
            error: "Password must contain uppercase, lowercase, and numbers"
        });
        }

        const existingUser = await findOne({ email: req.body.email });
        if (existingUser) return res.status(400).json({ error: "Email already exists" });

        const hashedPassword = await hash(req.body.password, 10);
        const user = await create({
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role
        });

        res.status(201).json({ userId: user._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Login user
export async function login(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const user = await findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ error: "User not found" });

        const validPassword = await compare(req.body.password, user.password);
        if (!validPassword) return res.status(401).json({ error: "Invalid password" });

        const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

        res.json({ token, userId: user._id, role: user.role });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
}
