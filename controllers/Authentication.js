const User = require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config');

function tokenForUser(user) {
    const timestamp = new Date().getTime();
    // het han sau 2 tieng
    const expire = timestamp + 2 * 60 * 60 * 1000;
    return jwt.encode(
        {
            sub: user.id,
            iat: timestamp,
            exp: expire,
        },
        config.secret);
}

exports.signup = async function (req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return res.status(422).send({error: 'Email and password are required'});
    }

    try {
        const existingUser = await User.findOne({email: email});
        if (existingUser) {
            return res.status(422).send({error: 'Email is already in use'});
        }

        const user = new User({email: email, password: password});
        await user.save();
        res.json({token: tokenForUser(user)});
    } catch (err) {
        return next(err);
    }
}

exports.signin = function (req, res, next) {
    if (!req.user) {
        return res.status(422).send({error: 'Invalid email or password'});
    }
    res.send({token: tokenForUser(req.user)});
};