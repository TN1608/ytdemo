const {createUser, getUserByEmail, comparePassword, updateUser, hashPassword} = require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config');
const passport = require('passport');
const transporter = require('../config/nodemailer');
const {db} = require('../config/firebase');
const {doc, setDoc, getDoc, deleteDoc} = require('firebase/firestore');
const PROVIDER = require('../constants/enum/provider');
const ERROR_CODES = require('../constants/errorCodes');

function tokenForUser(user) {
    const timestamp = new Date().getTime();
    const expire = timestamp + 2 * 60 * 60 * 1000;
    return jwt.encode(
        {
            sub: user.id,
            iat: timestamp,
            exp: expire,
        },
        config.secret
    );
}

exports.signup = async function (req, res, next) {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(422).send({error: 'Email and password are required'});
    }

    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(422).send({error: 'Email is already in use'});
        }

        const user = await createUser({email, password});
        res.json({token: tokenForUser(user)});
    } catch (err) {
        console.error('Error signing up:', err.message);
        return res.status(500).send({
            error: process.env.NODE_ENV === 'development' ? err.message : ERROR_CODES.INTERNAL_SERVER_ERROR,
        });
    }
};

exports.signin = [
    passport.authenticate('local', {session: false}),
    (req, res) => {
        res.send({token: tokenForUser(req.user)});
    },
];

exports.signinjwt = [
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        if (!req.user) {
            return res.status(401).json({error: ERROR_CODES.UNAUTHORIZED});
        }
        res.send({token: tokenForUser(req.user)});
    }
]

exports.googleAuth = passport.authenticate('google', {session: false, scope: ['profile', 'email']});

exports.googleAuthCallback = [
    passport.authenticate('google', {
        session: false,
        failureRedirect: 'http://localhost:3000/auth/callback?error=Authentication failed'
    }),
    (req, res) => {
        if (!req.user) {
            return res.status(401).json({error: ERROR_CODES.UNAUTHORIZED});
        }
        // Nếu người dùng đã đăng nhập bằng Google, tạo token và chuyển hướng
        const token = tokenForUser(req.user);
        res.redirect(`http://localhost:3000/auth/callback?token=${token}`);
    },
];

// exports.googleAuthCallback = async function (req, res) {
//     const code = req.query.code;
//     if (!code) {
//         return res.status(400).json({error: 'Authorization code is required'});
//     }
//
//     const response = await axios.post('https://oauth2.googleapis.com/token', {
//         code,
//         client_id: process.env.GOOGLE_CLIENT_ID,
//         client_secret: process.env.GOOGLE_CLIENT_SECRET,
//         redirect_uri: process.env.CALLBACK_URL,
//         grant_type: 'authorization_code',
//     });
//
//     const {id_token, access_token} = response.data;
//
//     const userRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
//         headers: {Authorization: `Bearer ${access_token}`},
//     });
//
//     const userInfo = userRes.data;
//
// //     Xu ly vao database
//     let user = await getUserByEmail(userInfo.email);
//     if (!user) {
//         user = await createUser({
//             email: userInfo.email,
//             provider: PROVIDER.GOOGLE,
//             verified: true,
//             password: null,
//         });
//     } else if (user.provider !== PROVIDER.GOOGLE) {
//         // Nếu người dùng đã tồn tại nhưng không phải từ Google, cập nhật thông tin
//         await updateUser(user.id, {
//             provider: PROVIDER.GOOGLE,
//             googleId: userInfo.sub,
//             verified: true, // Neu la local ma gio dang nhap bang google thi verified = true
//         });
//     }
//     const token = tokenForUser(user);
//     res.redirect(`http://localhost:3000/api/auth/callback?token=${token}`);
// }

