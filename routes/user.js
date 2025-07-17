const express = require('express');
const router = express.Router();

const Authentication = require('../controllers/Authentication');
const passportService = require('../services/passport');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', {session: false});
const requireSignin = passport.authenticate('local', {session: false});


router.post('/api/signup', Authentication.signup);

router.post('/api/signin', requireSignin, Authentication.signin);
router.get('/auth/google', Authentication.googleAuth);
router.get('/auth/google/callback', Authentication.googleAuthCallback);
router.post('/api/createPassword', requireAuth, Authentication.createPassword);

router.post('/api/sendOtp', Authentication.sendOtp);
router.post('/api/verifyOtp', Authentication.verifyOtp);


module.exports = router;