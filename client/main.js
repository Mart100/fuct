let ctx, canvas
let ping = {pong: 0, ping: 0}
let latestframe
let players = {}
let playersPos = {}
let framecount = 0
const images = {}
const building = { 1: 'core', 2: 'miner', 3: 'turreticon', 4: 'landmine', 5: 'wall', 6: 'spongebob', 7: 'spongebob', 8: 'spongebob', 9: 'spongebob', 0: 'spongebob'}
let buildings = {}
const Game = { 'keys': { }, 'mousedown': false }
let screen = { 'width': window.innerWidth, 'height': window.innerHeight }
// the player object
let player = {
  pos: {
    x: 0.001,
    y: 0.001
  },
  hotbar: {
    items: {
      sword: {
        level: 1,
        slot: 1,
      },
      pickaxe: {
        level: 1,
        slot: 2,
      },
      /*axe: {
        level: 1,
        slot: 3,
      },
      sniper: {
        level: 1,
        slot: 4,
      },
      shotgun: {
        level: 1,
        slot: 5,
      },*/
    },
    selected: 1
  },
  movement: 'none',
  building: {
    selected: 1
  },
  buildmode: false,
  color: 'rgb(255, 0, 0)',
  offset: {
    x() {
      if(player.pos.x > 0) {
        return Number('0.'+player.pos.x.toString().split('.')[1])
      } else {
        return -Number('0.'+player.pos.x.toString().split('.')[1])
      }
    },
    y() {
      if(player.pos.y > 0) {
        return Number('0.'+player.pos.y.toString().split('.')[1])
      } else {
        return -Number('0.'+player.pos.y.toString().split('.')[1])
      }
    }
  },
  selectedGrid: {
    x: 0.01,
    y: 0.01
  },
  zoom: 100,
  username: 'guest' + Math.floor(Math.random() * 100000),
  health: 100,
  died: false,
  spawned: false
}
// on alert
socket.on('alert', function(data) {
  let textbox = 5
  // search for free alert text
  for(let i = 0; i < 5; i++) {
    if($('#alert'+i).html() == '') {
      textbox = i
      break
    }
  }
  if(textbox > 1 && $('#alert'+(textbox-1)).html().split(' (')[0] == data.text) {
    textbox -= 1
    // Check how many
    let howmany = Number($('#alert'+textbox).html().split('(')[1].split(')')[0].replace('x', ''))
    // set color
    $('#alert'+textbox).css('color', data.color)
    // chance value how many times
    $('#alert'+textbox).html(data.text+' ('+howmany+'x)')
  }
  // Else send message on last open
  else {
    // set color
    $('#alert'+textbox).css('color', data.color)
    // send message
    $('#alert'+textbox).html(data.text)
  }
  // Set opacity to full
  $('#alert'+textbox).css('opacity', 1)
  // Wait 4 seconds. than begin dissapearing
  setTimeout(function() {
    // Loop till opacity is 0
    let ANIMopacity = setInterval(function() {
      let currentOpacity = Number($('#alert'+textbox).css('opacity'))
      console.log(currentOpacity)
      // remove 0.01 from opacity
      $('#alert'+textbox).css('opacity', currentOpacity - 0.05)
      // if opacity is 0 stop
      if(currentOpacity-0.05 == 0) {
        $('#alert'+textbox).html('')
        clearInterval(ANIMopacity)
      }

    }, 100)
  }, 4000)
})
// some socket.on
socket.on('buildings', function(data) {
  buildings = data
})
socket.on('ping', () => ping.pong = new Date() - ping.ping)
socket.on('players', function(data) {
  players = data
  if(data[player.id] != undefined) {
    // set position
    player.pos = data[player.id].pos
    // set directions
    player.directions = data[player.id].directions
    // died and kick
    player.died = data[player.id].died
    player.kick = data[player.id].kick
  }
})
// ping
setInterval(() => {
  ping.ping = new Date()
  socket.emit('ping', '')
}, 1000)


function KeyEventListener() {
  $(document).keyup(function(event) {
    Game.keys[event.keyCode] = false
  })
  $(document).keydown(function(event) {
    Game.keys[event.keyCode] = true
  })

}

$(function() {
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext("2d")
  // save ctx
  // Set Canvas size
  canvas.width = screen.width
  canvas.height = screen.height
  KeyEventListener()
  loadImages()
  // load frame
  frame()
  // All click events
  $('#canvas').on('mousedown', function(event) {
    Game.mousedown = true
  })
    $('#canvas').on('mouseup', function(event) {
    Game.mousedown = false
  })
  // Update SelectedGrid
  $(window).on('mousemove', function(event) {

    let offsetX, offsetY
    if(player.pos.x > 0) offsetX = Number('0.'+player.pos.x.toString().split('.')[1])
    else offsetX = -Number('0.'+player.pos.x.toString().split('.')[1])
    if(player.pos.y > 0) offsetY = Number('0.'+player.pos.y.toString().split('.')[1])
    else offsetY = -Number('0.'+player.pos.y.toString().split('.')[1])

    player.selectedGrid.x = Math.floor((event.clientX - screen.width/2 + offsetX * player.zoom) / player.zoom)
    player.selectedGrid.y = Math.floor((event.clientY - screen.height/2 + offsetY * player.zoom) / player.zoom)
  })
  // Zooming
  //window.addEventListener('scroll', function(e){
 //rame()
  // When PLAY is pressed
  $("#playButton").on("click", function(e) {
    player.id = socket.id
    player.spawned = true

    // Hotbar stuff
    for(let i = 0; i < 11; i++) {
      $('#HUD-hotbarSlot'+i+' > img').attr('src', 'https://upload.wikimedia.org/wikipedia/commons/5/54/Blank_Canvas_on_Transparent_Background.png')
      // loop trough items in player.hotbar
      for(item in player.hotbar.items) if(player.hotbar.items[item].slot == i) $('#HUD-hotbarSlot'+i+' > img').attr('src', images[item].src)
    }

    if($('#nameInput').val() != '') player.username = $('#nameInput').val()
    // Decide player's color
    player.color = `rgb(${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)})`
    // send name and color
    socket.emit('players', { id: socket.id, type: 'newplayer', player: {color: player.color, username: player.username }})
    $("#loginScreen").hide()
    $('#backgroundOpacity').animate({'opacity': '0'}, 500, () => $('#backgroundOpacity').remove())
   // if($("#
  })
  $("#loginOrRegisterButton").on("click", function(e) {
    $("#passwordInput").show()
    $("#playButton").hide()
    $("#loginOrRegisterButton").hide()
    $("#loginButton").show()
    $("#registerButton").show()
  })
  $("#registerButton").on("click", function(e) {
    if($("#nameInput").val() == "" || $("#passwordInput").val() == "") {
      $("#errorMessage").html("You need to fill in the fields").show()
    }
    console.log('yeeeeeeeeee', 'booooooooooooi')
    register()
  })
  $("#loginButton").on("click", function(e) {
    if($("#nameInput").val() == "" || $("#passwordInput").val() == "") {
      $("#errorMessage").html("You need to fill in the fields").show()
    }
    console.log('yeeeeeeeeee', 'booooooooooooi')
    login()
  })
  $(window).on('DOMMouseScroll mousewheel', function(e){
    if(e.originalEvent.detail > 0 || e.originalEvent.wheelDelta < 0) {
      if(player.zoom <= 50 && !players[socket.id].admin) return
      if(player.zoom <= 5) return
      player.zoom -= 5
    } else {
      if(player.zoom >= 120 && !players[socket.id].admin) return
      player.zoom += 5
    }
  })


})