$(function() {
  // Toggle BuildMode with S
  $(window).keydown(function(event) {
    if(event.keyCode == 66) {
      // No longer in buildmode
      if(player.buildmode) {
        player.buildmode = false
        $('.HUD-buildSlot').css('display','none')
        $('#HUD-building').animate({'width': '0px', 'padding': '0px'}, 300)
      }
      // In buildmode
      else {
        player.buildmode = true
        $('#HUD-building').animate({'width': '741px', 'padding': '5px'}, 300, () => {
          $('.HUD-buildSlot').css('display','inline-block')
        })
      }
    }
  })
  // Build when click and in buildmode
  $('#canvas').on('mousedown', function(event) {
    if(player.buildmode) build(player.building.list[player.building.selected], {x: player.selectedGrid.x + Number(player.pos.x.toString().split('.')[0]), y: player.selectedGrid.y + Number(player.pos.y.toString().split('.')[0])})
  })
  // Clicking on builders taskbar
  $('#HUD-building').on('click', '*', (event) => {
    $('.HUD-buildSlot').css('opacity', '0.6')
    // Color selected building darker
    // clicked image
    if($(event.target).css('height') == '50px') {
      $(event.target).parent().css('opacity', '0.8')
      socket.emit('PLAYER_DATA', {type: 'buildSelected', selected: Number($(event.target).parent().attr('id').replace('HUD-buildSlot','')) })
    }
    // clicked background
    else {
      $(event.target).css('opacity', '0.8')
      socket.emit('PLAYER_DATA', {type: 'buildSelected', selected: Number($(event.target).attr('id').replace('HUD-buildSlot','')) })
    }
  })
})
// Function when building
function build(type, pos) {
    let building = {
        'type': type,
        'owner': socket.id,
        'pos': {
        'x': pos.x,
        'y': pos.y
        },
        'health': 100,
        'maxHealth': 100,
        'collision': true,
        'showhealth': 0
    }
    switch(type) {
        case('turreticon'):
            building.bullets = {}
            building.bulletspeed = 1
            building.reloadspeed = 10
            building.range = 10
            building.timer = 0
            break
        case('landmine'):
            building.collision = false
            building.exploding = 0
            break
        case('core'):
            // check if player already has core
            for(name in buildings) {
                // continue if building is not a core
                if(buildings[name].type != 'core') continue
                // continue if building is not for the player
                if(buildings[name].owner != socket.id) continue
                // else player already has core. so return
                return alert({id: player.id, color: 'red', text: `You already placed your core!`})
            }
            alert({id: player.id, color: 'white', text: `You placed your core!`})
            break
        case('wall'):
            break
    }
    socket.emit('BUILD_DATA', { id: `${pos.x},${pos.y}`, type: 'add', building: building })
}
