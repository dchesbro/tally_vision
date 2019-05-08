var createError    = require('http-errors');          // Create HTTP error objects
var express        = require('express');              // Application framework
var path           = require('path');                 // File and directory path utilities
var bodyParser     = require('body-parser');          // HTTP body parser 
var cookieParser   = require('cookie-parser');        // HTTP cookie parser
var logger         = require('morgan');               // HTTP request logger
var sassMiddleware = require('node-sass-middleware'); // Recompile SASS files for Express servers

// Set routing.
var clientRouter   = require('./routes/client');
var serverRouter   = require('./routes/server');

// Initialize app.
var app            = express();

// Initialize Socket.IO server.
var server         = require('http').Server(app);
var io             = require('socket.io')(server);

// Set array of contestants.
app.set('contestants', [
	{
		country: 'Albania',
		code:    'al',
		artist:  'Jonida Maliqi',
		title:   'Ktheju tokës'
	},
	{
		country: 'Armenia',
		code:    'am',
		artist:  'Srbuk',
		title:   'Walking Out'
	},
	{
		country: 'Australia',
		code:    'au',
		artist:  'Kate Miller-Heidke',
		title:   'Zero Gravity'
	},
	{
		country: 'Austria',
		code:    'at',
		artist:  'Paenda',
		title:   'Limits'
	},
	{
		country: 'Azerbaijan',
		code:    'az',
		artist:  'Chingiz',
		title:   'Truth'
	},
	{
		country: 'Belarus',
		code:    'by',
		artist:  'Zena',
		title:   'Like It'
	},
	{
		country: 'Belgium',
		code:    'be',
		artist:  'Eliot',
		title:   'Wake Up'
	},
	{
		country: 'Croatia',
		code:    'hr',
		artist:  'Roko',
		title:   'The Dream'
	},
	{
		country: 'Cyprus',
		code:    'cy',
		artist:  'Tamta',
		title:   'Replay'
	},
	{
		country: 'Czech Republic',
		code:    'cz',
		artist:  'Lake Malawi',
		title:   'Friend of a Friend'
	},
	{
		country: 'Denmark',
		code:    'dk',
		artist:  'Leonora',
		title:   'Love Is Forever'
	},
	{
		country: 'Estonia',
		code:    'ee',
		artist:  'Victor Crone',
		title:   'Storm'
	},
	{
		country: 'Finland',
		code:    'fi',
		artist:  'Darude feat. Sebastian Rejman',
		title:   'Look Away'
	},
	{
		country: 'France',
		code:    'fr',
		artist:  'Bilal Hassani',
		title:   'Roi'
	},
	{
		country: 'Georgia',
		code:    'ge',
		artist:  'Oto Nemsadze',
		title:   'Sul tsin iare'
	},
	{
		country: 'Germany',
		code:    'de',
		artist:  'S!sters',
		title:   'Sister'
	},
	{
		country: 'Greece',
		code:    'gr',
		artist:  'Katerine Duska',
		title:   'Better Love'
	},
	{
		country: 'Hungary',
		code:    'hu',
		artist:  'Joci Pápai',
		title:   'Az én apám'
	},
	{
		country: 'Iceland',
		code:    'is',
		artist:  'Hatari',
		title:   'Hatrið mun sigra'
	},
	{
		country: 'Ireland',
		code:    'ie',
		artist:  'Sarah McTernan',
		title:   '22'
	},
	{
		country: 'Israel',
		code:    'il',
		artist:  'Kobi Marimi',
		title:   'Home'
	},
	{
		country: 'Italy',
		code:    'it',
		artist:  'Mahmood',
		title:   'Soldi'
	},
	{
		country: 'Latvia',
		code:    'lv',
		artist:  'Carousel',
		title:   'That Night'
	},
	{
		country: 'Lithuania',
		code:    'lt',
		artist:  'Jurijus',
		title:   'Run with the Lions'
	},
	{
		country: 'FYR Macedonia',
		code:    'mk',
		artist:  'Tamara Todevska',
		title:   'Proud'
	},
	{
		country: 'Malta',
		code:    'mt',
		artist:  'Michela Pace',
		title:   'Chameleon'
	},
	{
		country: 'Moldova',
		code:    'md',
		artist:  'Anna Odobescu',
		title:   'Stay'
	},
	{
		country: 'Montenegro',
		code:    'me',
		artist:  'D-moll',
		title:   'Heaven'
	},
	{
		country: 'Netherlands',
		code:    'nl',
		artist:  'Duncan Laurence',
		title:   'Arcade'
	},
	{
		country: 'Norway',
		code:    'no',
		artist:  'KEiiNO',
		title:   'Spirit in the Sky'
	},
	{
		country: 'Poland',
		code:    'pl',
		artist:  'Tulia',
		title:   'Fire of Love (Pali się)'
	},
	{
		country: 'Portugal',
		code:    'pt',
		artist:  'Conan Osíris',
		title:   'Telemóveis'
	},
	{
		country: 'Romania',
		code:    'ro',
		artist:  'Ester Peony',
		title:   'On a Sunday'
	},
	{
		country: 'Russia',
		code:    'ru',
		artist:  'Sergey Lazarev',
		title:   'Scream'
	},
	{
		country: 'San Marino',
		code:    'sm',
		artist:  'Serhat',
		title:   'Say Na Na Na'
	},
	{
		country: 'Serbia',
		code:    'rs',
		artist:  'Nevena Božović',
		title:   'Kruna'
	},
	{
		country: 'Slovenia',
		code:    'si',
		artist:  'Zala Kralj & Gašper Šantl',
		title:   'Sebi'
	},
	{
		country: 'Spain',
		code:    'es',
		artist:  'Miki',
		title:   'La venda'
	},
	{
		country: 'Sweden',
		code:    'se',
		artist:  'John Lundvik',
		title:   'Too Late For Love'
	},
	{
		country: 'Switzerland',
		code:    'ch',
		artist:  'Luca Hänni',
		title:   'She Got Me'
	},
	{
		country: 'United Kingdom',
		code:    'gb',
		artist:  'Michael Rice',
		title:   'Bigger Than Us'
	}
]);

