$(function() {
  // Toggle BuildMode with B
  $(window).keydown(function(event) {
    if(event.keyCode == 70) {
      // No longer in buildmode
      if(player.inshop) {
        console.log('test')
        player.inshop = false
        $('#HUD-shopCont').fadeOut(400, () => { $('#HUD-shopCont').css('display', 'none') })
      }
      // In buildmode
      else {
        player.inshop = true
        $('#HUD-shopCont').css({'width': '700px', 'height': '500px', 'left': '50%', 'transform': 'translateX(-50%)', 'bottom': `${screen.height/2-250}px`})
        $('#HUD-shopCont').fadeIn(400)
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
