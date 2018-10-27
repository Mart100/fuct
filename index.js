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
app.use(express.static('client'));

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/client/index.html');
})

setInterval(() => {
    for(let num in worlds) {
        worlds[num].tick()
    }
}, 10)

// listen for requests :)
var server = app.listen(3000, function () {
  console.log('Your app is listening on port ' + server.address().port);
})

var io = Socket(server)

io.on('connection', function(socket) {

  socket.on('requestWorld', function(data, callback) {
    console.log(`Player ${data.username} tries to join world `+data.world)
    if(data.username.length > 15) return callback('USERNAME_TOO_LONG')
    if(data.world == undefined) return callback('WORLD_UNDEFINED')
    worlds[data.world].addPlayer(socket, data.username)
    callback('SUCCESS')
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