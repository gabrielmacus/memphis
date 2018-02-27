var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');


/* GET home page. */
router.get('/', function(req, res, next) {


  res.render('index',{bodyClass:['home']});
});


module.exports = router;
