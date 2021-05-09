var socket = io('/host');

// ...
socket.on('appBallotClose', function() {
  var ui = $('#ui-voting');

  $('button.ballot-close').hide();
  $('button.ballot-open').show();
  $('.badge', ui).html('Closed');
  $('.card-body', ui).hide();
});

// ...
socket.on('appBallotOpen', function(contestant) {
  var tr = $('tr#' + contestant.code);
  var ui = $('#ui-voting');

  $('button.ballot-close', tr).show();
  $('button.ballot-open').hide();
  $('.badge', ui).html('Open');
  $('.card-body .contestant-country', ui).html(contestant.country);
  $('.card-body .contestant-details', ui).html(contestant.artist + ' – "' + contestant.title + '"');
  $('.card-body', ui).show();
});

//...
socket.on('hostVoters', function(voters) {
  var tbody = '';
  var ui = $('#ui-voters');

  for (let {connected, name, voted} of voters) {
    var tr = '<tr id="' + name + '">';

    tr += '<td class="col-connected text-center text-nowrap ' + connected + '"></td>';
    tr += '<td class="col-name">' + name + '</td>';
    tr += '<td class="col-voted text-center text-nowrap ' + voted + '"></td>';

    tbody += tr + '</tr>';
  }

  $('.badge', ui).html(voters.length);
  $('.card-body .table tbody', ui).html(tbody);
  $('.card-body', ui).show();
});

// ...
socket.on('hostScoreboard', function(scores) {
  var ui = $('#ui-scoreboard');

  for (let {contestant, votes, score} of scores) {
    $('tr#' + contestant + ' .col-score', ui).addClass('text-hidden');
    $('tr#' + contestant + ' .col-score', ui).html(score);
    $('tr#' + contestant + ' .col-votes', ui).html(votes);
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



// ...
socket.on('pcaCategory', function(category, results) {
  pcaTablePopulate(category, results);
});

// ...
socket.on('pcaTotal', function(results) {
  pcaTablePopulate('total', results);
});

// ...
$('#pca').on('click', 'tr.text-hidden', function() {
  $(this).removeClass('text-hidden');
});

$('#pca').on('click', '#panel-pca img', function() {
  var theme = new Audio('../media/theme.mp3');

  theme.play();
});

// ...
function pcaTablePopulate(panel, results) {
  var tbody = '';

  for (let [i, {contestant, votes, score}] of results.entries()) {
    var place = i + 1;
    var tr = '<tr class="text-hidden" id="' + contestant.code + '">';

    tr += '<th class="col-place text-center text-nowrap">' + place + '</th>';
    tr += '<td class="col-flag text-center text-nowrap"><img src="/media/flags/' + contestant.code + '.svg"></td>';
    tr += '<td class="col-contestant">';
    tr += '<span class="contestant-country">' + contestant.country + '</span>';
    tr += '<span class="contestant-details">' + contestant.artist + ' – "' + contestant.title + '</span>';
    tr += '</td>';
    tr += '<td class="col-score text-center">' + score + '</td>';

    tbody += tr + '</tr>';
  }

  $('.table tbody', '#panel-' + panel).html(tbody);
}
