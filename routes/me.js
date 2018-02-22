var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Friendship = require('../models/Friendship');
var mongoose = require('mongoose');

var WsService = require('../services/ws');
var UserService = require('../services/user');



router.get('/sharelocation',function (req,res) {

    res.render('user/location-map',{myLocation:true,user:req.session.passport.user});

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



        WsService.SendTo([id],{type:'friendship-update',status:2,user:req.session.passport.user});


        return res.json(result);


    });




});





module.exports = router;
