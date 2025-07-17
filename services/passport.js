const passport = require('passport');
const user = require('../models/user');
const config = require('../config');
const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;

const localOptions = {
    usernameField: 'email'
}

const localLogin = new LocalStrategy(localOptions, async (email, password, done) => {
    try {
        const existingUser = await user.findOne({ email: email });
        if (!existingUser) {
            return done(null, false, { error: 'Invalid email or password' });
        }
        existingUser.comparePassword(password, function (err, isMatch) {
            if (err) return done(err);
            if (!isMatch) return done(null, false, { error: 'Invalid email or password' });
            return done(null, existingUser);
        });
    } catch (err) {
        return done(err);
    }
});

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.secret
}

const jwtLogin = new jwtStrategy(jwtOptions, async (payload, done) => {
    try {
        const existingUser = await user.findById(payload.sub);
        if (existingUser) {
            done(null, existingUser);
        } else {
            done(null, false);
        }
    } catch (err) {
        done(err, false);
    }
});

passport.use(jwtLogin);
passport.use(localLogin);