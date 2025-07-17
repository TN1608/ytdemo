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

module.exports = router;