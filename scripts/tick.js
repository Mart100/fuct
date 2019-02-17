let cloneAI = require('./cloneAI.js')

function tick(world) {
  
  // if no players. return
  if(world.players.length == 0) return

  world.tickCount++

  // loop trough all buildings
  for(let id in world.buildings) buildingTick(id, world)

  // playerTick
  for(let id in world.players) playerTick(id, world)

  // updateLeaderboard
  if(world.tickCount % 100 == 1) sendLeaderboard(world)
  //else console.log(world.tickCount % 100)

  // cloneTick
  for(let playerID in world.players) for(let cloneNum in world.players[playerID].clones) cloneTick(cloneNum, playerID,  world)

  // cloneAI
  if(world.tickCount % 20 == 1) {
    for(let playerID in world.players) {
      if(world.players[playerID] == undefined) continue
      for(let cloneNum in world.players[playerID].clones) {
        cloneAI(world.players[playerID].clones[cloneNum], world)
      }
    }
  }

 
  checkTPS(world)

  world.socketHandler.sendData(world)
}
  
module.exports = tick

function checkTPS(world) {
  // Check if latest TPScheck was 1sec ago
  if(process.hrtime()[0] > world.tps.latestTPS) {
    let tps = world.tickCount - world.tps.startTickCount
    world.socketHandler.broadcast('TPS', tps)
    world.tps.startTickCount = world.tickCount
    world.tps.latestTPS = process.hrtime()[0]
  }
}

function cloneTick(cloneNum, playerID, world) {
  let clone = world.players[playerID].clones[cloneNum]
  if(clone == undefined) return
  // some vars
  let cloneSpeed = clone.speed
  let mf = Math.floor
  let cpx = clone.pos.x
  let cpy = clone.pos.y
  let buildings = world.buildings
  let standingOn = buildings[mf(cpx)+','+mf(cpy)]
  
  // if player is standin on barbed wire
  if(standingOn != undefined && standingOn.type == 'barbedwire') {
    clone.health -= 0.1
    cloneSpeed = cloneSpeed/4
  }

  // When clone stands on landmine
  if(standingOn != undefined && standingOn.type == 'landmine' && standingOn.owner != id && standingOn.exploding == 0) {
    let landmine = standingOn
    landmine.exploding = 1
    clone.health -= 40
  }

  // collisions
  playerCollisions(clone, world, cloneSpeed)

  // if clone dieded
  if(clone.health <= 0) delete world.players[playerID].clones[cloneNum]

  // regenerate clone
  if(clone.health < clone.maxHealth) clone.health += 0.01

}



function buildingTick(id, world) {
  let building = world.buildings[id]

  // If building is turret
  if(building.type == 'turret') turretTick(building, world)

  // landmine
  if(building.type == 'landmine') {
    if(building.exploding >= 1) building.exploding += 0.2
    if(building.exploding >= 19) delete world.buildings[id]
  }

  // show health of building
  if(building.showhealth > 0) building.showhealth -= 0.05

  //goldmine
  if(building.type == 'miner') {
    world.players[building.owner].coins += 0.01
    world.players[building.owner].stats.totalCoins += 0.01
  }

  // cloneFactory
  if(building.type == 'cloneFactory') {
    building.cloneTimer--

    // if cloneTimer ready. make clone
    if(building.cloneTimer < 0) {
      building.cloneTimer = 1000
      let clone = {
        pos: {x: building.pos.x, y: building.pos.y},
        owner: building.owner,
        health: 100,
        maxHealth: 100,
        speed: 0.05,
        moving: {north: false, east: false, south: false, west: false}

      }
      world.players[building.owner].clones.push(clone)
    }
  }
}

function sendLeaderboard(world) {
  let players = []
  
  for(let player of Object.values(world.players)) {
    players.push({
      totalCoins: Math.round(player.stats.totalCoins),
      username: player.username
    })
  }
  players.sort((a, b) => b.totalCoins-a.totalCoins)
  players.slice(0, 10)
  world.socketHandler.broadcast('leaderboard', players)

}