exports.sendOtp = async (req, res) => {
    try {
        const {email} = req.body;
        if (!email) {
            return res.status(400).json({error: 'Email is required'});
        }

        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({error: 'Email not found'});
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await setDoc(doc(db, 'otps', `${email}_${otp}`), {
            email,
            otp,
            createdAt: new Date().toISOString(),
        });

        // Gửi email chứa OTP
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
            error: process.env.NODE_ENV === 'development' ? err.message : ERROR_CODES.INTERNAL_SERVER_ERROR,
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

        const otpDoc = await getDoc(doc(db, 'otps', `${email}_${otp}`));
        if (!otpDoc.exists()) {
            return res.status(400).json({error: 'Invalid or expired OTP'});
        }

        const otpData = otpDoc.data();
        const createdAt = new Date(otpData.createdAt);
        const now = new Date();
        const diff = (now - createdAt) / 1000;

        if (diff > 300) {
            await deleteDoc(doc(db, 'otps', `${email}_${otp}`));
            return res.status(400).json({error: 'OTP has expired'});
        }

        // Tìm và cập nhật người dùng
        const user = await getUserByEmail(email);
        if (!user) {
            await deleteDoc(doc(db, 'otps', `${email}_${otp}`));
            return res.status(404).json({error: 'User not found'});
        }

        // Cập nhật user.verified = true
        await updateUser(email, {verified: true});

        // Xóa OTP sau khi xác minh
        await deleteDoc(doc(db, 'otps', `${email}_${otp}`));

        res.status(200).json({success: true, message: 'OTP verified successfully, user verified'});
    } catch (err) {
        console.error('Error verifying OTP:', err.message);
        res.status(500).json({
            error: process.env.NODE_ENV === 'development' ? err.message : ERROR_CODES.INTERNAL_SERVER_ERROR,
        });
    }
};

// API tạo mật khẩu
exports.createPassword = [
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const {password} = req.body;
            if (!password) {
                return res.status(422).json({error: 'Password is required'});
            }

            const user = req.user;
            if (!user) {
                return res.status(401).json({error: 'Unauthorized'});
            }

            // Cập nhật mật khẩu
            const hashedPassword = await hashPassword(password);
            await updateUser(user.id, {
                password: hashedPassword,
                hasPassword: true,
            });

            res.json({success: true, message: 'Password created successfully'});
        } catch (err) {
            console.error('Error creating password:', err.message);
            res.status(500).json({
                error: process.env.NODE_ENV === 'development' ? err.message : ERROR_CODES.INTERNAL_SERVER_ERROR,
            });
        }
    },
];

exports.getUserProfile = [
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({error: 'Unauthorized'});
            }

            // Trả về thông tin người dùng
            res.json({
                username: user.username || 'Anonymous',
                email: user.email,
                provider: user.provider,
                verified: user.verified,
                googleId: user.googleId || null,
                friends: user.friends || [],
                friendRequests: user.friendRequests || [],
                hasPassword: !!user.password,
            });
        } catch (err) {
            console.error('Error fetching user profile:', err.message);
            res.status(500).json({
                error: process.env.NODE_ENV === 'development' ? err.message : ERROR_CODES.INTERNAL_SERVER_ERROR,
            });
        }
    },
];

exports.findByEmail = async (req, res) => {
    const {email} = req.query;
    if (!email) {
        return res.status(400).json({error: ERROR_CODES.EMAIL_IS_REQUIRED});
    }

    try {
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({error: ERROR_CODES.USER_NOT_FOUND});
        }

        res.json({
            message: 'User found successfully', user: {
                username: user.username || 'Anonymous',
                email: user.email,
                provider: user.provider,
                verified: user.verified,
                friends: user.friends || [],
                friendRequests: user.friendRequests || [],
                googleId: user.googleId || null,
            }
        });
    } catch (error) {
        console.error('Error finding user by email:', error.message);
        res.status(500).json({
            error: process.env.NODE_ENV === 'development' ? error.message : ERROR_CODES.INTERNAL_SERVER_ERROR,
        });
    }
}