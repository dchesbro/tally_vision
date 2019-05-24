var express = require('express');
var router  = express.Router();

// Get screen index.
router.get('/', function(req, res, next) {
	res.render('screen', {
		title: 'TALLYVISION'
	});
});

module.exports = router;
