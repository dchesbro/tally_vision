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
     * Update current ballot stat display.
     */
    function statsBallot(country = '--'){
        $('#stats-ballot').text(country);
    }

    /**
     * Update users registered stat display.
     */
    function statsUsers(userCount = 0){
        $('#stats-users').text(userCount);
    }

    /*----------------------------------------------------------
	# Admin JS events
    ----------------------------------------------------------*/
    /**
	 * ...
	 */
    $('.open').on('click', function(event){

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
	 * ...
	 */
    $('.kill').on('click', function(event){

        // Prevent jump to anchor reference.
        event.preventDefault();

        // Set current contestant index to null.
        index = null;

        // Send 'ballot-kill' event.
        socket.emit('ballot-kill');
    });

    /*----------------------------------------------------------
	# Admin Socket.IO events
    ----------------------------------------------------------*/
    /*----------------------------------------------------------
	## Ballot events
    ----------------------------------------------------------*/
    /**
	 * ...
	 */
    socket.on('ballot-open', function(contestant){
        statsBallot(contestant.country);

        // Hide open buttons.
        $('.open').hide();

        // Show kill button for current contestant index.
        $('#' + contestant.code + '.kill').show();
    });

    /**
	 * ...
	 */
    socket.on('ballot-kill', function(){
        statsBallot();

        // Hide kill actions.
        $('.kill').hide();

        // Show init actions.
        $('.open').show();
    });

    /*----------------------------------------------------------
	## Connection events
    ----------------------------------------------------------*/
    /**
     * ...
     */
    socket.on('admin-register', function(userCount){
        statsUsers(userCount);
    });

    /**
	 * ...
	 */
    socket.on('user-disconnected', function({ username, userCount }){
        statsUsers(userCount);
    });

    /**
	 * ...
	 */
    socket.on('user-registered', function({ username, userCount }){
        statsUsers(userCount);
    });

    initAdmin();
});
