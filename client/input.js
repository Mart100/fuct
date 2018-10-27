$(() => {
    keyListener()
    mouseListener()
})


function keyListener() {
    $(document).keyup(function(event) {
      player.keys[event.keyCode] = false
  
      // WASD moving
      if(!player.typing) {
          let kc = event.keyCode
          if((kc == 87 || kc == 38) && player.moving.north) socket.emit('PLAYER_DATA', {type: 'movement', world: player.world, direction: 'north', isDown: false})
          if((kc == 68 || kc == 39) && player.moving.east) socket.emit('PLAYER_DATA', {type: 'movement', world: player.world, direction: 'east', isDown: false})
          if((kc == 83 || kc == 40) && player.moving.south) socket.emit('PLAYER_DATA', {type: 'movement', world: player.world, direction: 'south', isDown: false})
          if((kc == 65 || kc == 37) && player.moving.west) socket.emit('PLAYER_DATA', {type: 'movement', world: player.world, direction: 'west', isDown: false})
      }
    })
    $(document).keydown(function(event) {
      player.keys[event.keyCode] = true
  
      // WASD moving
      if(!player.typing) {
          let kc = event.keyCode
          if((kc == 87 || kc == 38) && !player.moving.north) socket.emit('PLAYER_DATA', {type: 'movement', world: player.world, direction: 'north', isDown: true})
          if((kc == 68 || kc == 39) && !player.moving.east) socket.emit('PLAYER_DATA', {type: 'movement', world: player.world, direction: 'east', isDown: true})
          if((kc == 83 || kc == 40) && !player.moving.south) socket.emit('PLAYER_DATA', {type: 'movement', world: player.world, direction: 'south', isDown: true})
          if((kc == 65 || kc == 37) && !player.moving.west) socket.emit('PLAYER_DATA', {type: 'movement', world: player.world, direction: 'west', isDown: true})
      }
    })
}
function mouseListener() {
    $(document).on('click', () => {
        // Position mouse is on
        let mouseX = Math.floor(player.pos.x + player.selectedGrid.x)
        let mouseY = Math.floor(player.pos.y + player.selectedGrid.y)

        // building mouse is on
        let building = buildings[mouseX+','+mouseY]

        // If mouse is on building
        if(building != undefined) {
            // if mouse is on core
            if(building.type == 'core') {
                // if building is in range and not himself
                if(4 > Math.abs(Math.abs(player.pos.x)+Math.abs(player.pos.y)-Math.abs(building.pos.x)+Math.abs(building.pos.y)) && building.owner != socket.id) {
                    socket.emit('REQUEST_DESTROY_CORE', building)
                }
            }
        }
    })
}