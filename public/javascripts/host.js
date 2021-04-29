var socket = io('/host');

// ...
socket.on('appBallotClose', function() {
  var widget = $('#widget-voting');

  $('.ballot-close').hide();
  $('.ballot-open').show();

  $('.badge', widget).html('Closed');
  $('.card-body', widget).hide();
});

// ...
socket.on('appBallotOpen', function(contestant) {
  var tr = $('tr#' + contestant.code);
  var widget = $('#widget-voting');
  
  $('.ballot-close', tr).show();
  $('.ballot-open').hide();

  $('.badge', widget).html('Open');
  $('.card-body .contestant-country', widget).html(contestant.country);
  $('.card-body .contestant-details', widget).html(contestant.artist + ' – "' + contestant.title + '"');
  $('.card-body', widget).show();
});

//...
socket.on('hostVoters', function(voters) {
  var tbody = '';
  var widget = $('#widget-voters');

  $.each(voters, function(i, voter) {
    var tr = '<tr>';

    tr += '<td class="col-connected ' + voter.connected + '"></td>';
    tr += '<td class="col-name">' + voter.name + '</td>';
    
    tbody += tr + '</tr>';
  });

  $('.badge', widget).html(voters.length);
  $('.card-body .table tbody', widget).html(tbody);
  $('.card-body', widget).show();
});

//...
socket.on('hostConnect', function() {
  // TODO.
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
