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
  movement: {
    north: false,
    east: false,
    south: false,
    west: false
  },
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

function loadImages() {
  //Spongebob
  images.spongebob = new Image()
  images.spongebob.src = 'https://gyazo.com/3b9acfb270e46946247dfcd1e766f659.png'
  //Core
  images.core = new Image()
  images.core.src = 'https://cdn.glitch.com/94bbd290-d98d-4b21-9de9-9ea587a52df3%2Fcore.png?1520517517827'
  //TurretBase
  images.turretbase = new Image()
  images.turretbase.src = 'https://gyazo.com/7f99973f668f6093144d934082470ec9.png'
  //Turret
  images.turret = new Image()
  images.turret.src = 'https://gyazo.com/2ae959689e510e4b7f536e851f1520c4.png'
  //TurretIcon
  images.turreticon = new Image()
  images.turreticon.src = 'https://gyazo.com/59b952c61fa11c9ecc4fddb85a205d0d.png'
  //landmine
  images.landmine = new Image()
  images.landmine.src = 'https://gyazo.com/61d228d16c3329ceaa94a62d1b444731.png'
  //sword
  images.sword = new Image()
  images.sword.src = 'https://gyazo.com/30f1b6dc6ea8345d799e42f31b8a5c3b.png'
  //pickaxe
  images.pickaxe = new Image()
  images.pickaxe.src = 'https://gyazo.com/bd156fc91b79873c25dc92dfa8da14ca.png'
  //walls
  images.walls = {}
  // with 0 open sides
  images.walls.sides0 = new Image()
  images.walls.sides0.src = 'https://gyazo.com/fa0d5557050c833a441e3d3e6aedecb1.png'
  // with 1 open sides
  images.walls.sides1 = new Image()
  images.walls.sides1.src = 'https://gyazo.com/a9b514051559d9248cd37828173027dd.png'
  // with 2 open sides and horizontally
  images.walls.sides2hor = new Image()
  images.walls.sides2hor.src = 'https://gyazo.com/a1ea50a830bfac00a43a7b547a73a3b0.png'
  // with 2 open sides in corner
  images.walls.sides2cor = new Image()
  images.walls.sides2cor.src = 'https://gyazo.com/0de0cf69066790cf582de766778a2b43.png'
  // with 3 open sides
  images.walls.sides3 = new Image()
  images.walls.sides3.src = 'https://gyazo.com/91793dfa84a870ad5e99b05eb25b494c.png'
  // explosion
  images.explosion = {}
  for(let i = 1; i <= 19; i++) {
    images.explosion[i] = new Image()
    if(i == 1) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F1.png?alt=media&token=ea2ee003-7040-4c9b-8b77-c4f7fa609fb7'
    if(i == 2) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F2.png?alt=media&token=4c1f5bb5-084c-4b67-bfbe-92dd3a492312'
    if(i == 3) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F3.png?alt=media&token=044f16da-65e0-4188-be48-5a937fc1c479'
    if(i == 4) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F4.png?alt=media&token=db12a950-e376-4a50-bc10-3269f0435736'
    if(i == 5) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F5.png?alt=media&token=2d7673de-081e-44d7-be34-20cc77bf5f31'
    if(i == 6) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F6.png?alt=media&token=1a672166-c552-4ea8-8ebe-ae5ad7eb019a'
    if(i == 7) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F7.png?alt=media&token=a4dc0b57-e19d-49a5-a9a2-8211feb63a53'
    if(i == 8) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F8.png?alt=media&token=6fcda393-2075-43c5-99fc-40ee46b910e0'
    if(i == 9) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F9.png?alt=media&token=e05412bb-665b-4f72-904e-70f1de0f64e2'
    if(i == 10) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F10.png?alt=media&token=25fdd81f-4745-42a0-a131-2d91d920d108'
    if(i == 11) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F11.png?alt=media&token=7f390357-042d-4f44-aa21-6c9af8a4e5b4'
    if(i == 12) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F11.png?alt=media&token=7f390357-042d-4f44-aa21-6c9af8a4e5b4'
    if(i == 13) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F13.png?alt=media&token=235a3c9d-c1c6-465d-aeee-ef2e70966aaf'
    if(i == 14) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F14.png?alt=media&token=ac3ebf90-be13-412e-a46b-45b42e7039e7'
    if(i == 15) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F15.png?alt=media&token=0ff98520-5d77-4e9c-aca1-9f7fff2155a8'
    if(i == 16) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F15.png?alt=media&token=0ff98520-5d77-4e9c-aca1-9f7fff2155a8'
    if(i == 17) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F15.png?alt=media&token=0ff98520-5d77-4e9c-aca1-9f7fff2155a8'
    if(i == 18) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F18.png?alt=media&token=d38cfc50-8605-49ea-9cc2-58b905f1507b'
    if(i == 19) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F19.png?alt=media&token=af71be65-46de-43bb-8e67-3d75a23a8bb4'
  }
  //mine
  images.miner = new Image()
  images.miner.src = 'https://cdn.discordapp.com/attachments/235452993741389824/424195191700848640/miner.png'
}
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
  setInterval(() => { Frame() }, 10)
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

