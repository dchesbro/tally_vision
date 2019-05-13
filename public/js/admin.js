$(function(){

    // Initialize Socket.IO instance.
    var socket = io();

    // Set local server variables.
    var index;

    /**
     * Initialize user connections.
     */
    function initAdmin(){

        // ...
        socket.emit('admin-connect');
    }

    /**
	 * ...
	 */
    $('.ballot-action.init').on('click', function(event){

        // Prevent jump to anchor reference.
        event.preventDefault();

        // Set contestant index.
        index = $(this).attr('data-index');

        // If contestant index number set, return 'server-ballot-open' event.
        if(index){
            socket.emit('ballot-init', index);
        }
    });

    /**
	 * ...
	 */
    $('.ballot-action.kill').on('click', function(event){

        // Prevent jump to anchor reference.
        event.preventDefault();

        // Set current contestant index to null.
        index = null;

        // Return 'server-ballot-kill' event.
        socket.emit('ballot-kill');
    });

    /**
     * ...
     */
    socket.on('admin-connected', function({ contestant, userCount }){
        
        // Update registered user count display.
        $('#stats-users').text(userCount);

        if(contestant){

            // Hide init actions.
            $('.ballot-action.init').hide();

            // Show kill action for current contestant index.
            $('#' + contestant.code + '.ballot-action.kill').show();

            // Update current ballot display.
            $('#stats-ballot').text(contestant.country);
        }
    });

    /**
	 * ...
	 */
    socket.on('ballot-close', function(){

        // Hide kill actions.
        $('.ballot-action.kill').hide();

        // Show init actions.
        $('.ballot-action.init').show();

        // Update current ballot display.
        $('#stats-ballot').text('--');
    });

    /**
	 * ...
	 */
    socket.on('ballot-open', function(contestant){

        // Hide init actions.
        $('.ballot-action.init').hide();

        // Show kill action for current contestant index.
        $('#' + contestant.code + '.ballot-action.kill').show();

        // Update current ballot display.
        $('#stats-ballot').text(contestant.country);
    });

    /**
	 * ...
	 */
    socket.on('client-connected', function({ username, userCount }){

        // Update registered user count display.
        $('#stats-users').text(userCount);
    });

    /**
	 * ...
	 */
    socket.on('client-disconnected', function({ username, userCount }){

        // Update registered user count display.
        $('#stats-users').text(userCount);
    });

    initAdmin();
});
