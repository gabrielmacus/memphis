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

    var q =  (req.query.q)?req.query.q:"";
    var query = {'_id':{'$nin':[req.session.passport.user._id]},'full_name':new RegExp(q,'i')};
    var page = (req.query.p)?req.query.p:1;

    User.find(query).paginate(page,parseInt(process.env.APP_DEFAULT_PAGINATION),
        function (err,results,total) {

            if(err)
            {
                //TODO: Handle errors
            }

            //TODO: set pager
            res.render('user/search',{results:results});

        }
    );


});

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


                Friendship.create({status:1,friend:req.session.passport.user._id,friend2:id},function (err,friendship) {

                    if(err)
                    {
                        //TODO: handle errors
                    }


                    WsService.SendTo([id],{type:'friendship-request',user:req.session.passport.user});




                    return res.json(friendship);

                })

            }
        );

    });



})

module.exports = router;
