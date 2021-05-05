// ...
const LOCAL_STORAGE = 'tallyvisionName';

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
  var ballot = $('#view-ballot');

  $('form', ballot).show();
  $('form fieldset', ballot).prop('disabled', false);
  $('form input[type="radio"]', ballot).prop('checked', false);
  $('form label', ballot).removeClass('active');
  $('.card-body .contestant-country', ballot).html(contestant.country);
  $('.card-body .contestant-details', ballot).html(contestant.artist + ' – "' + contestant.title + '"');
  $('.card-body .contestant-score', ballot).html('');

  viewSet('ballot');
});

// ...
socket.on('appVoted', function(score) {
  var ballot = $('#view-ballot');

  $('form', ballot).hide();
  $('.card-body .contestant-score', ballot).html(score);
});

// ...
socket.on('clientConnect', function(name) {
  localStorage.setItem(LOCAL_STORAGE, name);

  $('.navbar-brand').html(name);

  viewSet('scorecard');
});

// ...
socket.on('clientScorecard', function(scores) {
  var scorecard = $('#view-scorecard');

  for (let {id, voter, contestant, score} of scores) {
    $('tr#' + contestant + ' .col-score', scorecard).html(score);
  }
});



// ...
$('form').on('submit', function(event) {
  event.preventDefault();

  $('fieldset', this).prop('disabled', true);
});

// ...
$('#view-ballot form').on('click', function() {
  formBallotValidate(this);
});

// ...
$('#view-ballot form').on('submit', function() {
  var checked = $('input[type="radio"]:checked', this);
  var scores = [];

  scores = checked.map(function(i, field) {
    return parseInt($(field).val());
  }).get();

  socket.emit('clientBallotSubmit', scores);
});

// ...
$('#view-join form').on('keyup', function() {
  formJoinValidate(this);
});

// ...
$('#view-join form').on('submit', function() {
  var nameField = $('input#name', this);

  formJoinConnect(nameField.val());
});



// ...
function __init() {
  var form = $('#view-join form');
  var name = localStorage.getItem(LOCAL_STORAGE);

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
  $('[id*="view-"]').hide();
  $('#view-' + view).show();
}

__init();
