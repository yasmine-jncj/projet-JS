import { create, findOne } from '../models/user';
import { hash, compare } from 'bcrypt';

// Register a new user
export async function register(req, res) {
    try {
        const hashedPassword = await hash(req.body.password, 10);
        const user = await create({
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role
        });
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Login user
export async function login(req, res) {
    const user = await findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const validPassword = await compare(req.body.password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Invalid password" });

    res.json({ message: "Logged in successfully" });
}