$(function(){

	// Initialize Socket.IO instance.
	var socket = io();

	// Define local admin variables.
	var index;

	/*----------------------------------------------------------
	# Admin functions
	----------------------------------------------------------*/
	/**
	 * ...
	 */
	function initAdmin(){

		// Send app event.
		socket.emit('adminRegister');
	}

	/*----------------------------------------------------------
	# Admin browser events
	----------------------------------------------------------*/
	/**
	 * ...
	 */
	$('.init').on('click', function(event){

		// Prevent jump to anchor reference.
		event.preventDefault();

		// Set index.
		index = $(this).attr('data-index');

		// If index set, send app event.
		if(index){
			socket.emit('adminBallotInit', index);
		}
	});

	/**
	 * ...
	 */
	$('.kill').on('click', function(event){

		// Prevent jump to anchor reference.
		event.preventDefault();

		// Set index to null.
		index = null;

		// Send app event.
		socket.emit('adminBallotKill');
	});

	/*----------------------------------------------------------
	# Admin events
	----------------------------------------------------------*/
	/**
	 * ...
	 */
	socket.on('adminRegister', function(userCount){
		
		// ...
		$('#stats-users').text(userCount);
	});

	/**
	 * ...
	 */
	socket.on('ballotOpen', function(contestant){

		// ...
		$('#stats-ballot').text(contestant.country);

		// Hide init buttons.
		$('.init').hide();

		// Show kill button for current contestant index.
		$('#' + contestant.code + ' .kill').show();
	});

	/**
	 * ...
	 */
	socket.on('ballotClose', function(){

		// ...
		$('#stats-ballot').text('--');

		// Hide kill button.
		$('.kill').hide();

		// Show init buttons.
		$('.init').show();
	});

	/**
	 * ...
	 */
	socket.on('userDisconnected', function({ username, userCount }){
		
		// ...
		$('#stats-users').text(userCount);
	});

	/**
	 * ...
	 */
	socket.on('userConnected', function({ username, userCount }){
		
		// ...
		$('#stats-users').text(userCount);
	});

	initAdmin();
});
