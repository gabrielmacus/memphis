var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');


router.get('/',function (req,res) {

  res.redirect('/index');

})
/* GET home page. */
router.get('/index', function(req, res, next) {

  res.render('index');
});


module.exports = router;
