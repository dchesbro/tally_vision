var express = require('express');
var router  = express.Router();

// Get host index.
router.get('/', function(req, res, next) {
	res.render('host', {
		contestants: res.app.get('contestants'),
		title:       'TALLYVISION'
	});
});

module.exports = router;
