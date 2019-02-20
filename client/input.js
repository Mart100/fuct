let latestKeyDown = Date.now()
function keyListener() {
  $(document).keyup(function(event) {
    if(!player.keys[event.keyCode]) return
    player.keys[event.keyCode] = false

    // wait 10ms. Until keydown has been send
    let timeout = (latestKeyDown - Date.now())+150
    console.log(timeout)
    if(timeout < 0) timeout = 1
    setTimeout(() => {
      // WASD moving
      if(!player.typing) {

        let kc = event.keyCode
        if((kc == 87 || kc == 38) && player.moving.north) socket.emit('PLAYER_DATA', {type: 'movement', world: player.world, direction: 'north', isDown: false})
        if((kc == 68 || kc == 39) && player.moving.east) socket.emit('PLAYER_DATA', {type: 'movement', world: player.world, direction: 'east', isDown: false})
        if((kc == 83 || kc == 40) && player.moving.south) socket.emit('PLAYER_DATA', {type: 'movement', world: player.world, direction: 'south', isDown: false})
        if((kc == 65 || kc == 37) && player.moving.west) socket.emit('PLAYER_DATA', {type: 'movement', world: player.world, direction: 'west', isDown: false})
      }
    }, timeout)
  })
  $(document).keydown(function(event) {
    if(player.keys[event.keyCode]) return
    player.keys[event.keyCode] = true
    latestKeyDown = Date.now()

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
  $('#hotbar').on('click', '*', (event) => {
    // Color selected hotbaring darker

    // clicked image
    if($(event.target).css('height') == '50px') changeHotbarSlot($(event.target).parent().attr('id').replace('hotbarSlot-',''))
    // clicked background
    else changeHotbarSlot($(event.target).attr('id').replace('hotbarSlot-',''))

  })

}

function changeHotbarSlot(item) {
    $('.hotbarSlot').css('opacity', '0.6')

    // Color selected hotbaring darker
    $(`#hotbarSlot-${item}`).css('opacity', '0.8')
    
    // send new item the player is holding to the server
    socket.emit('PLAYER_DATA', {id: player.id, type: 'hotbarSelected', selected: item})
}