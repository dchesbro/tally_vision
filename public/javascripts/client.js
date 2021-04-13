var socket = io('/client', {
  autoConnect: false,
});

//...
var clientSessionID = null;
var clientUserID = null;
var clientUsername = '';

//...
socket.on('clientJoin', function(args) {
  console.log(args);
});



//...
$('form').on('submit', function(event) {
  var button = $('button[type="submit"]', this);
  var fields = $('fieldset', this);

  event.preventDefault();

  button.html('<span class="spinner-border spinner-border-sm" role="status"></span>');
  fields.prop('disabled', true);
});

//...
$('.view-ballot form').on('click', function() {
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

//...
$('.view-join form').on('keyup', function() {
  var error = false;

  if (!$('input#username', this).val()) {
    error = true;
  };

  if (error) {
    $('button', this).prop('disabled', true);
  } else {
    $('button', this).prop('disabled', false);
  }
});

//...
$('.view-join form').on('click', function(event) {
  var username = $('input#username', this).val();

  socket.auth = {
    client: true,
    username: username,
  };

  socket.connect();
});



//...
function __init() {
  setView('join');
}

//...
function setView(view) {
  $('[class*="view-"]').hide();
  $('.view-' + view).show();
}



__init();
