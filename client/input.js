
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
    // Clicking on hotbar
  $('#HUD-hotbar').on('click', '*', (event) => {
    // Color selected hotbaring darker

    // clicked image
    if($(event.target).css('height') == '50px') changeHotbarSlot($(event.target).parent().attr('id').replace('HUD-hotbarSlot',''))
    
    // clicked background
    else changeHotbarSlot($(event.target).attr('id').replace('HUD-hotbarSlot',''))

    socket.emit('players', {id: player.id, type: 'hotbar', player: player.hotbar})
  })

}

function changeHotbarSlot(slot) {
    slot = Number(slot)
    $('.HUD-hotbarSlot').css('opacity', '0.6')

    // Color selected hotbaring darker
    $(`#HUD-hotbarSlot${slot}`).css('opacity', '0.8')
    
    // send new item the player is holding to the server
    socket.emit('PLAYER_DATA', {id: player.id, type: 'hotbarSelected', selected: slot})
}