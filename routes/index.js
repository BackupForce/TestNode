var express = require('express');
var router = express.Router();
var url = require('url');

/* GET home page. */
router.get('/', function(req, res, next) {
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  res.render('index', { title: query.Number});
});

module.exports = router;