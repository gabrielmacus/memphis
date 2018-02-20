var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Friendship = require('../models/Friendship');
var mongoose = require('mongoose');

router.get('/search',function (req,res,next) {

    mongoose.connect(process.env.DB_STRING);

    var q =  (req.query.q)?req.query.q:"";
    var query = {'_id':{'$nin':[req.session.passport.user._id]},'full_name':new RegExp(q,'i')};

    User.find(query).limit(parseInt(process.env.APP_DEFAULT_PAGINATION)).exec(
        function (err,results) {

            if(err)
            {
                //TODO: Handle errors
            }

            res.render('user/search',{results:results});

        }
    );


});



router.post('/addfriend',function (req,res) {

    var id = (req.query.id)?req.query.id:"";

    User.findOne({"_id":id},function (err,user) {

        if(err)
        {
            //TODO: handle errors
        }

        if(!user)
        {
            //TODO: handle errors and set i18n
            res.json({"error":"El usuario no existe "});
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

                    //TODO: Maybe emit an event to alert the user that has a friendship pending


                    return res.json(friendship);

                })

            }
        );

    });



})

module.exports = router;
