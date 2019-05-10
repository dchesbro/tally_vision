$(function(){

    // Initialize Socket.IO instance.
    var socket = io();
    
    /**
	 * ...
	 */
    $('.ballot-link.init').on('click', function(event){

        // Prevent jump to anchor reference.
        event.preventDefault();

        // Set contestant index number.
        var index = $(this).attr('id');

        // If contestant index number set, return 'server-ballot-open' event.
        if(index){
            socket.emit('ballot-init', index);
        }
    });

    /**
	 * ...
	 */
    $('.ballot-link.kill').on('click', function(event){

        // Prevent jump to anchor reference.
        event.preventDefault();

        // Return 'server-ballot-kill' event.
        socket.emit('ballot-kill');
    });

    /**
	 * ...
	 */
    socket.on('ballot-close', function(contestant){

        // Update current ballot display.
        $('#stats-ballot').text('--');
    });

    /**
	 * ...
	 */
    socket.on('ballot-open', function(contestant){

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
});
