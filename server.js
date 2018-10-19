// Variables
let buildings = {}
let players = {}
let latestframe
// run frame
setInterval(() => frame(), 1000/60)
// server.js
// where your node app starts

// init project
var express = require('express');
var Socket = require('socket.io');
var app = express();


//firebase
var admin = require("firebase-admin");

var serviceAccount = require("./firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fuct-db468.firebaseio.com"
})
var db = admin.database()
var ref = db.ref("users")


// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('client'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/client/index.html');
})

// Routes
app.use('/api/discord', require('./api/discord'));

// listen for requests :)
var server = app.listen(10101, function () {
  console.log('Your app is listening on port ' + server.address().port);
})

var io = Socket(server)

io.on('connection', function(socket) {
  console.log('made connection:', socket.id)
  // Send buildings
  socket.broadcast.emit('buildings', buildings)

  socket.on('firebaseUser', function(data) {
    ref.child(data.username).set({
      password: data.password
    })
  })

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
            if(buildings[`${data.data.pos.x},${data.data.pos.y+1}`] != undefined) {
              buildings[`${data.data.pos.x},${data.data.pos.y}`].sides.S = true
              buildings[`${data.data.pos.x},${data.data.pos.y+1}`].sides.N = true
            }
            if(buildings[`${data.data.pos.x+1},${data.data.pos.y}`] != undefined) {
              buildings[`${data.data.pos.x},${data.data.pos.y}`].sides.E = true
              buildings[`${data.data.pos.x+1},${data.data.pos.y}`].sides.W = true
            }
            if(buildings[`${data.data.pos.x},${data.data.pos.y-1}`] != undefined) {
              buildings[`${data.data.pos.x},${data.data.pos.y}`].sides.N = true
              buildings[`${data.data.pos.x},${data.data.pos.y-1}`].sides.S = true
            }
            if(buildings[`${data.data.pos.x-1},${data.data.pos.y}`] != undefined) {
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
// Game loop
function frame() {
  //console.log(new Date() - latestframe)
  latestframe = new Date()
  // loop trough all buildings
  for(let key in buildings) {
    let building = buildings[key]
    // If building is turret...
    if(building.type == 'turreticon') {
      // shoottimer
      building.timer++
      // check if bullet hit player
      for(let num in building.bullets) {
        let bullet = building.bullets[num]
        // if player left. skip collision
        if(players[bullet.target] == undefined) continue
        var circle1 = {radius: 1/2.5, x: bullet.pos.x, y: bullet.pos.y}
        var circle2 = {radius: 1/5, x: players[bullet.target].pos.x, y: players[bullet.target].pos.y}

        let dx = circle1.x - circle2.x;
        let dy = circle1.y - circle2.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < circle1.radius + circle2.radius) {
          players[bullet.target].health -= 1
          //console.log('hit: '+players[bullet.target].username)
          delete building.bullets[num]
        }
      }
      // if timer is ready
      if(building.timer > building.reloadspeed) {
        building.timer = 0
        // Calculate closest player
        let closestplayer = { x: 9999, y: 9999 }
        let closestplayerid = 'none'
        for(let id in players) {
          // if player is undefined somehow
          if(players[id] == undefined) continue
          // dont shoot to owner
          if(id == building.owner) continue
          // dont shoot if target is to far away
          if(Math.abs(players[id].pos.x - building.pos.x+0.5)+Math.abs(players[id].pos.y - building.pos.y+0.5) > building.range) continue
          if(Math.abs(closestplayer.x - building.pos.x+0.5)+Math.abs(closestplayer.y - building.pos.y+0.5) > Math.abs(players[id].pos.x - building.pos.x+0.5)+Math.abs(players[id].pos.y - building.pos.y+0.5)) {
            closestplayer = { x: players[id].pos.x, y: players[id].pos.y }
            closestplayerid = id
          }
        }
        // if no target avaible
        if(closestplayerid == 'none') continue
          // calculate angle
        let angle = Math.atan2(closestplayer.y - building.pos.y-0.5, closestplayer.x - building.pos.x-0.5)
        for(let i=0;i<1e2;i++) {
         if(building.bullets[i] == undefined) {
           nummer = i
           break
         }
        }
        building.bullets[nummer] = {
          pos: {
            x: building.pos.x+0.5,
            y: building.pos.y+0.5
          },
          slope: {
            x: Math.cos(angle),
            y: Math.sin(angle)
          },
          target: closestplayerid,
          traveled: 0
        }
      }
      // Move bullets
      for(let num in building.bullets) {
        let bullet = building.bullets[num]
        bullet.pos.x += bullet.slope.x / 10 * building.bulletspeed
        bullet.pos.y += bullet.slope.y / 10 * building.bulletspeed
        bullet.traveled += Math.abs(bullet.slope.x) / 10 * building.bulletspeed + Math.abs(bullet.slope.y) / 10 * building.bulletspeed
        // delete bullets if their to far away
        if(bullet.traveled > building.range) delete building.bullets[num]
      }
    }
    // landmine
    if(building.type == 'landmine') {
      if(building.exploding >= 1) building.exploding += 0.2
      if(building.exploding >= 19) delete buildings[key]
    }
    // show health of building
    if(building.showhealth > 0) building.showhealth -= 0.05
  }
  // loop trough all players
  for(id in players) {
    let player = players[id]
    if(player == undefined || player.username == undefined) delete players[id]
    if(player.pos == undefined || player.movement == undefined) continue
    // move players
    if(player.movement.north) player.pos.y -= 0.03
    if(player.movement.east) player.pos.x += 0.03
    if(player.movement.south) player.pos.y += 0.03
    if(player.movement.west) player.pos.x -= 0.03
    // building collision
    let directions = collisionPlayer(player)
    player.directions = directions
    if(directions.W || directions.SW || directions.WN) player.pos.x += (Math.abs(Number('0.' + player.pos.x.toString().split('.')[1])-0.5))/10
    if(directions.E || directions.NE || directions.ES) player.pos.x -= (Math.abs(Number('0.' + player.pos.x.toString().split('.')[1])-0.5))/10
    if(directions.N || directions.NE || directions.WN) player.pos.y += (Math.abs(Number('0.' + player.pos.y.toString().split('.')[1])-0.5))/10
    if(directions.S || directions.SW || directions.ES) player.pos.y -= (Math.abs(Number('0.' + player.pos.y.toString().split('.')[1])-0.5))/10
    // player collision
    for(idColl in players) {
      let playerColl = players[idColl]
      // if player is undefined return
      if(playerColl == undefined || playerColl.pos == undefined) continue
      // if player is player return
      if(id == idColl) continue
      let dx = player.pos.x - playerColl.pos.x
      let dy = player.pos.y - playerColl.pos.y;
      let distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < 0.9) {
        let angle = Math.atan2(player.pos.y - playerColl.pos.y, player.pos.x - playerColl.pos.x)
        player.pos.x += Math.cos(angle) * (1-Math.abs(Number('0.' + player.pos.x.toString().split('.')[1])-Number('0.' + playerColl.pos.x.toString().split('.')[1])))/40
        player.pos.y += Math.sin(angle) * (1-Math.abs(Number('0.' + player.pos.y.toString().split('.')[1])-Number('0.' + playerColl.pos.x.toString().split('.')[1])))/40
      }
    }
    // When player stands on landmine
    if(buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)] != undefined
       && buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)].type == 'landmine'
       && buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)].owner != id
       && buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)].exploding == 0) {
      let landmine = buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)]
      // start with explosion animation
      landmine.exploding = 1
      // damage players
      for(id in players) {
        if(Math.abs(players[id].pos.x - landmine.pos.x+0.5)+Math.abs(players[id].pos.y - landmine.pos.y+0.5) < 3.5) {
          players[id].health -= (4 - Math.abs(players[id].pos.x - landmine.pos.x+0.5)+Math.abs(players[id].pos.y - landmine.pos.y+0.5))*5
        }
      }

    }
    // if player has 0 health
    if(player.health < 0) player.died = true
    // if player is in vanish
    if(player.vanish) player.health = 100
    // regenerate player
    if(player.health < 100) player.health += 0.01
  }
}
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
