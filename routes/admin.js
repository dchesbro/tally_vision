var express = require('express');
var router  = express.Router();

// Get admin index.
router.get('/', function(req, res, next) {
	res.render('admin', {
		contestant:  res.app.get('contestant'),
		contestants: res.app.get('contestants'),
		userCount:   res.app.get('userCount'),
		title: 'TALLYVISION',
	});
});

module.exports = router;
