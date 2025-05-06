require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const shortid = require('shortid');
const passport = require('./config/passport');



const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));
app.use(session({
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions' // Optional (defaults to 'sessions')
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));
app.use(passport.initialize());
app.use(passport.session());

const fs = require('fs');
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
app.use(helmet()); // Security headers
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // Rate limiting

const multer = require('multer');
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Example route for file uploads
app.post('/api/upload', upload.single('media'), (req, res) => {
    res.json({ url: `/uploads/${req.file.filename}` });
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://hadriyassmine3:<db_password>@cluster0.nklzkxb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Models
const User = mongoose.model('User', UserSchema);
const Exam = mongoose.model('Exam', ExamSchema);
const Question = mongoose.model('Question', QuestionSchema);
const Submission = mongoose.model('Submission', SubmissionSchema);


// Passport Configuration
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
        const user = await User.findOne({ username });
        if (!user) return done(null, false);
        if (!await bcrypt.compare(password, user.password)) return done(null, false);
        return done(null, user);
        } catch (err) {
        return done(err);
        }
    }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Helper Functions
const generateAccessCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const generateUniqueLink = () => {
    return `https://${process.env.DOMAIN || 'localhost:3000'}/exam/${shortid.generate()}`;
};

// Middleware
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: 'Unauthorized' });
    };

    const ensureTeacher = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'teacher') return next();
    res.status(403).json({ error: 'Teacher access required' });
};

app.use('/uploads', express.static('uploads'));

// Routes

// Auth Routes
app.post('/api/login', passport.authenticate('local'), (req, res) => {
    res.json({ 
        success: true, 
        user: { 
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
        institution: req.user.institution
        } 
    });
});

app.post('/api/logout', (req, res) => {
    req.logout();
    res.json({ success: true });
});

app.post('/api/register', async (req, res) => {
    try {
        const { username, password, role, institution } = req.body;
        const user = new User({ username, password, role, institution });
        await user.save();
        res.status(201).json({ success: true });
    } catch (error) {
        if (error.code === 11000) {
        res.status(400).json({ error: 'Username already exists' });
        } else {
        res.status(400).json({ error: 'Registration failed' });
        }
    }
});

// Exam Routes with Unique Link Generation
app.post('/api/exams', ensureTeacher, async (req, res) => {
    try {
        const { title, description, duration } = req.body;
        const exam = new Exam({
        title,
        description,
        duration,
        accessCode: generateAccessCode(),
        uniqueLink: generateUniqueLink(), // Generate unique link here
        teacherId: req.user.id
        });
        await exam.save();
        res.status(201).json(exam);
    } catch (error) {
        res.status(400).json({ error: 'Exam creation failed' });
    }
});

// New Endpoint: Generate Unique Link for Existing Exam
app.post('/api/exams/:id/generate-link', ensureTeacher, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ error: 'Exam not found' });
        if (exam.teacherId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ error: 'Not authorized' });
        }
    
    exam.uniqueLink = generateUniqueLink();
    await exam.save();
    
    res.json({ link: exam.uniqueLink });
    } catch (error) {
    res.status(500).json({ error: 'Failed to generate link' });
    }
});

// Get exam by unique link
app.get('/api/exams/link/:linkId', ensureAuthenticated, async (req, res) => {
    try {
        const exam = await Exam.findOne({ uniqueLink: `https://${process.env.DOMAIN || 'localhost:3000'}/exam/${req.params.linkId}` });
        if (!exam) return res.status(404).json({ error: 'Exam not found' });
        res.json(exam);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch exam' });
    }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

// Error handling
const { errorHandler } = require('./middlewares/error');
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});