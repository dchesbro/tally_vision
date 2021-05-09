var express = require('express');
var router = express.Router();

/* GET host interface */
router.get('/', function(req, res, next) {
  res.render('host', {
    contestants: res.app.get('contestants'),
    title: 'HOSTBOT',
  });
});

/* GET awards interface */
router.get('/pca', function(req, res, next) {
  res.render('host-pca', {
    categories: res.app.get('categories'),
    contestants: res.app.get('contestants'),
    title: 'TALLYVISION',
  });
});

module.exports = router;
