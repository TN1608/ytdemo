const express = require('express');
const router = express.Router();
const axios = require('axios');


const Authentication = require('../controllers/Authentication');
const passportService = require('../services/passport');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', {session: false});
const requireSignin = passport.authenticate('local', {session: false});


router.post('/api/signup', Authentication.signup);
router.post('/api/signin', requireSignin, Authentication.signin);

router.get('/auth/google', Authentication.googleAuth);
router.get('/auth/google/callback', Authentication.googleAuthCallback);

router.post('/api/sendOtp', Authentication.sendOtp);
router.post('/api/verifyOtp', Authentication.verifyOtp);
router.post('/api/createPassword', Authentication.createPassword);

module.exports = router;