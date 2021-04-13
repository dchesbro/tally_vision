var socket = io('/host');

//...
socket.on('hostUsers', function(appUsers) {
  var rows = '';

  $.each(appUsers, function(i, user) {
    var row = '<tr>';

    row += '<td class="col-connected"><i class="fas fa-user-alt"></i></td>';
    row += '<td class="col-username">' + user.username + '</td>';

    rows += row + '</tr>';
  });

  $('#host-users .badge').html(appUsers.length);
  $('#host-users .table tbody').html(rows);
});

//...
socket.on('hostJoin', function(arg) {
  console.log(arg);
});



//...
$('button[class*="ballot-"').on('click', function() {
  if ($(this).hasClass('ballot-close')) {
    $('.ballot-close').hide();
    $('.ballot-open').show();
  } else if ($(this).hasClass('ballot-open')) {
    var tr = $(this).parents('tr');

    $('.ballot-open').hide();
    $('.ballot-close', tr).show();
  }
});
