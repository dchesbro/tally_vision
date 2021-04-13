var express = require('express');
var router = express.Router();

/* GET host interface */
router.get('/', function(req, res, next) {
  res.render('host', {
    contestants: res.app.get('contestants'),
    title: 'HOSTBOT',
  });
});

module.exports = router;
