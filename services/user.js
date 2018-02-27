
var User = require('../models/User');
var Friendship = require('../models/Friendship');
var mongoose = require('mongoose');
require('mongoose-pagination');

module.exports=
    {


        /**
         * Find users friends
         * @param req
         * @param status Friendship status, 1: pending approbation, 2: approved, etc
         * @param owner 1: request made by me, 2: request made by another user, 3: indistinct requests
         * @param ids Friends ids
         * @param callback
         */
        findFriends:function(req,status,callback,owner,ids) {
                mongoose.connect(process.env.DB_STRING);

                var page = (req.query && req.query.p)?req.query.p:1;

                var query = {};

                if(status.length)
                {
                    query.status = {'$in':status};
                }
                else
                {
                    query.status = status
                }


                switch (owner)
                {
                    case 1:

                        query.friend = req.session.passport.user._id;
                        if(ids)
                        {
                            query.friend2 = {'$in':ids};
                        }
                        break;
                    case 2:

                        query.friend2 = req.session.passport.user._id;
                        if(ids)
                        {
                            query.friend = {'$in':ids};
                        }
                        break;
                    default:
                        if(!ids)
                        {

                            query['$or']=[{'friend':req.session.passport.user._id},{'friend2':req.session.passport.user._id}];
                        }
                        else
                        {


                            query['$or']=
                                [
                                    {'friend':req.session.passport.user._id,'friend2': {'$in':ids} },
                                    {'friend2':req.session.passport.user._id,'friend': {'$in':ids} }
                            ];
                        }

                }




                Friendship.find(query).populate({path:'friend'}).populate({path:'friend2'}).paginate(page,parseInt(process.env.APP_DEFAULT_PAGINATION),function (err,results,total) {


                    //TODO: 'total' means total pages or total results?
                        callback(err,results,{"total":total,"page":page});

                    }
                );
            },



        /**
         * Deletes both pending and actual friends
         * @param req
         * @param id
         * @param callback
         */
        deleteFriend:function (req,callback) {

            var id = (req.query && req.query.id)? req.query.id:false;

            if(!id)
            {
                //TODO: Handle errors
                return callback({error:"No se especificó ningún usuario"});
            }


            Friendship.remove({'$or':[{'friend':id,'friend2':req.session.passport.user._id},{'friend2':id,'friend':req.session.passport.user._id}]}).exec(function (err) {

                callback(err,id);


            });

        },

        /**
         * Checks if two users are friends
         * @param user1
         * @param user2
         * @param callback
         */
        areFriends:function(user1,user2,callback)
        {
            Friendship.find({'status':2,'$or':[{'friend':user1,'friend2':user2},{'friend2':user1,'friend':user2}]}).exec(
                function (err,results) {

                    if(err)
                    {
                        //TODO: handle error
                    }
                    if(results && results.length)
                    {
                        callback(true);
                    }
                    else
                    {
                        callback(false);
                    }


                }
            );
        }



    }