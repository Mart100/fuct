$(() => {
  $('#body').keydown(event => {
    // Enter button
    if(event.keyCode == 13) {

      // If on playscreen. Join
      if($('#menu').css('display') != 'none') return $('#playButton').click()
      
      showChat()
    }
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
    fadeInChatOutput() 

    $('#chatInput').focus()
  }
  // If Chat is Open
  else {
    // Hide chat
    player.typing = false
    $('#chatInput').animate({'opacity': '0'}, 300)
    fadeOutChatOutput() 
    $('#chatInput').blur()
    if($('#chatInput').val() != '') sendMessage()
  }
}

function fadeOutChatOutput() {
  let i = 0.5
  let interval = setInterval(() => {
    i-=0.01
    $('#chatOutput').css('background-color', `rgba(0,0,0,${i})`)
    if(i <= 0) clearInterval(interval)
  }, 4)
}

function fadeInChatOutput() {
  let i = 0
  let interval = setInterval(() => {
    i+=0.01
    $('#chatOutput').css('background-color', `rgba(0,0,0,${i})`)
    if(i >= 0.5) clearInterval(interval)
  }, 4)
}

socket.on('chat', data => {
  let username = ''
  let message = data.text
  let color = 'black'
  // if sender of message is another player
  if(players[data.id] != undefined) {
    username = players[data.id].username
    color = players[data.id].color
    message = message.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    username = username.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  // If sender of message is the server
  if(data.id == 'Server') {
    username = 'Server'
    color = 'red'
  }
  $("#chatOutput").append(`<strong><span style="color: ${color}"> ${username}</span></strong>: ${message}<br>`)
  updateScroll()
})

function isChatting() {
  if($('#chatInput').is(':focus')) return true
  return false
}