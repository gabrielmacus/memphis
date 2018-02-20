/**
 * Created by Gabriel on 16/02/2018.
 */

var cookie = require('cookie');
var clients = {};
var UserService = require("../services/user");

module.exports=
{
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

        module.exports.Save(req.session.passport.user._id,cookies['connect.sid'],connection);

        //when server gets a message from a connected user
        connection.on('message',function(message) {

            var msg = {type:false};
            //accepting only JSON messages
            try {
                msg = JSON.parse(message);
            } catch (e) {

            }

            switch (msg.type)
            {
                case "share-location":


                    if(msg.location)
                    {


                        //TODO: important, make friends cache
                        UserService.findFriends(req,2,function (err,friendships,total) {



                             if(err)
                             {
                            //TODO: Handle errors
                              }


                            friendships.forEach(function (friendship) {

                                var id = (friendship.friend["_id"] == req.session.passport.user._id)?friendship.friend2["_id"]:friendship.friend["_id"];

                                  if(clients[id])
                                  {
                                      var sessions = clients[id];

                                      for(var k in sessions)
                                      {
                                          var session  = sessions[k];


                                          session["connection"].send(JSON.stringify(msg));


                                      }


                                  }

                              });


                        })

                    }



                    break;
            }

        });
        connection.on("error", function (e) {

        });
        //when user exits, for example closes a browser window
        //this may help if we are still in "offer","answer" or "candidate" state
        connection.on("close",function(e) {

            module.exports.DeleteSession(req.session.passport.user._id,cookies['connect.sid']);
        });




    }
}