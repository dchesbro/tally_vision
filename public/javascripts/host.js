var socket = io('/host');

// ...
socket.on('appBallotClose', function() {
  var widget = $('#widget-voting');

  $('button.ballot-close').hide();
  $('button.ballot-open').show();
  $('.badge', widget).html('Closed');
  $('.card-body', widget).hide();
});

// ...
socket.on('appBallotOpen', function(contestant) {
  var tr = $('tr#' + contestant.code);
  var widget = $('#widget-voting');
  
  $('button.ballot-close', tr).show();
  $('button.ballot-open').hide();
  $('.badge', widget).html('Open');
  $('.card-body .contestant-country', widget).html(contestant.country);
  $('.card-body .contestant-details', widget).html(contestant.artist + ' – "' + contestant.title + '"');
  $('.card-body', widget).show();
});

//...
socket.on('hostConnect', function() {
  // TODO.
});

//...
socket.on('hostVoters', function(voters) {
  var tbody = '';
  var widget = $('#widget-voters');

  for (let {connected, name, voted} of voters) {
    var tr = '<tr id=' + name + '>';

    tr += '<td class="col-connected text-center text-nowrap ' + connected + '"></td>';
    tr += '<td class="col-name">' + name + '</td>';
    tr += '<td class="col-voted text-center text-nowrap ' + voted + '"></td>';
    
    tbody += tr + '</tr>';
  }

  $('.badge', widget).html(voters.length);
  $('.card-body .table tbody', widget).html(tbody);
  $('.card-body', widget).show();
});

// ...
socket.on('hostScoreboard', function(scores) {
  var scoreboard = $('#view-scoreboard');

  for (let {contestant, votes, score} of scores) {
    $('tr#' + contestant + ' .col-score', scoreboard).addClass('text-blur');
    $('tr#' + contestant + ' .col-score', scoreboard).html(score);
    $('tr#' + contestant + ' .col-votes', scoreboard).html(votes);
  }
});



//...
$('button.ballot-close').on('click', function() {
    socket.emit('hostBallotClose');
});

//...
$('button.ballot-open').on('click', function() {
  var i = $(this).attr('data-index');

  socket.emit('hostBallotOpen', i);
});