function turretTick(building, world) {
  building.timer++
  buildingMiddlePos = {x: building.pos.x+0.5, y: building.pos.y+0.5}
  

  // check if bullet hits player
  for(let i in building.bullets) {
    let bullet = building.bullets[i]
    let target = world.players[bullet.target]

    let circle1 = {radius: 1/2.5, x: bullet.pos.x, y: bullet.pos.y}
    let circle2 = {radius: 1/5, x: target.pos.x, y: target.pos.y}

    // if collide
    if (circleCollision(circle1, circle2)) {
      target.health -= building.bulletdamage
      building.bullets.splice(i, 1)
    }
  }

  // if timer is ready new bullet
  if(building.timer > building.reloadspeed) {
    building.timer = 0

    // Find closest player
    let closestPlayer = 1000
    let closestPlayerID = 'none'
    for(let id in world.players) {
      let player = world.players[id]
      if(id == building.owner) continue
      let distance = getDistanceBetween(player.pos, buildingMiddlePos)

      // continue if target is to far away
      if(distance > building.range) continue

      // if closer.
      if(distance < closestPlayer) {
        closestPlayer = distance
        closestPlayerID = id
      }
    }

    // if target found.
    if(closestPlayerID != 'none') {
      closestPlayerPos = world.players[closestPlayerID].pos

      // calculate angle
      let angle = Math.atan2(closestPlayerPos.y - building.pos.y-0.5, closestPlayerPos.x - building.pos.x-0.5)

      // add new bullet
      building.bullets.push({
        pos: {
          x: building.pos.x+0.5,
          y: building.pos.y+0.5
        },
        slope: {
          x: Math.cos(angle),
          y: Math.sin(angle)
        },
        target: closestPlayerID,
        traveled: 0
      })
    }
  }

  // Move all bullets
  for(let num in building.bullets) {
    let bullet = building.bullets[num]
    bullet.pos.x += bullet.slope.x / 10 * building.bulletspeed
    bullet.pos.y += bullet.slope.y / 10 * building.bulletspeed
    bullet.traveled += Math.abs(bullet.slope.x) / 10 * building.bulletspeed + Math.abs(bullet.slope.y) / 10 * building.bulletspeed

    // delete bullets if their to far away
    if(bullet.traveled > building.range) delete building.bullets[num]
  }
}

function playerTick(id, world) {
  let player = world.players[id]
  let playerSpeed = Number(player.speed)
  
  // if player is standin on barbed wire
  if(world.buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)] != undefined && world.buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)].type == 'barbedwire') {
      player.health -= 0.1
      playerSpeed = player.speed/4
  }

  // When player stands on landmine
  if(world.buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)] != undefined
      && world.buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)].type == 'landmine'
      && world.buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)].owner != id
      && world.buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)].exploding == 0) {
    let landmine = world.buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)]
    // start with explosion animation
    landmine.exploding = 1
    // damage world.players
    for(id in world.players) {
      if(Math.abs(world.players[id].pos.x - landmine.pos.x+0.5)+Math.abs(world.players[id].pos.y - landmine.pos.y+0.5) < 3.5) {
        world.players[id].health -= (4 - Math.abs(world.players[id].pos.x - landmine.pos.x+0.5)+Math.abs(world.players[id].pos.y - landmine.pos.y+0.5))*5
      }
    }

  }
  // collisions
  playerCollisions(player, world, playerSpeed)


  // if player has 0 health
  if(player.health <= 0) {
    player.spawning = new Date()
    player.health = 100000000
    player.pos = {x: 1e9, y: 1e9}
    player.stats.deaths++
  }

  // if spawning timer ender
  if(player.spawning && new Date() - player.spawning > 5000) {
    player.health = 100
    player.spawning = false

    // tp player back closest to core
    let core = Object.values(world.buildings).find((a) => a.owner == player.id && a.type == 'core' )
    if(core == undefined) return
    player.pos = findEmptySpaceClosestToCore(core, world)
  }

  // if player is in vanish
  if(player.vanish) player.health = 100

  // regenerate player
  if(player.health < 100) player.health += 0.01
}


