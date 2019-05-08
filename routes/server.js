var express = require('express'); // Application framework
var router  = express.Router();   // Express routing utilities

// GET admin index.
router.get('/', function(req, res, next) {
	res.render('server', { title: 'TALLYVISION', contestants: res.app.get('contestants') });
});

module.exports = router;
