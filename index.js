// Variables
let buildings = {}
let players = {}
let worlds = []
let latestframe
// run frame


// init project
var express = require('express');
var Socket = require('socket.io');
var app = express();

// require scripts
const World = require('./scripts/world.js')
worlds['oof'] = new World('oof')
worlds['yeet'] = new World('aids')
app.use('/', express.static('client'));

app.use('/:id', express.static('client'))

// app.get("/:id:", function (request, response) {
//   response.sendFile(__dirname + '/client/index.html');
// })

setInterval(() => {
    for(let num in worlds) {
        worlds[num].tick()
    }
}, 10)

// listen for requests :)
var server = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + server.address().port);
})

var io = Socket(server)

io.on('connection', function(socket) {
  let gameID = socket.handshake.headers.referer.split('/')[3]
  if(gameID == '') gameID = worlds[Object.keys(worlds)[Math.floor(Math.random()*Object.keys(worlds).length)]].id
  socket.on('requestWorld', function(username, callback) {
    console.log(`Player ${username} tries to join world `+gameID)
    if(username.length > 20) return callback('USERNAME_TOO_LONG', gameID)
    if(worlds[gameID] == undefined) return callback('WORLD_UNDEFINED', gameID)
    worlds[gameID].addPlayer(socket, username)
    callback(null, gameID)
  })

  console.log('made connection:', socket.id)
  //world1.addPlayer(socket)
  // Send buildings
  socket.broadcast.emit('buildings', buildings)

  socket.on('alert', function(data) {
    if(data.color == undefined) data.color = white
    io.to(data.id).emit('alert', {color: data.color, text: data.text})
  })

  socket.on('ping', () => socket.broadcast.emit('ping', ''))


  // players[socket.id] = 'notJoined'
  // // io.sockets.emit('newPlayer', players)
  // // socket.on('newPlayer', function(data) {
  // //   players[socket.id] = data
  // //   io.sockets.emit('newPlayer', players)
  // // })
  
})

