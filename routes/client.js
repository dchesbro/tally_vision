var express = require('express');
var router  = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.render('client', { title: 'TALLYVISION', categories: res.app.get('ballot-categories'), contestants: res.app.get('contestants') });
});

module.exports = router;
