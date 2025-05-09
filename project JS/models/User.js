const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
        },
        password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false // Never return password in queries
        },
        firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
        },
        lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
        },
        birthDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(v) {
            // Minimum age 13 years
            return v <= new Date(new Date().setFullYear(new Date().getFullYear() - 13));
            },
            message: 'You must be at least 13 years old'
        }
        },
        gender: {
        type: String,
        enum: {
            values: ['Male', 'Female', 'Other', 'Prefer not to say'],
            message: 'Invalid gender value'
        },
        required: true
        },
        institution: {
        type: String,
        required: true,
        enum: ['University A', 'University B', 'Other'] // Predefined list
        },
        program: {
        type: String,
        required: true,
        enum: ['2e année MIP', '3e année CS', 'Master DS'] // Example programs
        },
        role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student'
        },
        isVerified: {
        type: Boolean,
        default: false
        },
        lastLogin: Date,
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date
    }, {
        timestamps: true, // Adds createdAt and updatedAt
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
});
userSchema.pre('save', async function(next) {
        if (!this.isModified('password')) return next();
        
        this.password = await bcrypt.hash(this.password, 12);
        this.passwordChangedAt = Date.now() - 1000; // Ensure token is created after
        next();
});
    // Method to compare passwords
userSchema.methods.correctPassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

  // Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

  // Generate password reset token
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ institution: 1, program: 1 });
userSchema.index({ createdAt: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ 
    firstName: 'text',
    lastName: 'text',
    email: 'text'
    }, {
    weights: {
        firstName: 5,
        lastName: 5,
        email: 3
    }
});

userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('age').get(function() {
    const diff = Date.now() - this.birthDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});
