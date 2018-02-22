var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Friendship = require('../models/Friendship');
var UserService =  require('../services/user');
var WsService = require('../services/ws');
var mongoose = require('mongoose');
require('mongoose-pagination');


router.get('/search',function (req,res,next) {

    mongoose.connect(process.env.DB_STRING);

    var q =  (req.query.q)?req.query.q:false;

    if(!q)
    {
        return   res.render('user/search');
    }

    var query = {'_id':{'$nin':[req.session.passport.user._id]},'full_name':new RegExp(q,'i')};
    var page = (req.query.p)?req.query.p:1;

    User.find(query).paginate(page,parseInt(process.env.APP_DEFAULT_PAGINATION),
        function (err,results,total) {

            if(err)
            {
                //TODO: Handle errors
            }

            if(results)
            {

                var ids = results.map(function (item) { return item._id;  });

                Friendship.find({
                    '$or':[
                        {'friend':req.session.passport.user._id,'friend2':{'$in':ids}},
                        {'friend2':req.session.passport.user._id,'friend':{'$in':ids}}
                    ]
                }).exec(function (err,f) {


                    if(err)
                    {
                        //TODO: Handle errors
                    }

                    var friendships = {};

                    f.forEach(function (item) {
                        var friendId = (item.friend == req.session.passport.user._id)?item.friend2:item.friend;

                        friendships[friendId] = item;
                    });

                    //TODO: set pager
                    res.render('user/search-results',{results:{users:results,friendships: friendships}});

                });
            }





        }
    );


});


router.post('/deletefriend',function (req,res) {


    UserService.deleteFriend(req,function (err,deleted) {
        if(err)
        {
            //TODO: handle errors
        }



        WsService.SendTo([deleted],{type:'friendship-update',status:3,user:req.session.passport.user});


        //TODO: how will i manage this kind of responses?
        return res.json({'deleted_friend':deleted});
    });


})






router.get('/viewlocation',function (req,res) {

    var id = (req.query.id)?req.query.id:false;
    if(!id)
    {
          //TODO: handle errors and use i18n
         return res.json({error:'No se especificó un usuario'})
    }

    UserService.areFriends(req.session.passport.user,id,function (areFriends) {

        if(!areFriends)
        {
            //TODO: handle errors and use i18n
            return res.json({error:'El usuario especificado no está en tu lista de amigos'});
        }


        return res.render("user/location-map");



    });



})

router.post('/addfriend',function (req,res) {

    var id = (req.query.id)?req.query.id:"";


    if(req.query.id == req.session.passport.user._id)
    {
        //TODO: handle errors and set i18n
        return res.json({"error":"No deberías mandarte solicitudes a vos mismo..."});
    }


    User.findOne({"_id":id},function (err,user) {

        if(err)
        {
            //TODO: handle errors
        }

        if(!user)
        {
            //TODO: handle errors and set i18n
           return res.json({"error":"El usuario no existe "});
        }

        Friendship.findOne({'$or':[{'friend':id},{'friend2':id}]}).exec(
            function (err,friendship) {
                if(err)
                {
                    //TODO: handle errors
                }

                if(friendship)
                {
                    //TODO: handle errors and set i18n
                    switch (friendship.status)
                    {
                        default:

                            return  res.json({"error":"Solicitud de amistad ya enviada"});

                            break;
                        case 2:
                            return  res.json({"error":"Este usuario ya es tu amigo"});
                            break;
                    }


                }


                var status = 1;

                Friendship.create({status:status,friend:req.session.passport.user._id,friend2:id},function (err,friendship) {

                    if(err)
                    {
                        //TODO: handle errors
                    }


                    WsService.SendTo([id],{type:'friendship-update',status:status,user:req.session.passport.user});




                    return res.json(friendship);

                })

            }
        );

    });



})

module.exports = router;
