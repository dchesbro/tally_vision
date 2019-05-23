$(function(){

	// Initialize Socket.IO instance.
	var socket = io();

	// Define local host variables.
	var index;

	/*----------------------------------------------------------
	# Host functions
	----------------------------------------------------------*/
	/**
	 * ...
	 */
	function initHost(){

		// Send app event.
		socket.emit('hostRegister');
	}

	/*----------------------------------------------------------
	# Host browser events
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
			socket.emit('hostBallotInit', index);
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
		socket.emit('hostBallotKill');
	});

	/*----------------------------------------------------------
	# Host events
	----------------------------------------------------------*/
	/**
	 * ...
	 */
	socket.on('hostRegister', function(userCount){
		
		// ...
		$('#stats-users').text(userCount);
	});

	/**
	 * ...
	 */
	socket.on('hostUpdateTable', function(contestantData){

		// ...
		$.each(contestantData, function(index, contestant){
			$('#contestants table tbody tr#' + contestant._id + ' .col-score').text(contestant.score);
			$('#contestants table tbody tr#' + contestant._id + ' .col-votes').text(contestant.votes);
		});
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

	initHost();
});
