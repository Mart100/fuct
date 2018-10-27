// some socket.on
socket.on('buildings', function(data) {
    buildings = data
  })
  socket.on('ping', () => ping.pong = new Date() - ping.ping)
  socket.on('players', function(data) {
    //console.log(data)
    players = data
    if(data[socket.id] != undefined) {
        jQuery.extend(player, data[socket.id])
    }

  })
  // ping
  setInterval(() => {
    ping.ping = new Date()
    socket.emit('ping', '')
  }, 1000)