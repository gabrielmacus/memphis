var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
var dotenv = require('dotenv').load();
var passport = require('passport');
var i18n = require('i18n');
var fs = require('fs');
//var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('./sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('./sslcert/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var WebSocket = require('ws');

i18n.configure({directory: __dirname  + '/locales',defaultLocale: process.env.APP_LOCALE_DEFAULT});



/**
 * Models
 */
var User  = require('./models/User');

/**
 * Routes
 */
var index = require('./routes/index');
var auth = require('./routes/auth');
var me = require('./routes/me');
var user  = require('./routes/user');
/**
 * Services
 */
var AuthService = require('./services/auth');
var WsService = require('./services/ws');

var app = express();

// view engine setup

var expressNunjucks = require('express-nunjucks');
var njk = expressNunjucks(app, {
    watch: ("production" !== app.get('env')),
    noCache: ("production" !== app.get('env'))
});
app.set('views', path.join(__dirname, 'views'));


//TODO:uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));

var sessionParser =  require('express-session')({ secret: process.env.APP_SESSION_SECRET, resave: false, saveUninitialized: false });
app.use(sessionParser);
app.use(passport.initialize());
app.use(passport.session());
app.use(i18n.init);
//https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
passport.serializeUser(function(user, done) {

    var usr= {"_id":user._id,picture:user.picture,name:user.name,surname:user.surname};




    done(null, usr);
    // if you use Model.id as your idAttribute maybe you'd want
    // done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});



var checkAuth = new AuthService.CheckAuth(path.join(__dirname,'roles.json'));
var checkNotAuth = new AuthService.CheckNotAuth();

app.locals.env = process.env;



app.use('/auth',checkNotAuth,auth);
app.use('/me',checkAuth,me);
app.use('/user',checkAuth,user);
app.use('/',checkAuth, index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {

    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);



  res.render('error');
});


var https = require('https');
var privateKey  = fs.readFileSync('./sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('./sslcert/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

/**
 * Create HTTPS server.
 */

var server = https.createServer(credentials, app);//http.createServer(app);

//const server = http.createServer(app);
//const httpsServer = https.createServer(credentials, app);

//app.server = httpsServer;


module.exports = {app:app,sessionParser:sessionParser};
