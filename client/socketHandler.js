// some socket.on
socket.on('buildings', function(data) {
    buildings = data
  })
  socket.on('ping', () => ping.pong = new Date() - ping.ping)
  socket.on('players', function(data) {
    players = data
    player = data[socket.id]
    /*if(data[player.id] != undefined) {
      // set position
      player.pos = data[player.id].pos
      // set directions
      player.directions = data[player.id].directions
      // died and kick
      player.died = data[player.id].died
      player.kick = data[player.id].kick
    }*/
  })
  // ping
  setInterval(() => {
    ping.ping = new Date()
    socket.emit('ping', '')
  }, 1000)