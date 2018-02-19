module.exports=
    {
        CheckAuth:function (roles,failureUrl) {

            if(!failureUrl)
            {
                failureUrl = process.env.APP_LOGIN_URL;
            }


            return function (req,res,next) {

                if( req.session.passport && req.session.passport.user)
                {

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

                    var path = req.path;

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




                    return next();
                }

                //TODO: set text with i18n
                return res.json(401,{"error":"Unauthorized access"});

            }

        }








    }