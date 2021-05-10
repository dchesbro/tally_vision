// ...
const LOCAL_STORAGE = 'tallyvisionName';

// ...
var socket = io('/client', {
  autoConnect: false,
});

// ...
socket.on('appBallotClose', function() {  
  uiShow('scorecard');
});

// ...
socket.on('appBallotOpen', function(contestant) {
  var ui = $('#ui-ballot');

  $('form', ui).show();
  $('form fieldset', ui).prop('disabled', false);
  $('form input[type="radio"]', ui).prop('checked', false);
  $('form label', ui).removeClass('active');
  $('.card-header .contestant-country', ui).html(contestant.country);
  $('.card-header .contestant-details', ui).html(contestant.artist + ' – "' + contestant.title + '"');
  $('.card-header .contestant-score', ui).html('');

  uiShow('ballot');
});

// ...
socket.on('appVoted', function(score) {
  var ui = $('#ui-ballot');

  $('form', ui).hide();
  $('.card-header .contestant-score', ui).html(score);
});

// ...
socket.on('clientConnect', function(name) {
  localStorage.setItem(LOCAL_STORAGE, name);

  $('.navbar-brand').html(name);

  uiShow('scorecard');
});

// ...
socket.on('clientScorecard', function(scores) {
  var ui = $('#ui-scorecard');

  for (let {id, voter, contestant, score} of scores) {
    $('tr#' + contestant + ' .col-score', ui).html(score);
  }
});

// ...
$('form').on('submit', function(event) {
  event.preventDefault();

  $('fieldset', this).prop('disabled', true);
});

// ...
$('#gnbb button').on('click', function() {
  socket.emit('clientGNBB');
});

// ...
$('#ui-ballot form').on('click', function() {
  formBallotValidate(this);
});

// ...
$('#ui-ballot form').on('submit', function() {
  var checked = $('input[type="radio"]:checked', this);
  var scores = [];

  scores = checked.map(function(i, field) {
    return parseInt($(field).val());
  }).get();

  socket.emit('clientBallotSubmit', scores);
});

// ...
$('#ui-join form').on('keyup', function() {
  formJoinValidate(this);
});

// ...
$('#ui-join form').on('submit', function() {
  var nameInput = $('input#name', this);

  formJoinConnect(nameInput.val());
});

// ...
function __init() {
  var form = $('#ui-join form');
  var nameLocal = localStorage.getItem(LOCAL_STORAGE);

  if (nameLocal) {
    $('input#name', form).val(nameLocal);
  }

  formJoinValidate(form);
  uiShow('join');

  /* if (nameLocal) {
    formJoinConnect(nameLocal);
  } else {
    uiShow('join');
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
  var nameInput = $('input#name', form);

  if (!nameInput.val()) {
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
function uiShow(ui) {
  $('html').scrollTop(0);
  $('[id*="ui-"]').hide();
  $('#ui-' + ui).show();
}

__init();
