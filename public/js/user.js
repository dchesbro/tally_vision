$(function(){

	// Initialize Socket.IO instance.
	var socket = io();
	
	// Define local user variables.
	var registered = false;
	var username;

	/*----------------------------------------------------------
	# User functions
	----------------------------------------------------------*/
	/**
	 * ...
	 */
	function initUser(){

		// Focus input on username field.
		$('input#username').focus();
	}

	/**
	 * ...
	 */
	function shuffleCard(card){

		// Hide all card views.
		$('.card').hide();

		// Show defined card.
		$(card).show();

		// Scroll to top of viewport.
		$(window).scrollTop(0);
	}

	/*----------------------------------------------------------
	# User browser events
	----------------------------------------------------------*/
	/**
	 * ...
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

		// If scores found for all categories, send app event.
		if(!$.isEmptyObject(scores)){
			socket.emit('userBallotVote', scores);
		}
	});

	/**
	 * ...
	 */
	$('#user-registration form').submit(function(event){

		// Prevent form submission.
		event.preventDefault();

		// Trim input and set username.
		username = $('input#username').val().trim();

		// If username set, send app event.
		if(username){
			socket.emit('userRegister', username);
		}
	});

	/*----------------------------------------------------------
	# User events
	----------------------------------------------------------*/
	/**
	 * ...
	 */
	socket.on('ballotClose', function(){

		// If user not registered, return.
		if(!registered){ 
			return;
		}

		// Show contestants card view.
		shuffleCard('#contestants');
	});

	/**
	 * ...
	 */
	socket.on('ballotOpen', function(contestant){

		// If user not registered, return.
		if(!registered){
			return;
		}
		
		// Reset form inputs and score.
		$('#ballot input:radio').prop('checked', false);
		$('#ballot label').removeClass('active');
		$('#contestant-score').empty().hide();

		// Update ballot with contestant details.
		$('#contestant-country').text(contestant.country);
		$('#contestant-details').text(contestant.artist + ' – "' + contestant.title + '"');

		// Show ballot form.
		$('#ballot form').show();

		// Show ballot card view.
		shuffleCard('#ballot');
	});

	/**
	 * ...
	 */
	socket.on('disconnect', function(){

		// Set registered to false.
		registered = false;
	});

	/**
	 * ...
	 */
	socket.on('reconnect', function(){
		
		// If username set, send app event.
		if(username){
			socket.emit('userRegister', username);
		}
	});

	/**
	 * ...
	 */
	socket.on('userBallotVote', function(vote){

		// Hide ballot form.
		$('#ballot form').hide();

		// Update and show total score.
		$('#contestant-score').text(vote.total).show();
	});

	/**
	 * ...
	 */
	socket.on('userRegister', function(){

		// Set registered to true.
		registered = true;

		// Set and show user heading.
		$('#user-heading').text(username).show();

		// Show contestants card view.
		shuffleCard('#contestants');
	});

	/**
	 * ...
	 */
	socket.on('userUpdateScores', function(userVotes){

		// ...
		$.each(userVotes, function(index, vote){
			$('#contestants table tbody tr#' + vote.code + ' .col-score').text(vote.total);
		});
	});

	initUser();
});
