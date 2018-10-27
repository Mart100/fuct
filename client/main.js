let ctx, canvas
let ping = {pong: 0, ping: 0}
let latestframe
let players = {}
let playersPos = {}
let framecount = 0
const images = {}
let buildings = {}
// the player object
let player = {
    building: {
        selected: 1,
        list: ['core', 'miner', 'turreticon', 'landmine', 'wall', 'spongebob', 'spongebob', 'spongebob', 'spongebob', 'spongebob'],
    },
    keys: {},
    pos: {
        x: 0,
        y: 0
    },
    buildmode: false,
    color: 'rgb(255, 0, 0)',
    offset: {
        x() {
            let offset = player.pos.x > 0 ? Number('0.'+player.pos.x.toString().split('.')[1]) : -Number('0.'+player.pos.x.toString().split('.')[1])
            if(offset == undefined || isNaN(offset)) offset = 0
            return offset
        },
        y() {
            let offset = player.pos.y > 0 ? Number('0.'+player.pos.y.toString().split('.')[1]) : -Number('0.'+player.pos.y.toString().split('.')[1])
            if(offset == undefined || isNaN(offset)) offset = 0
            return offset
        }
    },
    selectedGrid: {
    x: 0.01,
    y: 0.01
    },
    zoom: 100,
}

$(function() {
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext("2d")
  // save ctx
  // Set Canvas size
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  loadImages()
  // load frame
  frame()
  setInterval(tick, 10)
  // Update SelectedGrid
  $(window).on('mousemove', function(event) {
      if(player.pos == undefined) return

    let offsetX = player.offset.x()
    let offsetY = player.offset.y()

    player.selectedGrid.x = Math.floor((event.clientX - canvas.width/2 + offsetX * player.zoom) / player.zoom)
    player.selectedGrid.y = Math.floor((event.clientY - canvas.height/2 + offsetY * player.zoom) / player.zoom)
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
      //for(item in player.hotbar) if(player.hotbar[].slot == i) $('#HUD-hotbarSlot'+i+' > img').attr('src', images[item].src)
    }

    if($('#nameInput').val() != '') player.username = $('#nameInput').val()
    else player.username = 'Guest-'+Math.round(Math.random()*1000)

    // request world
    let requestWorld = 'oof'
    socket.emit('requestWorld', { username: player.username, world: requestWorld }, function(data) {
        if(data == 'SUCCESS') {
            player.world = requestWorld
        } else console.log('Error trying to request server: '+data)
    })


    $("#playScreen").hide()
    $('#backgroundOpacity').animate({'opacity': '0'}, 500, () => $('#backgroundOpacity').remove())
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