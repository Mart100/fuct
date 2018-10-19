// when page loads
$(function() {
  // Clicking on hotbar
  $('#HUD-hotbarTaskbar').on('click', '*', (event) => {
    $('.HUD-hotbarSlot').css('opacity', '0.6')
    // Color selected hotbaring darker
    // clicked image
    if($(event.target).css('height') == '50px') {
      $(event.target).parent().css('opacity', '0.8')
      player.hotbar.selected = $(event.target).parent().attr('id').replace('HUD-hotbarSlot','')
    }
    // clicked background
    else {
      $(event.target).css('opacity', '0.8')
      player.hotbar.selected = $(event.target).attr('id').replace('HUD-hotbarSlot','')
    }
    // Draw hotbar tools
    for(let i = 0; i < 11; i++) {
      $('#HUD-hotbarSlot'+i+' > img').attr('src', 'https://upload.wikimedia.org/wikipedia/commons/5/54/Blank_Canvas_on_Transparent_Background.png')
      // loop trough items in player.hotbar
      for(item in player.hotbar.items) if(player.hotbar.items[item].slot == i) $('#HUD-hotbarSlot'+i+' > img').attr('src', images[item].src)
    }
    // send new item the player is holding to the server
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
})