// Set array of ballot categories.
app.set('ballot-categories', [
	{
		title:  'Category 1',
		label0: 'Worst',
		label5: 'Best'
	},
	{
		title:  'Category 2',
		label0: 'Worst',
		label5: 'Best'
	},
	{
		title:  'Category 3',
		label0: 'Worst',
		label5: 'Best'
	},
	{
		title:  'Category 4',
		label0: 'Worst',
		label5: 'Best'
	},
	{
		title:  'Graham Norton Bitch Quota',
		label0: 'Worst',
		label5: 'Best'
	}
]);

// Initialize array of users.
var users = [];

/* ...
app.use(function(req, res, next){
	res.io = io;
	next();
}); */

// Client Socket.IO event handlers.
io.on('connection', function(socket){

	// Initiate voting.
	socket.on('user-register', function(username){

		// ...
		console.log('IO Registering socket ID: ' + socket.id + ' as user "' + username + '"');
		users[username] = socket.id;
		
		// ...
		console.log(users);
		io.emit('user-register', username);
	});
});

// Server Socket.IO event handlers.
io.on('connection', function(socket){

	// Initiate voting.
	socket.on('ballot-init', function(id){

		// ...
		console.log('IO Initiating vote for ballot ID: ' + id );
		io.emit('ballot-init', id);
	});

	// ...
	socket.on('ballot-submit', function(vote){
		
	});

	console.log('IO Connection from socket ID: ' + socket.id);

	// Get current number of connections.
	var connections = socket.client.conn.server.clientsCount;
	
	console.log('IO ' + connections + ' current connection(s)');
	io.emit('stats-connections', connections);
});

// Set view engine.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
	src: path.join(__dirname, 'public'),
	dest: path.join(__dirname, 'public'),
	indentedSyntax: false,
	sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', clientRouter);
app.use('/server', serverRouter);

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

module.exports = { app: app, server: server };
