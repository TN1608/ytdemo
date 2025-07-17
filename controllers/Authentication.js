const User = require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config');
const passport = require("passport");
const Otp = require('../models/otp');
const transporter = require('../config/nodemailer');

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

// Thêm endpoint cho Google OAuth
exports.googleAuth = passport.authenticate('google', {session: false, scope: ['profile', 'email']});

exports.googleAuthCallback = [
    passport.authenticate('google', {session: false, failureRedirect: '/login'}),
    (req, res) => {
        const token = tokenForUser(req.user);
        // Chuyển hướng về frontend với token
        res.redirect(`http://localhost:3000/auth/callback?token=${token}`);
    },
];

//Login Google -> nhap mat khau -> chuyen Google qua local
exports.createPassword = [
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const {paswsword} = req.body;
            if (!paswsword) {
                return res.status(422).send({error: 'Password is required'});
            }

            if (paswsword.length < 4) {
                return res.status(422).send({error: 'Password must be at least 4 characters long'});
            }

            const user = req.user;
            if (!user) {
                return res.status(404).send({error: 'Unauthenticated user'});
            }

            user.password = paswsword
            await user.save();
            res.json({success: true, message: 'Password created successfully'});
        } catch (err) {
            return res.status(500).send({error: 'Internal server error'});
        }
    }
]

exports.sendOtp = async (req, res) => {
    try {
        const {email} = req.body;
        if (!email) {
            return res.status(400).json({error: 'Email is required'});
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.create({email, otp});

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({success: true, message: 'OTP sent successfully'});
    } catch (err) {
        console.error('Error sending OTP:', err.message);
        res.status(500).json({
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
        });
    }
};

// API xác minh OTP
exports.verifyOtp = async (req, res) => {
    try {
        const {email, otp} = req.body;
        if (!email || !otp) {
            return res.status(400).json({error: 'Email and OTP are required'});
        }

        // Tìm OTP trong MongoDB
        const otpRecord = await Otp.findOne({email, otp});
        if (!otpRecord) {
            return res.status(400).json({error: 'Invalid or expired OTP'});
        }

        const user = await User.findOne({email})
        if(!user) {
            return res.status(404).json({error: 'User not found'});
        }
        user.verified = true;
        await user.save();
        // Xóa OTP sau khi xác minh thành công
        await Otp.deleteOne({email, otp});

        res.status(200).json({success: true, message: 'OTP verified successfully'});
    } catch (err) {
        console.error('Error verifying OTP:', err.message);
        res.status(500).json({
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
        });
    }
};