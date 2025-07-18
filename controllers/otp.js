// API gửi OTP
const {getUserByEmail, hashPassword} = require("../models/user");
exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Kiểm tra người dùng tồn tại
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'Email not found' });
        }

        // Tạo mã OTP ngẫu nhiên (6 chữ số)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Lưu OTP vào Firestore
        await db.collection('otps').doc(`${email}_${otp}`).set({
            email,
            otp,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Gửi email chứa OTP
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'OTP sent successfully' });
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
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        // Tìm OTP trong Firestore
        const otpDoc = await db.collection('otps').doc(`${email}_${otp}`).get();
        if (!otpDoc.exists) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        const otpData = otpDoc.data();
        const createdAt = otpData.createdAt.toDate();
        const now = new Date();
        const diff = (now - createdAt) / 1000; // Thời gian chênh lệch (giây)

        // Kiểm tra OTP hết hạn (5 phút = 300 giây)
        if (diff > 300) {
            await db.collection('otps').doc(`${email}_${otp}`).delete();
            return res.status(400).json({ error: 'OTP has expired' });
        }

        // Tìm và cập nhật người dùng
        const user = await getUserByEmail(email);
        if (!user) {
            await db.collection('otps').doc(`${email}_${otp}`).delete();
            return res.status(404).json({ error: 'User not found' });
        }

        // Cập nhật user.verified = true
        await updateUser(email, { verified: true });

        // Xóa OTP sau khi xác minh
        await db.collection('otps').doc(`${email}_${otp}`).delete();

        res.status(200).json({ success: true, message: 'OTP verified successfully, user verified' });
    } catch (err) {
        console.error('Error verifying OTP:', err.message);
        res.status(500).json({
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
        });
    }
};

// API tạo mật khẩu
exports.createPassword = [
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { password } = req.body;
            if (!password) {
                return res.status(422).json({ error: 'Password is required' });
            }

            if (password.length < 8) {
                return res.status(422).json({ error: 'Password must be at least 8 characters' });
            }

            const user = req.user;
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // Cập nhật mật khẩu
            const hashedPassword = await hashPassword(password);
            await updateUser(user.id, { password: hashedPassword });

            res.json({ success: true, message: 'Password created successfully' });
        } catch (err) {
            console.error('Error creating password:', err.message);
            res.status(500).json({
                error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
            });
        }
    },
];