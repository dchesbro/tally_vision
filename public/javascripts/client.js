// ...
const LOCAL_STORAGE_KEY = 'tallyvisionName';

// ...
var socket = io('/client', {
  autoConnect: false,
});

// ...
socket.on('appBallotClose', function() {
  viewSet('scorecard');
});

// ...
socket.on('appBallotOpen', function(contestant) {
  var ballot = $('.view-ballot .card-body');

  $('.contestant-country', ballot).html(contestant.country);
  $('.contestant-details', ballot).html(contestant.artist + ' – "' + contestant.title + '"');

  viewSet('ballot');
});

// ...
socket.on('appVoted', function(score) {
  var ballot = $('.view-ballot');

  $('form', ballot).hide();
  $('.card-body .contestant-score', ballot).html(score);
});

// ...
socket.on('clientConnect', function(name) {
  localStorage.setItem(LOCAL_STORAGE_KEY, name);

  $('.navbar-brand').html(name);

  viewSet('scorecard');
});



// ...
$('form').on('submit', function(event) {
  event.preventDefault();

  $('button[type="submit"]', this).html('<span class="spinner-border spinner-border-sm" role="status"></span>');
  $('fieldset', this).prop('disabled', true);
});

// ...
$('.view-ballot form').on('click', function() {
  formBallotValidate(this);
});

// ...
$('.view-ballot form').on('submit', function() {
  var checked = $('input[type="radio"]:checked', this);
  var scores = [];

  scores = checked.map(function(i, field) {
    return parseInt($(field).val());
  }).get();

  socket.emit('clientBallotSubmit', scores);
});

// ...
$('.view-join form').on('keyup', function() {
  formJoinValidate(this);
});

// ...
$('.view-join form').on('submit', function() {
  var nameField = $('input#name', this);

  formJoinConnect(nameField.val());
});



// ...
function __init() {
  var form = $('.view-join form');
  var name = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (name) {
    $('input#name', form).val(name);
  }

  formJoinValidate(form);
  viewSet('join');

  /* if (name) {
    formJoinConnect(name);
  } else {
    viewSet('join');
  } */
}

// ...
function formBallotValidate(form) {
  var error = false;
  var categories = $('li.list-group-item', form);
  var checked = $('input[type="radio"]:checked', form);

  if (checked.length !== categories.length) {
    error = true;
  }

  formSubmitProp(form, error);
}

// ...
function formJoinConnect(name) {
  socket.auth = {
    name: name,
  };

  socket.connect();
}

// ...
function formJoinValidate(form) {
  var error = false;
  var nameField = $('input#name', form);

  if (!nameField.val()) {
    error = true;
  };

  formSubmitProp(form, error);
}

// ...
function formSubmitProp(form, error) {
  if (error) {
    $('button[type="submit"]', form).prop('disabled', true);
  } else {
    $('button[type="submit"]', form).prop('disabled', false);
  }
}

// ...
function viewSet(view) {
  $('html').scrollTop(0);
  $('[class*="view-"]').hide();
  $('.view-' + view).show();
}

__init();
