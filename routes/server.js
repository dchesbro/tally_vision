var express = require('express');
var router  = express.Router();

// Get client index.
router.get('/', function(req, res, next) {
    res.render('server', { title: 'TALLYVISION', contestants: res.app.get('contestants') });
});

module.exports = router;
