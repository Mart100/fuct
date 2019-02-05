// some socket.on
socket.on('buildings', function(data) {
  buildings = data
})

socket.on('pong', () => {
  ping.pong = performance.now() - ping.ping
  console.log('Pong: ', performance.now())
})

socket.on('players', function(data) {
  players = data
  if(data[socket.id] != undefined) jQuery.extend(player, data[socket.id])
})

// ping
setInterval(() => {
  ping.ping = performance.now()
  socket.emit('ping', ping.ping)
  console.log('Ping: ',ping.ping)
}, 1000)