function playerCollisions(player, world, playerSpeed) {
  // move players when their inside of blocks
  let collidingBuildings = world.getCollidingBuildings(player.pos.x, player.pos.y)
  
  if(collidingBuildings.length != 0) {
    
    let distX = player.pos.x - collidingBuildings[0].pos.x-0.5
    let distY = player.pos.y - collidingBuildings[0].pos.y-0.5
    
    let axis = Math.abs(distX) > Math.abs(distY)

    if(axis && distX < 0) player.pos.x -= 0.1
    if(axis && distX > 0) player.pos.x += 0.1
    if(!axis && distX < 0) player.pos.y -= 0.1
    if(!axis && distX > 0) player.pos.y += 0.1
    player.health -= 0.5
  }


  // Sliding off edges
  for(let i=0;i<4;i++) {
    let a = {}
    if(i == 0) a = {offset: {x: 0, y: -0.05}, axis: 'x', dir: 'north'}
    if(i == 1) a = {offset: {x: 0.05, y: 0}, axis: 'y', dir: 'east'}
    if(i == 2) a = {offset: {x: 0, y: 0.05}, axis: 'x', dir: 'south'}
    if(i == 3) a = {offset: {x: -0.05, y: 0}, axis: 'y', dir: 'west'}

    let CB = world.getCollidingBuildings(player.pos.x + a.offset.x, player.pos.y + a.offset.y) // First building that collide with player+offset
    let PR = 0.9/2 // PlayerRadius
  
    if(player.moving[a.dir] && CB.length==1) {

      let distX = Math.abs(player.pos.x + a.offset.x - CB[0].pos.x - 0.5)
      let distY = Math.abs(player.pos.y + a.offset.y - CB[0].pos.y - 0.5)

      let dx = distX-0.5
      let dy = distY-0.5

      let xOffset = CB[0].pos[a.axis]-player.pos[a.axis]
      if (dx*dx+dy*dy<=(PR*PR)) {
        if(xOffset > 0) player.pos[a.axis] -= playerSpeed
        if(xOffset < -1) player.pos[a.axis] += playerSpeed
      }
      
    }
  }
  

  //Collision checking and moving
  if(player.spawning == undefined || player.spawning <= 0) {
    let borders = world.borders
    let PR = 0.9/2 // PlayerRadius
    if(player.moving.north && world.moveAllowed(player, 'north') && player.pos.y-PR > -borders.y) player.pos.y -= Number(playerSpeed)
    if(player.moving.east && world.moveAllowed(player, 'east') && player.pos.x+PR < borders.x) player.pos.x += Number(playerSpeed)
    if(player.moving.south && world.moveAllowed(player, 'south') && player.pos.y+PR < borders.x) player.pos.y += Number(playerSpeed)
    if(player.moving.west && world.moveAllowed(player, 'west') && player.pos.x-PR > -borders.x) player.pos.x -= Number(playerSpeed) 
  }
  
  // player collision
  for(let idColl in world.players) {
    let playerColl = world.players[idColl]

    // if player is player return
    if(player.id == idColl) continue

    let dx = player.pos.x - playerColl.pos.x
    let dy = player.pos.y - playerColl.pos.y;
    let distance = Math.sqrt(dx * dx + dy * dy)
    if (distance < 0.9) {
      let angle = Math.atan2(player.pos.y - playerColl.pos.y, player.pos.x - playerColl.pos.x)
      player.pos.x += Math.cos(angle) / 40
      player.pos.y += Math.sin(angle) / 40
    }
  }
}


function getDistanceBetween(a, b) {
  let c = a.x - b.x
  let d = a.y - b.y
  let result = Math.sqrt( c*c + d*d )
  return result
}

function circleCollision(a, b) {
  let distance = getDistanceBetween(a, b)
  if(distance < a.radius+b.radius) return true
  return false
}

function findEmptySpaceClosestToCore(core, world) {
  let checkedSpots = []
  let spot = {x: core.pos.x, y: core.pos.y}
  // loop trough circles
  for(let i=0;i<10;i++) {
    // loop trough directions
    for(let j=0;j<4;j++) {
      let dir = {}
      if(j == 0) dir = {x: 1, y: 0}
      if(j == 1) dir = {x: 0, y: 1}
      if(j == 2) dir = {x: -1, y: 0}
      if(j == 3) dir = {x: 0, y: -1}

      // loop trough grid
      for(let k=0;k<i*2+Math.round(j/2);k++) {
        spot.x += dir.x
        spot.y += dir.y
        if(world.buildings[spot.x+','+spot.y] == undefined) return spot
      }
    }
  }

  return {x: 0, y: 0}
}