// some socket.on
socket.on('buildings', function(data) {
  buildings = data
})

socket.on('Pong', () => {
  ping.pong = performance.now() - ping.ping
})

socket.on('players', function(data) {
  players = data
  if(data[socket.id] != undefined) jQuery.extend(player, data[socket.id])
})

// ping
setInterval(() => {
  ping.ping = performance.now()
  socket.emit('Ping', ping.ping)
}, 1000)