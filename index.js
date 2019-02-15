// Variables
let buildings = {}
let players = {}
let worlds = []
let latestframe
let tps = 0
// run frame


// init project
var express = require('express');
var Socket = require('socket.io');
var app = express();

// require scripts
const World = require('./scripts/world.js')
const buildingsData = require('./scripts/buildingsData.js')

// Create Main World
let mainWorldSettings = {
  password: '6j6l10sjema',
  borders: {x: 100, y: 100},
  buildingsData: buildingsData
}
worlds['main'] = new World('main', mainWorldSettings)

// Create Testing World
let testingWorldSettings = {
  password: 'mv4ses70s0',
  borders: {x: 10, y: 10},
  buildingsData: buildingsData
}
worlds['testing'] = new World('testing', testingWorldSettings)


app.use('/', express.static('client'))

app.use('/:id/', express.static('client'))

setInterval(() => {
  for(let num in worlds) worlds[num].tick()
}, 10)

// listen on port :)
var server = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + server.address().port);
})

var io = Socket(server)

io.on('connection', function(socket) {
  let gameID = socket.handshake.headers.referer.split('/')[3]
  if(gameID == '') gameID = worlds['main'].id

  // When player tries to join a world
  socket.on('requestWorld', function(username, callback) {
    console.log(`Player ${username} tries to join world `+gameID)
    let world = worlds[gameID]

    username = username.trim()

    // return when errors
    if(username == '') return callback('EMPTY_USERNAME', gameID)
    if(username.length > 20) return callback('USERNAME_TOO_LONG', gameID)
    if(world == undefined) return callback('WORLD_UNDEFINED', gameID)



    world.addPlayer(socket, username)
    
    let infoToClient = {
      worldBorders: world.borders,
      worldID: gameID,
      buildingsData: world.buildingsData
    }
    callback(null, infoToClient)
  })

  console.log('made connection:', socket.id)

  // Send buildings
  socket.broadcast.emit('buildings', buildings)

  socket.on('alert', function(data) {
    if(data.color == undefined) data.color = white
    io.to(data.id).emit('alert', {color: data.color, text: data.text})
  })
  
})