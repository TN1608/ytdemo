const passport = require('passport');
const { getUserByEmail, comparePassword } = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const PROVIDER = require('../config/enum/provider');
const { db } = require('../config/firebase');
const { doc, updateDoc } = require('firebase/firestore');

// Local Strategy
const localOptions = { usernameField: 'email' };
const localLogin = new LocalStrategy(localOptions, async (email, password, done) => {
    try {
        const user = await getUserByEmail(email);
        if (!user) {
            return done(null, false, { error: 'Invalid email or password' });
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return done(null, false, { error: 'Invalid email or password' });
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
});

// JWT Strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.secret,
};
const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        const user = await getUserByEmail(payload.sub);
        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }
    } catch (err) {
        done(err, false);
    }
});

// Google Strategy
const googleOptions = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    scope: ['profile', 'email'],
};
const googleLogin = new GoogleStrategy(googleOptions, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        let user = await getUserByEmail(email);
        if (user) {
            await updateDoc(doc(db, 'users', email), {
                provider: PROVIDER.GOOGLE,
                verified: true,
            });
            user = await getUserByEmail(email);
            return done(null, user);
        }

        user = await createUser({
            email,
            provider: PROVIDER.GOOGLE,
            verified: true,
        });
        done(null, user);
    } catch (err) {
        done(err, false);
    }
});

passport.use(jwtLogin);
passport.use(localLogin);
passport.use(googleLogin);