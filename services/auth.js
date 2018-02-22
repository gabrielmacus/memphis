var fs = require('fs');
var roles = false;
module.exports=
    {
        CheckAuth:function (rolesPath,failureUrl) {
            roles =  JSON.parse(fs.readFileSync(rolesPath).toString());
            if(!failureUrl)
            {
                failureUrl = process.env.APP_LOGIN_URL;
            }


            return function (req,res,next) {

                if("production" !== req.app.get('env'))
                {
                    //If not in production, doesn't make cache
                    roles =  JSON.parse(fs.readFileSync(rolesPath).toString());

                }

                if( req.session.passport && req.session.passport.user)
                {


                    res.cookie('usr',req.session.passport.user);

                    var checkPermissions = new module.exports.CheckPermissions(roles);


                    return checkPermissions(req,res,next);
                }

                return res.redirect(failureUrl);
            }

        },
        CheckNotAuth: function (failureUrl) {

            if(!failureUrl)
            {
                failureUrl = '/';
            }


            return function (req,res,next) {

                if( !req.session.passport || !req.session.passport.user)
                {

                    return next();

                }

                return res.redirect( failureUrl);
            }

        },
        /**
         *
         * @param roles
         * @returns {Function}
         * @see https://www.npmjs.com/package/express-acl
         * @constructor
         */
        CheckPermissions:function (roles) {


            return function (req,res,next) {


                if(req.session.passport && req.session.passport.user)
                {
                    var role  = (req.session.passport.user.role)?req.session.passport.user.role:"user";//Default role

                    if(role == process.env.APP_SU_ROLE)
                    {
                        return next();
                    }

                    var path = req.baseUrl+req.path;



                    if(path[0]=="/")
                    {
                        path  = path.slice(1,path.length)
                    }

                    if(path.length > 0 && path[path.length-1] == "/")
                    {
                        path  = path.slice(0,-1);
                    }

                    path = path.replace(new RegExp("/", 'g'), ".");

                    var method  = req.method;

                    if(roles[role] && roles[role]["permissions"][path] && roles[role]["permissions"][path])
                    {

                        switch (roles[role]["permissions"][path]["action"])
                        {
                            case "allow":

                                if(roles[role]["permissions"][path]["methods"].indexOf(method) > -1)
                                {
                                    return next();
                                }

                                break;
                            case "deny":

                                if(roles[role]["permissions"][path]["methods"].indexOf(method) == -1)
                                {
                                    return next();
                                }

                                break;
                        }



                    }


                }

                //TODO: set text with i18n
                return res.status(401).json({"error":"Unauthorized access"});

            }

        }








    }