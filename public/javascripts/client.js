var socket = io();

socket.on('clientJoin', function(arg) {
  console.log(arg);
});


// ...
$('#ballot form').click(function() {
  var error = false;
  var categories = $('.list-group-item', this);
  var checked = $('input[type="radio"]:checked', this);

  if (checked.length !== categories.length) {
    error = true;
  }

  if (error) {
    $('button', this).prop('disabled', true);
  } else {
    $('button', this).prop('disabled', false);
  }
});

// ...
$('#join form').keyup(function() {
  var error = false;

  if (!$('input#user-name').val()) {
    error = true;
  };

  if (error) {
    $('button', this).prop('disabled', true);
  } else {
    $('button', this).prop('disabled', false);
  }
});

// ...
$('#join form').submit(function(event) {
  event.preventDefault();
  
  socket.emit('clientJoin', {
    name: $('input#user-name').val(),
  });
});

// ...
$('#join input#user-name').focus();
