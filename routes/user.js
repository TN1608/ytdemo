const express = require('express');
const router = express.Router();
const axios = require('axios');
require('../services/passport')


const Authentication = require('../controllers/Authentication');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', {session: false});
const requireSignin = passport.authenticate('local', {session: false});

router.post('/api/signup', Authentication.signup);
router.post('/api/signin', requireSignin, Authentication.signin);
router.post('/api/signinjwt', requireAuth, Authentication.signinjwt);

router.get('/auth/google', Authentication.googleAuth);
router.get('/auth/google/callback', Authentication.googleAuthCallback);

router.post('/api/sendOtp', Authentication.sendOtp);
router.post('/api/verifyOtp', Authentication.verifyOtp);
router.post('/api/createPassword', Authentication.createPassword);
router.get('/api/getUser', requireAuth, Authentication.getUserProfile);

module.exports = router;