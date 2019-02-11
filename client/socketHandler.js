// some socket.on
socket.on('buildings', function(data) {
  buildings = data
})

socket.on('Pong', () => {
  ping.pong = performance.now() - ping.ping
})

socket.on('players', data => {
  players = data
})
socket.on('TPS', data => {
  tps = data
})
socket.on('privatePlayerData', data => {
  player = jQuery.extend(player, data)
})
socket.on('dead', (data) => {
  $('#playScreen').show()
  $('#backgroundOpacity').show()
  $('#backgroundOpacity').animate({'opacity': '0.6'}, 1000)
})

// ping
setInterval(() => {
  ping.ping = performance.now()
  socket.emit('Ping', ping.ping)
}, 1000)