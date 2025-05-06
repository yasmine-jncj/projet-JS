const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const User = require('../models/user');
require('dotenv').config();

// 1. Local Strategy (for email/password login)
passport.use(
    new LocalStrategy(
        {
        usernameField: 'email', // Use email instead of username
        passwordField: 'password',
        },
        async (email, password, done) => {
        try {
            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
            return done(null, false, { message: 'Incorrect email or password' });
            }

            // Validate password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
            return done(null, false, { message: 'Incorrect email or password' });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
        }
    )
);

// 2. JWT Strategy (for protected API routes)
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

passport.use(
    new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
        try {
        const user = await User.findById(jwtPayload.id);
        if (user) {
            return done(null, user);
        }
        return done(null, false);
        } catch (err) {
        return done(err, false);
        }
    })
);

// (Optional) Session serialization for browser-based auth
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;