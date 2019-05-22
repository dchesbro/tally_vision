$(function(){

	// Define Socket.IO instance.
	var socket = io();
	
	// Define local user variables.
	var registered = false;
	var username;
	
	/*----------------------------------------------------------
	# User functions
	----------------------------------------------------------*/
	/**
	 * Initialize user connections.
	 */
	function initUser(){

		// Focus input on username field.
		$('input#username').focus();
	}

	/**
	 * Shuffle user card view.
	 */
	function shuffleCard(card){

		// Hide all card views.
		$('.card').hide();

		// Show defined card.
		$(card).show();

		// Scroll to top of viewport.
		$(window).scrollTop(0);
	}

	/**
	 * ...
	 */
	function updateScore(vote){

		// ...
		var total = vote.cat1 + vote.cat2 + vote.cat3 + vote.cat4;
		
		// ...
		$('#contestant-score').text(total);
	}

	/*----------------------------------------------------------
	# User JS events
	----------------------------------------------------------*/
	/**
	 * Define scores object and send 'user-vote' event.
	 */
	$('#ballot form').submit(function(event){

		// Prevent form submission.
		event.preventDefault();

		// Get ballot scores as object.
		var scores = {
			cat1: $('input#cat1:checked').val(),
			cat2: $('input#cat2:checked').val(),
			cat3: $('input#cat3:checked').val(),
			cat4: $('input#cat4:checked').val()
		};

		// If scores found for all categories, send 'ballot-vote' event.
		if(!$.isEmptyObject(scores)){
			socket.emit('ballot-vote', scores);
		}
	});

	/**
	 * Set username and send 'user-register' event.
	 */
	$('#user-registration form').submit(function(event){

		// Prevent form submission.
		event.preventDefault();

		// Trim input and set username.
		username = $('input#username').val().trim();

		// If username set, send 'user-register' event.
		if(username){
			socket.emit('user-register', username);
		}
	});

	/*----------------------------------------------------------
	# User Socket.IO events
	----------------------------------------------------------*/
	/*----------------------------------------------------------
	## Ballot events
	----------------------------------------------------------*/
	/**
	 * Set voting and shuffle to contestants card view.
	 */
	socket.on('ballot-close', function(){

		// If user not registered, return.
		if(!registered){ 
			return;
		}

		// Shuffle to contestants card view.
		shuffleCard('#contestants');
	});

	/**
	 * Set ballot, voting status, and shuffle to ballot card view.
	 */
	socket.on('ballot-open', function(contestant){

		// If user not registered, return.
		if(!registered){
			return;
		}
		
		// Reset form inputs and score.
		$('#ballot input:radio').prop('checked', false);
		$('#ballot label').removeClass('active');
		$('#contestant-score').empty();

		// Update ballot with contestant details.
		$('#contestant-country').text(contestant.country);
		$('#contestant-details').text(contestant.artist + ' – "' + contestant.title + '"');

		// Show ballot form.
		$('#ballot form').show();

		// Shuffle to ballot card view.
		shuffleCard('#ballot');
	});

	/**
	 * Set score and hide ballot form.
	 */
	socket.on('ballot-vote', function(vote){
		updateScore(vote);

		// Hide ballot form.
		$('#ballot form').hide();
	});
	
	/*----------------------------------------------------------
	## Connection events
	----------------------------------------------------------*/
	/**
	 * Set registered to false on disconnect.
	 */
	socket.on('disconnect', function(){

		// Set registered to false.
		registered = false;
	});

	/**
	 * If username set, send 'user-register' event on reconnect.
	 */
	socket.on('reconnect', function(){
		
		// If username set, send 'user-register' event.
		if(username){
			socket.emit('user-register', username);
		}
	});

	/**
	 * Register users and shuffle to whatever card view.
	 */
	socket.on('user-register', function(){

		// Set registered to true.
		registered = true;

		// Set and show user heading.
		$('#user-heading').text(username).show();

		// Shuffle to contestants card view.
		shuffleCard('#contestants');
	});

	/*----------------------------------------------------------
	## Database events
	----------------------------------------------------------*/
	/**
	 * ...
	 */
	socket.on('userUpdateScores', function(votes){

		var topScore = { _id: null, code: null, total: 0 };

		$.each(votes, function(index, vote){
			$('#contestants table tbody tr#' + vote.code + ' .col-score').text(vote.total);

			if(topScore.total <= vote.total){
				topScore = vote;
			}
		});

		$('#contestants table tbody tr').removeClass();
		$('#contestants table tbody tr#' + topScore.code).addClass('table-primary');
	});

	initUser();
});
