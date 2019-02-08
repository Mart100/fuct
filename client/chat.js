$(() => {
  $('#body').keydown(event => {
    // If on playscreen. Join
    if($('#playScreen').css('display') != 'none') {
      $('#playButton').click()
      return
    }
    if(event.keyCode == 13) showChat()
  })
})
function updateScroll(){
    var element = document.getElementById("chatOutput");
    element.scrollTop = element.scrollHeight;
}
function sendMessage() {
  let chatmessage = $('#chatInput').val()
  socket.emit('chat', $('#chatInput').val())
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

socket.on('chat', data => {
  let username = ''
  let color = 'black'
  // if sender of message is another player
  if(players[data.id] != undefined) {
    username = players[data.id].username
    color = players[data.id].color
  }
  // If sender of message is the server
  if(data.id == 'Server') {
    username = 'Server'
    color = 'black'
  }
  let message = data.text.replace(/</g, '&lt;')
  message = message.replace(/>/g, '&gt;')
  $("#chatOutput").append(`<strong><span style="color: ${color}"> ${username}</span></strong>: ${message}<br>`)
  updateScroll()
})