/**
 * Created by Gabriel on 16/02/2018.
 */

var cookie = require('cookie');
var clients = {};
var UserService = require("../services/user");
var User = require('../models/User');
const uuidv4 = require('uuid/v4');

module.exports=
{
    /**
     * Send messages to actual friends
     * @param req
     * @param data
     */
    sendToFriends:function (req,data,callback) {


        UserService.findFriends(req,2,function (err,results) {

            if(err)
            {
                //TODO: Handle errors
            }
            var ids = [];

            for(var k in results){
                var friendship = results[k];
                var friend =  (friendship.friend._id == req.session.passport.user._id)? friendship.friend2:friendship.friend;

                ids.push(friend._id);
            }


            module.exports.SendTo(ids,data,req);

            if(callback)
            {
                callback();
            }

        });




    },
    SendTo:function (ids,data,req) {



        var offlineUsers = [];

        ids.forEach(function (id) {

            if(clients[id])
            {


                for(var k in clients[id])
                {
                    var session = clients[id][k];

                    if(req)
                    {

                        data.user = req.session.passport.user;
                    }

                    session.connection.send(JSON.stringify(data));

                    //Notifies online users, each session
                    module.exports.Notify(session.connection,data);

                }
            }
            else
            {
                offlineUsers.push(id);
            }

        });
        //Notifies offline users
        module.exports.Notify(offlineUsers,data);

    },
    Notify:function (connectionOrArray,data) {

        //TODO: may be handle here push
        var notifiableEvents = process.env.APP_NOTIFIABLE_EVENTS;

        var isNotifiable = (notifiableEvents.indexOf("|"+data.type+"|") > -1);

        if(isNotifiable)
        {
            var notification =  {type:'notification',data:data,time:new Date()};
            if(Array.isArray(connectionOrArray))
            {
                User.update({"_id":{'$in':connectionOrArray}},{"$push":{"notifications":notification}},function (err,results) {

                    if(err)
                    {
                        console.log(err);
                        //TODO: handle errors
                    }

                });
            }
            else
            {
                connectionOrArray.send(JSON.stringify(notification));
            }

        }


    },
    Save:function (id,sessionid,client,data) {

        data = (!data)?{}:data;
        if(!clients[id])
        {
            clients[id]={};
        }
        clients[id][sessionid]={connection:client,data:data};
    },
    Read:function (id) {

        var client = false;

        if(clients[id])
        {
            client = clients[id];
        }

        return client;

    },
    ReadSession:function (id,sessionid) {
        var session = false;
        if(clients[id] && clients[id][sessionid])
        {
            session = clients[id][sessionid];
        }

        return session;

    },
    Delete:function (id) {

        if(clients[id])
        {
            delete clients[id];
        }

    },
    DeleteSession:function (id,sessionid) {


        if(clients[id] && clients[id][sessionid])
        {
            delete clients[id][sessionid];
        }

    },
    ReadAll:function () {

        return clients;
    },
    OnConnection:function(connection,req) {


        if( !req.session.passport || !req.session.passport.user)
        {

            connection.close();
        }
        var cookies=cookie.parse(req.headers.cookie);

        var wsSessionId =uuidv4();

        if("production" !== process.env.APP_STATUS)
        {
            console.log("User "+req.session.passport.user._id+", session "+ wsSessionId+" connected at "+new Date());
        }

        module.exports.Save(req.session.passport.user._id,wsSessionId,connection);



        //when server gets a message from a connected user
        connection.on('message',function(message) {

            var msg = {type:false};
            //accepting only JSON messages
            try {
                msg = JSON.parse(message);
            } catch (e) {

            }

            msg.user = req.session.passport.user;
            switch (msg.type)
            {
                case "share-location":


                    if(msg.location)
                    {

                        module.exports.sendToFriends(req,msg);

                    }



                    break;
            }

        });
        connection.on("error", function (e) {

        });
        //when user exits, for example closes a browser window
        //this may help if we are still in "offer","answer" or "candidate" state
        connection.on("close",function(e) {

            if("production" !== process.env.APP_STATUS)
            {
                console.log("User "+req.session.passport.user._id+", session "+ wsSessionId+" disconnected at "+new Date());
            }

            module.exports.DeleteSession(req.session.passport.user._id,wsSessionId);
        });




    }
}