async function Frame() {
  /*if(SHA256($("#adminpassInput").val()) == "7e87ccd85d4abbdc98f19c2005268d1b772f722a9ec19d96418a2727616342f5") {
    player.admin = true
  } else {
    player.admin = false
  }*/
  framecount++
  // Reset screen. becouse there might be chances
  screen.width = window.innerWidth
  screen.height = window.innerHeight
  // set canvas to screen
  canvas.width = screen.width
  canvas.height = screen.height

  // Kick player
  if(player.kick) socket.disconnect()
  // if player died
  if(player.died) {
    // Show menu
    $("#loginScreen").css('opacity', 0)
    $("#loginScreen").show()
    $('#loginScreen').animate({'opacity': '1'}, 500)
    $('#body').append('<div id="backgroundOpacity" style="opacity: 0; position: absolute; width: 100%; height: 100%;></div>')
    $('#backgroundOpacity').animate({'opacity': '1'}, 500)
    // remove player
    socket.emit('players', { id: player.id, type: 'removeplayer'})
    // remove death
    player.health = 100
    player.died = false
    // spawn
    player.spawned = false
    return
  }
  if(!player.spawned) return
  // If mouse is down
  if(Game.mousedown) {
    // Position mouse is on
    mouseX = Math.floor(player.pos.x + player.selectedGrid.x)
    mouseY = Math.floor(player.pos.y + player.selectedGrid.y)
    //console.log(mouseX+' -- '+mouseY)
    // If mouse is on building
    if(buildings[mouseX+','+mouseY] != undefined) {
      // if mouse is on core
      if(buildings[mouseX+','+mouseY].type == 'core') {
        // if building is in range and not himself
        if(10 > Math.abs(Math.abs(Math.abs(player.pos.x)-Math.abs(mouseX))-Math.abs(Math.abs(player.pos.x)-Math.abs(mouseX)))
        && buildings[mouseX+','+mouseY].owner != socket.id) {
          let building = buildings[mouseX+','+mouseY]
          socket.emit('alert', {id: player.id, color: 'green', text: `You destroyed ${players[building.owner].username}'s core!`})
          socket.emit('alert', {id: building.owner, color: 'red', text: `${player.username} destroyed your core!`})
          socket.emit('players', { id: building.owner, type: 'died', player: true})
          delete building
        }
      }
    }
  }
  // Clear Screen
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fill()
  updateDebug()
  // Check for movement
  if(!player.typing) {

    if(Game.keys[87] || Game.keys[38]) player.movement.north = true
    else player.movement.north = false
    if(Game.keys[68] || Game.keys[39]) player.movement.east = true
    else player.movement.east = false
    if(Game.keys[83] || Game.keys[40]) player.movement.south = true
    else player.movement.south = false
    if(Game.keys[65] || Game.keys[37]) player.movement.west = true
    else player.movement.west = false
  }
  // update player stuff
  socket.emit('players', {id: player.id, type: 'movement', player: player.movement})
  ctx.beginPath()
  // Clear Screenb
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fill()
  draw.grid()
  draw.otherPlayers()
  draw.inhand()
  draw.objects()
  // If player is in buildmode
  if(player.buildmode) draw.selectedGrid()
}
