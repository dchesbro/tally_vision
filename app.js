var createError    = require('http-errors');   // Create HTTP error objects
var express        = require('express');       // Application framework
var path           = require('path');          // File and directory path utilities
var cookieParser   = require('cookie-parser'); // HTTP cookie parser
var logger         = require('morgan');        // HTTP request logger
var mongoose       = require('mongoose');      // MongoDB object modeling

// Define Express app instance.
var app            = express();

// Define Socket.IO server.
var server         = require('http').Server(app);
var io             = require('socket.io')(server);

// Define database document models.
var voteModel      = require('./models/vote');

// Define includes.
var categories     = require('./includes/categories');
var contestants    = require('./includes/contestants');

// Define local app variables.
var contestant;
var userCount = 0;

// Define routers.
var adminRouter    = require('./routes/admin');
var usersRouter    = require('./routes/users');

// Set app variables.
app.set('categories', categories);
app.set('contestants', contestants);

// Set views.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Express app generator setup.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use('/', usersRouter);
app.use('/admin', adminRouter);

// Forward 404 messages to error handler.
app.use(function(req, res, next) {
	next(createError(404));
});

// HTTP error handler.
app.use(function(err, req, res, next) {
	
	// Set local development error messages.
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	
	res.status(err.status || 500);
	res.render('error');
});

// Open database connection.
mongoose.connect('mongodb://localhost/tallyvision', {useNewUrlParser: true});

// Socket.IO event handlers.
io.on('connection', function(socket){
	
	/*----------------------------------------------------------
	# Admin action events
	----------------------------------------------------------*/
	/**
	 * ...
	 */
	socket.on('admin-connect', function(){
		
		// Return 'user-registered' event (sender).
		socket.emit('admin-connected', { contestant, userCount });
		console.log('IO ' + userCount + ' user(s) registered');
	});

	/**
	 * Set contestant using defined index and initiate voting.
	 */
    socket.on('ballot-init', function(index){

		// If contestant set, return.
		if(contestant){
			return;
		}

        // Set contestant using contestant index number.
        contestant = contestants[index];

        // Return 'ballot-open' event (everyone).
		io.sockets.emit('ballot-open', contestant);
		
		// Print debug message(s).
        console.log('IO Opening ballot for "' + contestant.country + '"');
	});
	
	/**
	 * Kill voting and set contestant to null.
	 */
    socket.on('ballot-kill', function(){

        // If contestant not set, return.
		if(!contestant){
			return;
		}

        // Return 'ballot-close' event (everyone).
		io.sockets.emit('ballot-close');
		
		// Print debug message(s).
		console.log('IO Closing ballot for "' + contestant.country + '"');
		
		// Set contestant to null.
		contestant = null;
	});
	
	/*----------------------------------------------------------
	# User action events
	----------------------------------------------------------*/
    /**
	 * Register socket as user, increase user count, and check for open ballot.
	 */
    socket.on('user-register', function(username){
        
        // If socket registered, return.
        if(socket.registered){
			return;
		}

        // Set socket username and registered property.
		socket.username = username;
		socket.registered = true;

		// Increase registered user count.
		userCount++;
		
		// Return 'user-registered' event (sender).
		socket.emit('user-registered');

		// Return 'client-connected' event (everyone).
        io.sockets.emit('client-connected', { username: socket.username, userCount });
		
		// Print debug message(s).
        console.log('IO Registered socket ID ' + socket.id + ' as user "' + socket.username + '"');
		console.log('IO ' + userCount + ' user(s) registered');
		
		// If contestant set when user registers send them to ballot.
		if(contestant){
			
			// Return 'ballot-open' event (sender).
			socket.emit('ballot-open', contestant);
		
			// Print debug message(s).
        	console.log('IO Opening ballot "' + contestant.country + '" for user "' + socket.username + '"');
		}
	});
	
	/**
	 * ...
	 */
	socket.on('user-vote', function({ scores }){
		
		// If socket not registered or contestant not set, return.
		if(!socket.registered || !contestant){
			return;
		}

		// Print debug message(s).
		console.log('IO Registered user "' + socket.username + '" submitted scores for "' + contestant.country + '"');

		// Parse scores as integers and define vote object.
		var vote = new voteModel({
			user: socket.username,
			contestant: contestant.code,
			cat1: parseInt(scores.cat1),
			cat2: parseInt(scores.cat2),
			cat3: parseInt(scores.cat3),
			cat4: parseInt(scores.cat4),
			cat5: parseInt(scores.cat5)
		});

		// Save vote to database.
		vote.save(function(err, vote){
			if(err){
				console.log(err.message);
			}
		});

		// Return 'user-voted' event (sender).
		socket.emit('user-voted', contestant);

		// Return 'client-voted' event (everyone).
		io.sockets.emit('client-voted');

		// Print debug message(s).
		console.log('DB Saved vote ID ' + vote._id);
	});

	/*----------------------------------------------------------
	# User connection events
	----------------------------------------------------------*/
    /**
	 * Decrease user count on disconnect.
	 */
    socket.on('disconnect', function(){

		// If socket not registered, return.
		if(!socket.registered){
			return;
		}

		// Decrease registered user count.
		userCount--;

		// Return 'user-disconected' event (everyone).
        io.sockets.emit('client-disconnected', { username: socket.username, userCount });
		
		// Print debug message(s).
		console.log('IO Registered user "' + socket.username + '" disconnected');
		console.log('IO ' + userCount + ' user(s) registered');
	});
});

module.exports = { app: app, server: server };
