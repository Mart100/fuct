  $(function() {
  // Toggle BuildMode with B
  $(window).keydown(function(event) {
    if(event.keyCode == 66) {
      // No longer in buildmode
      if(player.buildmode) {
        player.buildmode = false
        $('.HUD-buildSlot').css('display','none')
        $('#HUD-buildTaskbar').animate({'width': '0px', 'padding': '0px'}, 300)
      }
      // In buildmode
      else {
        player.buildmode = true
        $('#HUD-buildTaskbar').animate({'width': '741px', 'padding': '5px'}, 300, () => {
          $('.HUD-buildSlot').css('display','inline-block')
        })
      }
    }
  })
  // Build when click and in buildmode
  $('#canvas').on('mousedown', function(event) {
    if(player.buildmode) build(building[player.building.selected], {x: player.selectedGrid.x + Number(player.pos.x.toString().split('.')[0]), y: player.selectedGrid.y + Number(player.pos.y.toString().split('.')[0])})
  })
  // Clicking on builders taskbar
  $('#HUD-buildTaskbar').on('click', '*', (event) => {
    $('.HUD-buildSlot').css('opacity', '0.6')
    // Color selected building darker
    // clicked image
    if($(event.target).css('height') == '50px') {
      $(event.target).parent().css('opacity', '0.8')
      player.building.selected = $(event.target).parent().attr('id').replace('HUD-buildSlot','')
    }
    // clicked background
    else {
      $(event.target).css('opacity', '0.8')
      player.building.selected = $(event.target).attr('id').replace('HUD-buildSlot','')
    }
  })
})
// Function when building
function build(type, pos) {
  // if building is core.
  if(type == 'core') {
    // check if player already has core
    for(name in buildings) {
      // continue if building is not for the player
      if(buildings[name].owner != socket.id) continue
      // continue if building is not a core
      if(buildings[name].type != 'core') continue
      // else player already has core. so return
      return
    }
  }
  buildings[`${pos.x},${pos.y}`] = {
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
      buildings[`${pos.x},${pos.y}`].bullets = {}
      buildings[`${pos.x},${pos.y}`].bulletspeed = 1
      buildings[`${pos.x},${pos.y}`].reloadspeed = 10
      buildings[`${pos.x},${pos.y}`].range = 10
      buildings[`${pos.x},${pos.y}`].timer = 0
      break
    case('landmine'):
      buildings[`${pos.x},${pos.y}`].collision = false
      buildings[`${pos.x},${pos.y}`].exploding = 0
      break
    case('core'):
      socket.emit('alert', {id: player.id, color: 'white', text: `You placed your core!`})
      break
    case('wall'):
    }
  socket.emit('buildings', { id: `${pos.x},${pos.y}`, type: 'add', data: buildings[`${pos.x},${pos.y}`] })
}
