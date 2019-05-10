$(function(){

    // Initialize Socket.IO instance.
    var socket = io();
    
    // Set local server variables.
    var id;
    
    /**
	 * ...
	 */
    $('.ballot-link.init').on('click', function(event){

        // Prevent jump to anchor reference.
        event.preventDefault();

        // Set contestant ID.
        id = $(this).attr('id');

        // If contestant ID set, return 'ballot-init' event.
        if(id){
            socket.emit('ballot-init', id);
        }
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
