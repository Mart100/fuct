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
    $(document).keypress(function(event) {
    

        if(!player.typing) {
            //get number pressed
            let slotID = event.originalEvent.key
            if(isNaN(slotID)) return
            player.hotbar.selected = slotID
            changeHotbarSlot()
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
    // Clicking on hotbar
  $('#HUD-hotbar').on('click', '*', (event) => {
    // Color selected hotbaring darker

    // clicked image
    if($(event.target).css('height') == '50px') player.hotbar.selected = $(event.target).parent().attr('id').replace('HUD-hotbarSlot','')
    
    // clicked background
    else player.hotbar.selected = $(event.target).attr('id').replace('HUD-hotbarSlot','')

    changeHotbarSlot()
    socket.emit('players', {id: player.id, type: 'hotbar', player: player.hotbar})
  })
  // when clicking with tool in hand
  $('#canvas').on('click', function() {
    // wich item is currently in hand
    let iteminhand = ''
    for(item in player.hotbar.items) if(player.hotbar.items[item].slot == player.hotbar.selected) iteminhand = item
    switch(iteminhand) {
      case('sword'):
        // get closest player
        let closestplayer = { x: 9999, y: 9999, id: 'none' }
        for(let id in players) {
          // if its yourself
          if(id == player.id) continue
          // dont shoot if target is to far away
          if(Math.abs(players[id].pos.x - player.pos.x)+Math.abs(players[id].pos.y - player.pos.y) > 2) continue
          if(Math.abs(closestplayer.x - player.pos.x)+Math.abs(closestplayer.y - player.pos.y) > Math.abs(players[id].pos.x - player.pos.x)+Math.abs(players[id].pos.y - player.pos.y)) {
            closestplayer = { x: players[id].pos.x, y: players[id].pos.y }
            closestplayer.id = id
          }
        }
        // damage player
        if(closestplayer.id != 'none') socket.emit('players', {id: closestplayer.id, type: 'damagePlayer', player: 10})
        break
      case('pickaxe'):
        // get closest building
        let closestbuilding = { x: 9999, y: 9999, id: 'none' }
        for(let id in buildings) {
          let building = buildings[id]
          // dont shoot if target is to far away
          if(Math.abs(building.pos.x+0.5 - player.pos.x)+Math.abs(building.pos.y+0.5 - player.pos.y) > 2) continue
          if(Math.abs(closestbuilding.x+0.5 - player.pos.x)+Math.abs(closestbuilding.y+0.5 - player.pos.y) > Math.abs(building.pos.x+0.5 - player.pos.x)+Math.abs(building.pos.y+0.5 - player.pos.y)) {
            closestbuilding = { x: building.pos.x, y: building.pos.y }
            closestbuilding.id = id
          }
        }
        // damage building
        if(closestbuilding.id != 'none') socket.emit('buildings', { id: `${closestbuilding.x},${closestbuilding.y}`, type: 'damage', data: 10 })
        // check if building broke
        if(buildings[closestbuilding.x+','+closestbuilding.y].health < 0) socket.emit('buildings', { id: `${closestbuilding.x},${closestbuilding.y}`, type: 'remove', data: 10 })
        break
      default:

    }
  })
}

function changeHotbarSlot() {
    $('.HUD-hotbarSlot').css('opacity', '0.6')

    // Color selected hotbaring darker
    $(`#HUD-hotbarSlot${player.hotbar.selected}`).css('opacity', '0.8')
    
    // send new item the player is holding to the server
    socket.emit('players', {id: player.id, type: 'hotbar', player: player.hotbar})
}