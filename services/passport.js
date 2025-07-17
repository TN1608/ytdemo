const passport = require('passport');
const user = require('../models/user');
const config = require('../config');
const PROVIDER = require("../config/enum/provider");
const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

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


// Google OAuth Strategy
const googleOptions = {
    clientID: config.clientID,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL
};

const googleLogin = new GoogleStrategy(googleOptions, async (accessToken, refreshToken, profile, done) => {
    try{
    //     Tim kiem user trong db theo email
        let user = await user.findOne({ email: profile.emails[0].value });
        if(user) {
            user.provider = PROVIDER.GOOGLE;
            user.verify = true;
            await user.save();
            return done(null, user);
        }

        // Neu khong co user -> tao moi
        user = new user({
            email: profile.emails[0].value,
            provider: PROVIDER.GOOGLE,
            verified: true,
            password: null // Khong can mat khau cho user dang nhap bang Google
        });
        await user.save();
        return done(null, user);
    }catch (err){
        return done(err);
    }
});


passport.use(jwtLogin);
passport.use(googleLogin);
passport.use(localLogin);