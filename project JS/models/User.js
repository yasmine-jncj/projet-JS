// models/User.js
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthDate: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    institution: { type: String, required: true },
    program: { type: String, required: true }, // e.g., "2e année MIP"
    role: { type: String, enum: ['student', 'teacher'], required: true },
    createdAt: { type: Date, default: Date.now }
    });

const newUser = await User.create({
    email: "test@example.com",
    password: hashedPassword,
    role: "teacher"
});

// models/User.js
userSchema.index({ email: 1 }, { unique: true }); // Fast login + enforce uniqueness
userSchema.index({ role: 1 }); // Quickly filter teachers/students
userSchema.index({ institution: 1, program: 1 }); // For admin dashboards

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});