var express = require('express');
var router  = express.Router();

// Get admin index.
router.get('/', function(req, res, next) {
	res.render('admin', {
		contestants: res.app.get('contestants'),
		title:       'TALLYVISION'
	});
});

module.exports = router;
