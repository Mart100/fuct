function tick(world) {
  
  // if no players. return
  if(world.players.length == 0) return

  world.tickCount++

  // loop trough all buildings
  for(let id in world.buildings) buildingTick(id, world)

  // playerTick
  for(let id in world.players) playerTick(id, world)
 
  checkTPS(world)

  world.socketHandler.sendData(world)
}
  
module.exports = tick


function checkTPS(world) {
  // Check if latest TPScheck was 1sec ago
  if(process.hrtime()[0] > world.latestTPS) {
    world.socketHandler.broadcast('TPS', world.tickCount)
    world.tickCount = 0
    world.latestTPS = process.hrtime()[0]
  }
}

function buildingTick(id, world) {
  let building = world.buildings[id]

  // If building is turret
  if(building.type == 'turret') turretTick(building, world)

  // landmine
  if(building.type == 'landmine') {
    if(building.exploding >= 1) building.exploding += 0.2
    if(building.exploding >= 19) delete world.buildings[key]
  }

  // show health of building
  if(building.showhealth > 0) building.showhealth -= 0.05

  //goldmine
  if(building.type == 'miner') {
    world.players[building.owner].coins = Number(world.players[building.owner].coins) + 0.01
  }
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
  
  let halfRect = 0.5
  let radius = 0.9/2

  // move world.players
  let collidingBuildings = world.getCollidingBuildings(player.pos.x, player.pos.y)
  
  if(collidingBuildings.length != 0) {
    
    let buildX = collidingBuildings[0].pos.x
    let buildY = collidingBuildings[0].pos.y
    let distX = player.pos.x - buildX-halfRect
    let distY = player.pos.y - buildY-halfRect

    
    if(Math.abs(distX) > Math.abs(distY)) {
      

      if(distX < 0) {
        player.pos.x -= 0.1
      } else {
        player.pos.x += 0.1
      }
    } else {
      


      if(distY < 0) {
        player.pos.y -= 0.1
      } else {
        player.pos.y += 0.1
      }
    }
    
  }


  //Sliding off edges
  collidingBuildings = world.getCollidingBuildings(player.pos.x, player.pos.y-0.05)
  
  if(player.moving.north && collidingBuildings.length==1) {

    let buildX = collidingBuildings[0].pos.x
    let buildY = collidingBuildings[0].pos.y
    let distX = Math.abs(player.pos.x - buildX-halfRect)
    let distY = Math.abs(player.pos.y-0.05 - buildY-halfRect)

    let dx = distX-halfRect
    let dy = distY-halfRect

    let xOffset = buildX-player.pos.x
    if (dx*dx+dy*dy<=(radius*radius)) {
      if(xOffset > 0) player.pos.x -= playerSpeed
      if(xOffset < -1) player.pos.x += playerSpeed
    }
    
  }

  collidingBuildings = world.getCollidingBuildings(player.pos.x, player.pos.y+0.05)
  
  if(player.moving.south && collidingBuildings.length==1) {
    let buildX = collidingBuildings[0].pos.x
    let buildY = collidingBuildings[0].pos.y
    let distX = Math.abs(player.pos.x - buildX-halfRect)
    let distY = Math.abs(player.pos.y+0.05 - buildY-halfRect)

    let dx = distX-halfRect
    let dy = distY-halfRect

    let xOffset = buildX-player.pos.x
    if (dx*dx+dy*dy<=(radius*radius)) {
      if(xOffset > 0) player.pos.x -= playerSpeed
      if(xOffset < -1) player.pos.x += playerSpeed
    }
  }

  collidingBuildings = world.getCollidingBuildings(player.pos.x, player.pos.y+0.05)
  
  if(player.moving.south && collidingBuildings.length==1) {
    let buildX = collidingBuildings[0].pos.x
    let buildY = collidingBuildings[0].pos.y
    let distX = Math.abs(player.pos.x - buildX-halfRect)
    let distY = Math.abs(player.pos.y+0.05 - buildY-halfRect)

    let dx = distX-halfRect
    let dy = distY-halfRect

    let xOffset = buildX-player.pos.x
    if (dx*dx+dy*dy<=(radius*radius)) {
      if(xOffset > 0) player.pos.x -= playerSpeed
      if(xOffset < -1) player.pos.x += playerSpeed
    }
  }

  collidingBuildings = world.getCollidingBuildings(player.pos.x+0.05, player.pos.y)
  
  if(player.moving.east && collidingBuildings.length==1) {
    let buildX = collidingBuildings[0].pos.x
    let buildY = collidingBuildings[0].pos.y
    let distX = Math.abs(player.pos.x+0.05 - buildX-halfRect)
    let distY = Math.abs(player.pos.y - buildY-halfRect)

    let dx = distX-halfRect
    let dy = distY-halfRect

    let yOffset = buildY-player.pos.y
    if (dx*dx+dy*dy<=(radius*radius)) {
      if(yOffset > 0) player.pos.y -= playerSpeed
      if(yOffset < -1) player.pos.y += playerSpeed
    }
  }

  collidingBuildings = world.getCollidingBuildings(player.pos.x-0.05, player.pos.y)
  
  if(player.moving.west && collidingBuildings.length==1) {
    let buildX = collidingBuildings[0].pos.x
    let buildY = collidingBuildings[0].pos.y
    let distX = Math.abs(player.pos.x-0.05 - buildX-halfRect)
    let distY = Math.abs(player.pos.y - buildY-halfRect)

    let dx = distX-halfRect
    let dy = distY-halfRect

    let yOffset = buildY-player.pos.y
    if (dx*dx+dy*dy<=(radius*radius)) {
      if(yOffset > 0) player.pos.y -= playerSpeed
      if(yOffset < -1) player.pos.y += playerSpeed
    }
  }
  

  //Collision checking and moving
  if(player.spawning <= 0) {
    let borders = world.settings.borders
    let PR = 0.9/2 // PlayerRadius
    if(player.moving.north && world.moveAllowed(player, 'north') && player.pos.y-PR > -borders.y) player.pos.y -= Number(playerSpeed)
    if(player.moving.east && world.moveAllowed(player, 'east') && player.pos.x+PR < borders.x) player.pos.x += Number(playerSpeed)
    if(player.moving.south && world.moveAllowed(player, 'south') && player.pos.y+PR < borders.x) player.pos.y += Number(playerSpeed)
    if(player.moving.west && world.moveAllowed(player, 'west') && player.pos.x-PR > -borders.x) player.pos.x -= Number(playerSpeed) 
  }

  

  // building collision
  
  // player.directions = directions

  // let A = 50
  // let B = 0.5

  // if(directions.W || directions.SW || directions.WN) player.pos.x += (Math.abs(Number('0.' + player.pos.x.toString().split('.')[1])-B))/A
  // if(directions.E || directions.NE || directions.ES) player.pos.x -= (Math.abs(Number('0.' + player.pos.x.toString().split('.')[1])-B))/A
  // if(directions.N || directions.NE || directions.WN) player.pos.y += (Math.abs(Number('0.' + player.pos.y.toString().split('.')[1])-B))/A
  // if(directions.S || directions.SW || directions.ES) player.pos.y -= (Math.abs(Number('0.' + player.pos.y.toString().split('.')[1])-B))/A
  // player collision
  for(let idColl in world.players) {
    let playerColl = world.players[idColl]
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
  // if player has 0 health
  if(player.health <= 0) {
      player.spawning = 5
      player.health = 100000000
      player.pos = {x: Math.random()*1e9, y: Math.random()*1e9} 
  }
  if(player.spawning <= 0.01 && player.spawning > 0) {
      player.health = 100
      player.pos = {x: Math.random()*10, y: Math.random()*10} 
  }
  // countdown spawning
  if(player.spawning > 0) player.spawning -= 0.01
  // if player is in vanish
  if(player.vanish) player.health = 100
  // regenerate player
  if(player.health < 100) player.health += 0.01
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