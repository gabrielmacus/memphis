var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Friendship = require('../models/Friendship');
var mongoose = require('mongoose');

router.get('/friends',function (req,res,next) {

    mongoose.connect(process.env.DB_STRING);

    var query = {'$or':[{'friend':req.session.passport.user._id},{'friend2':req.session.passport.user._id}]};

    Friendship.find(query).populate('friend').populate('friend2').limit(parseInt(process.env.APP_DEFAULT_PAGINATION)).exec(
        function (err,results) {

            if(err)
            {
                //TODO: Handle errors
            }

            res.render('me/friends',{friends:results});

        }
    );


});

module.exports = router;
