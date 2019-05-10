$(function(){

    // Initialize Socket.IO instance.
    var socket = io();
    
    // Set local client variables.
    var currentBallot;
    var registered = false;
    var username;

    /**
     * Initiate client connection.
     */
    function init() {

        // Focus input on username input field.
        $('input#username').focus();
    }

    /**
     * Change client views.
     */
    function shuffleCard(cardID){

        // Hide all card views.
        $('.card').hide();

        // Show defined card.
        $(cardID).show();

        // Scroll to top of window.
        $(window).scrollTop(0);
    }

    /**
	 * Set vote object and return 'user-vote' event.
	 */
    $('#ballot form').submit(function(event){

        // Prevent form submission.
        event.preventDefault();

        // Set vote object for current ballot.
        var vote = {
            user: username,
            code: currentBallot,
            cat1: $('input#cat1:checked').val(),
            cat2: $('input#cat2:checked').val(),
            cat3: $('input#cat3:checked').val(),
            cat4: $('input#cat4:checked').val(),
            cat5: $('input#cat5:checked').val()
        };

        // If vote not empty assume everything is good, return 'user-vote' event.
        if(!$.isEmptyObject(vote)){
            socket.emit('user-vote', { username, vote });
        }
    });

    /**
	 * Set username and return 'user-register' event.
	 */
    $('#user-registration form').submit(function(event){

        // Prevent form submission.
        event.preventDefault();

        // Trim input and set username.
        username = $('input#username').val().trim();

        // If username set, return 'user-register' event.
        if(username){
            socket.emit('user-register', username);
        }
    });

    /**
     * ...
     */
    socket.on('ballot-close', function(){
        
        // Set current ballot to null.
        currentBallot = null;

        // Shuffle to contestants card view.
        shuffleCard('#contestants');
	});
    
    /**
	 * Set ballot details and shuffle to ballot card view.
	 */
    socket.on('ballot-open', function(contestant){

        // If client not registered or already voting, return.
        if(!registered || currentBallot){ 
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

        // Set current ballot to contestant country code.
        currentBallot = contestant.code;

        // Shuffle to ballot card view.
        shuffleCard('#ballot');
    });

    /**
     * Re-register clients on reconnect.
     */
    socket.on('reconnect', function(){
        
        // If username set, return 'user-register' event.
        if(username){
            socket.emit('user-register', username);
        }
	});

    /**
	 * Register clients and shuffle to whatever card view.
	 */
    socket.on('user-registered', function(){

        // Set user heading and hide registration form.
        $('#user-heading').text(username).show();

        // Set registered to true.
        registered = true;

        // If current ballot set, shuffle to ballot card view...
        if(currentBallot){
            shuffleCard('#ballot');
        
        // ...else, shuffle to contestants table card view.
        }else{
            shuffleCard('#contestants');
        }
    });

    /**
	 * ...
	 */
    socket.on('user-voted', function(){

        // ...
        $('#contestant-score').text();

        // Hide ballot form.
        $('#ballot form').hide();
    });

    init();
});
