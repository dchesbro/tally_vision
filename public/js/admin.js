$(function(){

	// Initialize Socket.IO instance.
	var socket = io();

	// Set local server variables.
	var index;

	/*----------------------------------------------------------
	# Admin functions
	----------------------------------------------------------*/
	/**
	 * Initialize admin connections.
	 */
	function initAdmin(){

		// Send 'admin-register' event.
		socket.emit('admin-register');
	}

	/**
	 * Update current ballot display.
	 */
	function updateBallot(country = '--'){
		$('#stats-ballot').text(country);
	}

	/**
	 * Update users registered display.
	 */
	function updateUsers(userCount = 0){
		$('#stats-users').text(userCount);
	}

	/*----------------------------------------------------------
	# Admin JS events
	----------------------------------------------------------*/
	/**
	 * Initiate ballot for selected contestant.
	 */
	$('.init').on('click', function(event){

		// Prevent jump to anchor reference.
		event.preventDefault();

		// Set contestant index.
		index = $(this).attr('data-index');

		// If contestant index set, send 'ballot-init' event.
		if(index){
			socket.emit('ballot-open', index);
		}
	});

	/**
	 * Kill voting for any open ballots.
	 */
	$('.kill').on('click', function(event){

		// Prevent jump to anchor reference.
		event.preventDefault();

		// Set current contestant index to null.
		index = null;

		// Send 'ballot-close' event.
		socket.emit('ballot-close');
	});

	/*----------------------------------------------------------
	# Admin Socket.IO events
	----------------------------------------------------------*/
	/*----------------------------------------------------------
	## Ballot events
	----------------------------------------------------------*/
	/**
	 * Update current ballot display and hide/show appropriate actions.
	 */
	socket.on('ballot-open', function(contestant){
		updateBallot(contestant.country);

		// Hide init buttons.
		$('.init').hide();

		// Show kill button for current contestant index.
		$('#' + contestant.code + ' .kill').show();
	});

	/**
	 * Update current ballot display and hide/show appropriate actions.
	 */
	socket.on('ballot-close', function(){
		updateBallot();

		// Hide kill buttons.
		$('.kill').hide();

		// Show init buttons.
		$('.init').show();
	});

	/*----------------------------------------------------------
	## Connection events
	----------------------------------------------------------*/
	/**
	 * Update users registered display.
	 */
	socket.on('admin-register', function(userCount){
		updateUsers(userCount);
	});

	/**
	 * Update users registered display.
	 */
	socket.on('user-disconnected', function({ username, userCount }){
		updateUsers(userCount);
	});

	/**
	 * Update users registered display.
	 */
	socket.on('user-registered', function({ username, userCount }){
		updateUsers(userCount);
	});

	initAdmin();
});
