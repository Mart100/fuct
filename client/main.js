let ctx, canvas
let ping = {pong: 0, ping: 0}
let latestframe
let framecount = 0
const images = {}
let players = {}
let buildings = {}
// the player object
let player = {
    building: {
        selected: 1,
        list: []
    },
    keys: {},
    pos: {
        x: 0,
        y: 0
    },
    placing: false,
    placingInterval: false,
    buildmode: false,
    buildmodeFired: false,
    inshop: false,
    inshopFired: false,
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
    mouse: {
        x: 0,
        y: 0
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
    setInterval(() => {
        if(player.pos == undefined) return

        let offsetX = player.offset.x()
        let offsetY = player.offset.y()

        player.selectedGrid.x = Math.floor((player.mouse.x - canvas.width/2 + offsetX * player.zoom) / player.zoom)
        player.selectedGrid.y = Math.floor((player.mouse.y - canvas.height/2 + offsetY * player.zoom) / player.zoom)
    }, 10)
    $('body').on('mousemove', (event) => {
        player.mouse.x = event.clientX
        player.mouse.y = event.clientY
    })
  // Zooming
  //window.addEventListener('scroll', function(e){
 //rame()
  // When PLAY is pressed
  $("#playButton").on("click", function(e) {
    player.id = socket.id

    if($('#nameInput').val() != '') player.username = $('#nameInput').val()
    else player.username = 'Guest-'+Math.round(Math.random()*1000)

    // request world
    //let requestWorld = 'oof'
    socket.emit('requestWorld', player.username , function(err, id) {
        if(err == null) {
            player.world = id
            setTimeout(() => { joinedWorld() }, 100)
        } else {
            console.log('Error trying to request server: '+id)
            alert({color: 'red', text: err})
            // if(err == 'USERNAME_TOO_LONG') {
            //     alert({color: 'red', text: `Username Too Long!`})
            // }
            // if(err == 'WORLD_UNDEFINED') {
            //     alert({color: 'red', text: `Username Too Long!`})
            // }
        }
    })

  })
  $('canvas').on('DOMMouseScroll mousewheel', function(e){
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
function joinedWorld() {

    history.replaceState(player.world, '', `/${player.world}/`)    



    $("#playScreen").hide()
    $('#backgroundOpacity').animate({'opacity': '0'}, 500, () => $('#backgroundOpacity').remove())
    updateHotbarImages()
    keyListener()
    mouseListener()
    updateBuildBar()
}
function getDistanceBetween(a, b) {
    var c = a.x - b.x
    var d = a.y - b.y
    var result = Math.sqrt( c*c + d*d )
    return result
}

function updateHotbarImages() {
    // hotbar stuff
    for(let i in player.hotbar.list) {
        // loop trough items in player.hotbar
        $('#HUD-hotbarSlot'+player.hotbar.list[i].slot+' > img').attr('src', images[i].src)
    }
}
function getKeyByIndex(object, index) {
  return Object.keys(object)[index];
}
