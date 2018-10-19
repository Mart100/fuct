// Variables
let buildings = {}
let players = {}
let latestframe
// run frame


// init project
var express = require('express');
var Socket = require('socket.io');
var app = express();

// require scripts
const World = require('./scripts/world.js')
let world1 = new World('oof')
app.use(express.static('client'));

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/client/index.html');
})

setInterval(() => world1.tick(), 10)

// listen for requests :)
var server = app.listen(3000, function () {
  console.log('Your app is listening on port ' + server.address().port);
})

var io = Socket(server)

io.on('connection', function(socket) {
  console.log('made connection:', socket.id)
  // Send buildings
  socket.broadcast.emit('buildings', buildings)

  socket.on('alert', function(data) {
    if(data.color == undefined) data.color = white
    io.to(data.id).emit('alert', {color: data.color, text: data.text})
  })

  socket.on('ping', () => socket.broadcast.emit('ping', ''))

  socket.on('chat', function(data) {
    console.log(data.message.replace('::', '').split(' ')[0]+' -- '+data.message.replace('::', '').split(' '))
    // all commands
    if(data.message.startsWith('::')) {
      let args = data.message.replace('::', '').split(' ')
      switch(data.message.replace('::', '').split(' ')[0]) {
        // commands everyone can access
        case('ping'):
          io.to(data.id).emit('alert', {color: 'white', text: data.text})
          break
        case('suicide'):
          players[data.id].died = true
          io.to(data.id).emit('alert', {color: 'white', text: 'Congratz you just suicided!'})
          break
        // commands only admins can use
        case('tp'):
          if(!players[data.id].admin) { io.to(data.id).emit('alert', {color: 'red', text: 'You dont have access to that command!'}); return }
          // Check if argument is a player
          for(id in players) {
            if(players[id].username != args[1]) continue
            players[data.id].pos.x = players[id].pos.x
            players[data.id].pos.y = players[id].pos.y
            return
          }
          // if no return. tp to positions
          players[data.id].pos.x = Number(args[1])+0.01
          players[data.id].pos.y = Number(args[2])+0.01
          break
        case('clearmap'):
          if(!players[data.id].admin) { io.to(data.id).emit('alert', {color: 'red', text: 'You dont have access to that command!'}); return }
          buildings = {}
          break
        case('kick'):
          if(!players[data.id].admin) { io.to(data.id).emit('alert', {color: 'red', text: 'You dont have access to that command!'}); return }
          for(id in players) if(players[id].username == args[1]) players[id].kick = true
          break
        case('vanish'):
          if(!players[data.id].admin) { io.to(data.id).emit('alert', {color: 'red', text: 'You dont have access to that command!'}); return }
          if(!players[data.id].vanish) players[data.id].vanish = true
          else players[data.id].vanish = false
          break
        case('kill'):
          if(!players[data.id].admin) { io.to(data.id).emit('alert', {color: 'red', text: 'You dont have access to that command!'}); return }
          for(id in players) if(players[id].username == args[0]) players[id].died = true
          break
        case('restart'):
          if(!players[data.id].admin) { io.to(data.id).emit('alert', {color: 'red', text: 'You dont have access to that command!'}); return }
          let a = just_crash_the_server_with_this_unkown_command
          console.log(a)
          break
      }
    } else io.sockets.emit('chat', data)
  })
  socket.on('players', data => {
    if(data.id == undefined) return
    if(players[data.id] == undefined) {
       players[data.id] = {
        movement: {
          north: false,
          east: false,
          south: false,
          west: false
        },
        health: 100,
        pos: {
         x: 0.001,
         y: 0.001
        }
      }
    }
    switch(data.type) {
      case('movement'):
        players[data.id].movement = data.player
        break
      case('newplayer'):
        players[data.id].color = data.player.color
        players[data.id].username = data.player.username
        players[data.id].health = 100
        players[data.id].died = false
        players[data.id].hotbar = {items: {}, selected: 1}
        db.ref('users/'+data.player.username).once('value').then((snapshot) => {
          if(snapshot.val() == undefined) return
          if(snapshot.val().admin) players[data.id].admin = true
        })
        break
      case('hotbar'):
        players[data.id].hotbar = data.player
        break
      case('damagePlayer'):
        players[data.id].health -= data.player
        break
      case('removeplayer'):
        delete players[data.id]
        // Remove buildings
        for(name in buildings) if(buildings[name].owner == data.id) delete buildings[name]
        break
      default:
        if(data.type == 'admin') return
        players[data.id][data.type] = data.player
    }
  })
  socket.on('buildings', data => {
    switch(data.type) {
      case('add'):
        buildings[data.id] = data.data
        switch(data.data.type) {
          case('wall'):
            buildings[`${data.data.pos.x},${data.data.pos.y}`].sides = {N: false, E: false, S: false, W: false}
            if(buildings[`${data.data.pos.x},${data.data.pos.y+1}`].sides != undefined) {
              buildings[`${data.data.pos.x},${data.data.pos.y}`].sides.S = true
              buildings[`${data.data.pos.x},${data.data.pos.y+1}`].sides.N = true
            }
            if(buildings[`${data.data.pos.x+1},${data.data.pos.y}`].sides != undefined) {
              buildings[`${data.data.pos.x},${data.data.pos.y}`].sides.E = true
              buildings[`${data.data.pos.x+1},${data.data.pos.y}`].sides.W = true
            }
            if(buildings[`${data.data.pos.x},${data.data.pos.y-1}`].sides != undefined) {
              buildings[`${data.data.pos.x},${data.data.pos.y}`].sides.N = true
              buildings[`${data.data.pos.x},${data.data.pos.y-1}`].sides.S = true
            }
            if(buildings[`${data.data.pos.x-1},${data.data.pos.y}`].sides != undefined) {
              buildings[`${data.data.pos.x},${data.data.pos.y}`].sides.W = true
              buildings[`${data.data.pos.x-1},${data.data.pos.y}`].sides.E = true
            }
          break
        }
        break
      case('remove'):
        let building = buildings[data.id]
        // other stuff depends on building
        switch(building.type) {
          case('wall'):
            if(buildings[`${building.pos.x-1},${building.pos.y}`] != undefined) buildings[`${building.pos.x-1},${building.pos.y}`].sides.E = false
            if(buildings[`${building.pos.x+1},${building.pos.y}`] != undefined) buildings[`${building.pos.x+1},${building.pos.y}`].sides.W = false
            if(buildings[`${building.pos.x},${building.pos.y-1}`] != undefined) buildings[`${building.pos.x},${building.pos.y-1}`].sides.S = false
            if(buildings[`${building.pos.x},${building.pos.y+1}`] != undefined) buildings[`${building.pos.x},${building.pos.y+1}`].sides.N = false
            break
        }
        // then delete building
        delete buildings[data.id]
        break
      case('damage'):
        // if undefined building. return
        if(buildings[data.id] == undefined) return
        buildings[data.id].health -= data.data
        // show health of building
        buildings[data.id].showhealth = 10
        break
      default:
        console.log('received unkown type request via socket "buildings": '+data.type+' data: '+data.data+' for building: '+data.id)
    }
  })

  // players[socket.id] = 'notJoined'
  // // io.sockets.emit('newPlayer', players)
  // // socket.on('newPlayer', function(data) {
  // //   players[socket.id] = data
  // //   io.sockets.emit('newPlayer', players)
  // // })
  socket.on('disconnect', function() {
    // Remove buildings
    for(name in buildings) {
      if(buildings[name].owner == socket.id) delete buildings[name]
    }
    //remove player
    delete players[socket.id]
    socket.broadcast.emit('players', players)
  })
  // send all data
  setInterval(function() {
    socket.broadcast.emit('players', players)
    socket.broadcast.emit('buildings', buildings)
  }, 1000/60)
})

