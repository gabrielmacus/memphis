var express = require('express');
var router = express.Router();
var passport = require('passport');
var User  = require('../models/User');
var mongoose = require('mongoose');
/**
 * Passport stategies
 */
router.get('/login',function (req,res) {

    res.render('login',{env:process.env});


})

//Facebook
var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_REDIRECT_URI,
        profileFields: ['id', 'first_name', 'last_name','picture','email']
    },
    function(accessToken, refreshToken, profile, cb) {
        // In this example, the user's Facebook profile is supplied as the user
        // record.  In a production-quality application, the Facebook profile should
        // be associated with a user record in the application's database, which
        // allows for account linking and authentication with other identity
        // providers.
        mongoose.connect(process.env.DB_STRING);

        User.findOrCreate({facebook_id:profile.id,name:profile.first_name,surname:profile.last_name,email:profile.email,picture:profile.picture},function (err,user) {

            return cb(err, user);

        });

    }));


router.get('/facebook',passport.authenticate('facebook'));


router.get('/facebook/return',
    passport.authenticate('facebook', { failureRedirect: '/auth/login' }),
    function(req, res) {
        res.redirect('/');
    });
//End Facebook

module.exports = router;

