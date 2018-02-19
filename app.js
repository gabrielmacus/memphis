var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
var dotenv = require('dotenv').load();
var passport = require('passport');

/**
 * Models
 */
var User  = require('./models/User');

/**
 * Routes
 */
var index = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth');



var app = express();

// view engine setup

const expressNunjucks = require('express-nunjucks');
const njk = expressNunjucks(app, {
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
app.use(require('express-session')({ secret: process.env.APP_SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
//https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
passport.serializeUser(function(user, done) {

    done(null, {"_id":user._id});
    // if you use Model.id as your idAttribute maybe you'd want
    // done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

app.use('/',function (req,res,next) {



    next();
}, index);
app.use('/users', users);
app.use('/auth',auth);
// Initialize Passport and restore authentication state, if any, from the
// session.


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

  var data = {};
  if(req.app.get('env') === 'development')
  {
      data.error = res.locals.error;
  }

  res.render('error',data);
});

function CheckAuth() {

    req.session.passport.user

}


module.exports = app;