function collisionPlayer(player) {
  var direction = {
    N: false,
    NE: false,
    E: false,
    ES: false,
    S: false,
    SW: false,
    W: false,
    WN: false
  }
  var offset = {}
  offset.x = Number('0.' + player.pos.x.toString().split('.')[1])
  offset.y = Number('0.' + player.pos.y.toString().split('.')[1])
  var boundry1 = 0.61
  var boundry2 = 0.39
  if(player.pos.y < 0) {
    if(offset.y > boundry1) direction.N = true
    if(offset.y < boundry2) direction.S = true
  } else {
    if(offset.y < boundry1) direction.N = true
    if(offset.y > boundry2) direction.S = true
  }
  if(player.pos.x < 0) {
    if(offset.x < boundry2) direction.E = true
    if(offset.x > boundry1) direction.W = true
  } else {
    if(offset.x > boundry1) direction.E = true
    if(offset.x < boundry2) direction.W = true
  }
  if(direction.N && direction.E) direction.NE = true
  if(direction.E && direction.S) direction.ES = true
  if(direction.S && direction.W) direction.SW = true
  if(direction.W && direction.N) direction.WN = true
  for(name in direction) {
    switch(name) {
      case('W'):
        if(buildings[`${Math.round(player.pos.x)-1},${Math.floor(player.pos.y)}`] == undefined) direction.W = false
        else if(!buildings[`${Math.round(player.pos.x)-1},${Math.floor(player.pos.y)}`].collision) direction.W = false
      case('E'):
        if(buildings[`${Math.round(player.pos.x)},${Math.floor(player.pos.y)}`] == undefined) direction.E = false
        else if(!buildings[`${Math.round(player.pos.x)},${Math.floor(player.pos.y)}`].collision) direction.E = false
      case('N'):
        if(buildings[`${Math.floor(player.pos.x)},${Math.round(player.pos.y)-1}`] == undefined) direction.N = false
        else if(!buildings[`${Math.floor(player.pos.x)},${Math.round(player.pos.y)-1}`].collision) direction.N = false
      case('S'):
        if(buildings[`${Math.floor(player.pos.x)},${Math.round(player.pos.y)}`] == undefined) direction.S = false
        else if(!buildings[`${Math.floor(player.pos.x)},${Math.round(player.pos.y)}`].collision) direction.S = false
      case('NE'):
        if(buildings[`${Math.floor(player.pos.x)+1},${Math.floor(player.pos.y)-1}`] == undefined) direction.NE = false
        else if(!buildings[`${Math.floor(player.pos.x)+1},${Math.floor(player.pos.y)-1}`].collision) direction.NE = false
      case('ES'):
        if(buildings[`${Math.floor(player.pos.x)+1},${Math.floor(player.pos.y)+1}`] == undefined) direction.ES = false
        else if(!buildings[`${Math.floor(player.pos.x)+1},${Math.floor(player.pos.y)+1}`].collision) direction.ES = false
      case('SW'):
        if(buildings[`${Math.floor(player.pos.x)-1},${Math.floor(player.pos.y)+1}`] == undefined) direction.SW = false
        else if(!buildings[`${Math.floor(player.pos.x)-1},${Math.floor(player.pos.y)+1}`].collision) direction.SW = false
      case('WN'):
        if(buildings[`${Math.floor(player.pos.x)-1},${Math.floor(player.pos.y)-1}`] == undefined) direction.WN = false
        else if(!buildings[`${Math.floor(player.pos.x)-1},${Math.floor(player.pos.y)-1}`].collision) direction.WN = false
    }
  }
  // if on building
  if(buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)] != undefined) {
    direction.N = true
    if(buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)].type == 'landmine') direction.N = false
  }
  return direction
}
