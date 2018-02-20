var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Friendship = require('../models/Friendship');
var mongoose = require('mongoose');

var UserService = require('../services/user');



router.get('/sharelocation',function (req,res) {


    res.render('me/share-location');



})
router.get('/friends',function (req,res,next) {

    UserService.findFriends(req,2,function (err,results) {

        if(err)
        {
            //TODO: Handle errors
        }

        res.render('me/friends',{friends:results});


    })


});

router.get('/friends/pending',function (req,res,next) {

    UserService.findFriends(req,1,function (err,results,pagination) {

        if(err)
        {
            //TODO: Handle errors
        }

        if(!req.query.api)
        {
            res.render('me/pending-friends',{friends:results});

        }
        else
        {
            res.json({"pagination":pagination,"results":results});

        }


    },2);


});






module.exports = router;
