var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Friendship = require('../models/Friendship');
var mongoose = require('mongoose');

var WsService = require('../services/ws');
var UserService = require('../services/user');



router.get('/sharelocation',function (req,res) {

    WsService.sendToFriends(req,{type:'share-location-alert'});

    res.render('user/location-map',{myLocation:true,user:req.session.passport.user});

})
router.post('/readnotifications',function (req,res) {

    User.update({_id:req.session.passport.user._id},{'$set':{'notifications':[]}}).exec(
        function (err,results) {

            if(err)
            {
                //TODO: handle errors
            }

            res.json(results);

        }
    );


});
router.get('/friends',function (req,res,next) {

    UserService.findFriends(req,2,function (err,results) {

        if(err)
        {
            //TODO: Handle errors
        }

        var friendships = {};
        var friends = [];

        results.forEach(function (friendship) {

            var friend =  (friendship.friend._id == req.session.passport.user._id)? friendship.friend2:friendship.friend;

            friendships[friend._id] = friendship;
            friendships[friend._id].friend = friendships[friend._id].friend._id;
            friendships[friend._id].friend2 = friendships[friend._id].friend2._id;

            friends.push(friend);

        })


        res.render('me/friends',{results:{users:friends,friendships:friendships}});


    })










});

router.get('/friends/pending',function (req,res,next) {

    UserService.findFriends(req,1,function (err,results,pagination) {

        if(err)
        {
            //TODO: Handle errors
        }


        if(err)
        {
            //TODO: Handle errors
        }

        var friendships = {};
        var pendingFriends = [];

        results.forEach(function (friendship) {

            var friend =  (friendship.friend._id == req.session.passport.user._id)? friendship.friend2:friendship.friend;

            friendships[friend._id] = friendship;
            friendships[friend._id].friend = friendships[friend._id].friend._id;
            friendships[friend._id].friend2 = friendships[friend._id].friend2._id;

            pendingFriends.push(friend);

        })





        if(!req.query.api)
        {
            res.render('me/pending-friends',{"results":{users:pendingFriends,friendships:friendships},"pagination":pagination});

        }
        else
        {
            res.json({"pagination":pagination,"results":pendingFriends});

        }


    },2);


});

router.post('/acceptfriend',function (req,res,next) {

    var id = (req.query && req.query.id )?req.query.id:false;
    if(!id)
    {
        //TODO: handle errors
        return res.json({"error":"No se especifico un usuario"})
    }


    Friendship.update({'friend2':req.session.passport.user._id,'friend':id},{'$set':{'status':2,'friends_since':new Date()}}).exec(function (err,result) {

        if(err)
        {//TODO: handle errors
        }

        if(!result)
        {
            //TODO: handle errors
            return res.json({"error":"La solicitud de amistad no existe"})
        }



        WsService.SendTo([id],{type:'friendship-update',status:2},req);


        return res.json(result);


    });




});

router.get('/notifications',function (req,res) {

    //TODO: may this should be paged?
    User.findOne({_id:req.session.passport.user._id}).exec(
        function (err,results) {

            if(err)
            {
                //TODO: handle errors

            }

            res.json({results:(results.notifications)?results.notifications:[]});

        }
    );

});



module.exports = router;
