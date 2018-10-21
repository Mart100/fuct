// some socket.on
socket.on('buildings', function(data) {
    buildings = data
  })
  socket.on('ping', () => ping.pong = new Date() - ping.ping)
  socket.on('players', function(data) {
    //console.log(data)
    players = data
    if(data[socket.id] != undefined) player = data[socket.id]
    else player = {
        pos: {
            x: 0,
            y: 0
        },
        hotbar: {},
        movement: 'none'
        
    }
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