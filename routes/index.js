var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    categories: res.app.get('categories'),
		contestants: res.app.get('contestants'),
    title: 'TALLYVISION',
    url: 'github.com/dchesbro/tallyvision',
    version: '0.6.9',
  });
});

module.exports = router;
