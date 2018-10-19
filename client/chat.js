$(function() {
  $(window).keydown(function(event) {
    if(event.keyCode == 13) showChat()
  })
})
function updateScroll(){
    var element = document.getElementById("chatOutput");
    element.scrollTop = element.scrollHeight;
}
function sendMessage() {
  let chatmessage = $('#chatInput').val()
  socket.emit('chat', {
    id: player.id,
    message: $('#chatInput').val()
  })
  $('#chatInput').val('')
}
function showChat() {
  // Show
  if($('#chatInput').css('opacity') == '0') {
    player.typing = true
    $('#chatInput').val('')
    $('#chatInput').animate({'opacity': '0.8'}, 300)
    $('#chatOutput').css({'background-color': 'rgba(0, 0, 0, 0.5)'})
    $('#chatInput').focus()
  }
  // If Chat is Open
  else {
    // Hide chat and send message
    player.typing = false
    $('#chatInput').animate({'opacity': '0'}, 300)
    $('#chatOutput').css({'background-color': 'rgba(0, 0, 0, 0)'})
    if($('#chatInput').val() != '') sendMessage()
  }
}
socket.on('chat', function(data) {
  $("#chatOutput").html($("#chatOutput").html() + `<strong><span style="color: ${players[data.id].color}">` + players[data.id].username + '</span></strong>: ' + data.message + '<br>')
  updateScroll()
})