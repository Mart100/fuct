let ctx, canvas
let ping = {pong: 0, ping: 0}
let tps = 0
let latestframe
let cookiesAccepted = false
let framecount = 0
const images = {}
let settings = {
    volume: 50,
    chatEnabled: true,
}
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
    spawning: false,
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

$(() => {

    if(document.cookie != '') cookiesAccepted = true

    canvas = document.getElementById('canvas')
    ctx = canvas.getContext("2d")

    // Set Canvas size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    loadImages()
    setInterval(tick, 10)
    draw.grid()

    // Update SelectedGrid
    setInterval(() => {
        if(player.pos == undefined) return

        let offsetX = player.offset.x()
        let offsetY = player.offset.y()

        player.selectedGrid.x = Math.floor((player.mouse.x - canvas.width/2 + offsetX * player.zoom) / player.zoom)
        player.selectedGrid.y = Math.floor((player.mouse.y - canvas.height/2 + offsetY * player.zoom) / player.zoom)
    }, 10)

    // mouse Movement
    $('body').on('mousemove', (event) => {
        player.mouse.x = event.clientX
        player.mouse.y = event.clientY
    })

  // When PLAY is pressed
  $("#playButton").on("click", (e) => { onPlayButton(e)})

  // Zooming
  $('canvas').on('DOMMouseScroll mousewheel', function(e){
    if(e.originalEvent.detail > 0 || e.originalEvent.wheelDelta < 0) {
      if(player.zoom <= 50 && !player.admin) return
      if(player.zoom <= 5) return
      player.zoom -= 5
    } else {
      if(player.zoom >= 120 && !player.admin) return
      player.zoom += 5
    }
  })


})

function onPlayButton() {
    player.id = socket.id

    if($('#nameInput').val() != '') player.username = $('#nameInput').val().trim()
    else player.username = 'Guest-'+Math.round(Math.random()*1000)

    // request world
    socket.emit('requestWorld', player.username , (err, worldInfo) => {

        // succesfully connected
        if(err == null) {
            player.worldInfo = worldInfo

            setTimeout(() => { joinedWorld() }, 100)

        // error
        } else alert({color: 'red', text: err})
    })
}

function joinedWorld() {

    history.replaceState(player.worldInfo.id, '', `/${player.worldInfo.id}/`)    



    $("#menu").hide()
    $('#backgroundOpacity').animate({'opacity': '0'}, 500, () => $('#backgroundOpacity').hide())
    updateHotbar()
    keyListener()
    mouseListener()
    updateBuildbar()

    // Begin drawing
    frame()
}

function getDistanceBetween(a, b) {
    var c = a.x - b.x
    var d = a.y - b.y
    var result = Math.sqrt( c*c + d*d )
    return result
}

function updateHotbar() {
    $('#hotbar').html('')
    for(let i in player.hotbar.list) {
        $('#hotbar').append(`<div class="hotbarSlot" id="hotbarSlot-${i}"><img src="${images[i].src}"/></div>`)
    }
}
function getKeyByIndex(object, index) {
  return Object.keys(object)[index];
}
