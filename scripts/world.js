const tick = require('./tick.js')
const SocketHandler = require('./socketHandler.js')
const getShopPrices = require('./shopPrices.js')

class World {
  constructor(id, settings) {
    this.id = id
    this.players = {}
    this.buildings = {}
    this.socketHandler = new SocketHandler(this)
    this.latestTPS = process.hrtime()[0]
    this.tickCount = 0
    if(settings == undefined) settings = {}
    this.settings = settings
  }
  tick() {
    tick(this)
  }
  addPlayer(socket, username) {
    //joins the room
    socket.join(this.id)

    socket.emit('buildings', this.buildings)
    socket.emit('shopPrices', getShopPrices('full', this.socketHandler, socket))

    this.players[socket.id] = {
      id: socket.id,
      coins: 50,
      pos: {
        x: Math.random()*5,
        y: Math.random()*5
      },
      admin: false,
      moving: {
        north: false,
        east: false,
        south: false,
        west: false
      },
      spawning: 0,
      speed: 0.05,
      building: {
        selected: 'core',
        list: {
          core: { amount: 1 },
          miner: { amount: 1 },
          turret: { amount: 1 },
          landmine: { amount: 0 },
          wall: { amount: 10 },
          barbedwire: { amount: 0 },
          spongebob: { amount: 0 },
          bulldozer: { amount: Infinity }
        }
      },
      hotbar: {
        selected: 1,
        list: {
          sword: {
            level: 1,
            slot: 0,
            range: 3
          },
          pickaxe: {
            level: 1,
            slot: 1
          }
        }
      },
      username: username,
      color: `rgb(${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)})`,
      health: 100,
      isDead: false
    }
    this.socketHandler.addSocket(socket)


  }
  moveAllowed(player, direction) {

    let radius = 0.9/2
    let halfRect = 0.5
    let playerX = player.pos.x
    let playerY = player.pos.y
    let allowedDirections = {
      N: true,
      S: true,
      W: true,
      E: true
    }

    switch(direction) {
      case('north'): {
        playerY -= player.speed
        break
      }
      case('south'): {
        playerY += player.speed
        break
      }
      case('east'): {
        playerX += player.speed
        break
      }
      case('west'): {
        playerX -= player.speed
        break
      }
      default: {

        break
      }
    }
    let collidingBuildings = this.getCollidingBuildings(playerX, playerY)
    return collidingBuildings == 0
    

  }
  getCollidingBuildings(playerX, playerY) {
    let radius = 0.9/2
    let halfRect = 0.5
    let collidingBuildings = []
    for(let i in this.buildings) {
      
      let building = this.buildings[i]
      if(!building.collision) continue
      //Find the vertical & horizontal (distX/distY) distances between the circle’s center and the rectangle’s center
      let distX = Math.abs(playerX - building.pos.x-halfRect)
      let distY = Math.abs(playerY - building.pos.y-halfRect)
      
      //If the distance is greater than halfCircle + halfRect, then they are too far apart to be colliding
      if (distX > (halfRect + radius)) continue
      if (distY > (halfRect + radius)) continue

      if (distX <= halfRect) {
        collidingBuildings.push(building)
        continue
      }
      if (distY <= halfRect) {
        collidingBuildings.push(building)
        continue
      }
      /** Test for collision at rect corner. 
        * Think of a line from the rect center to any rect corner
        * Now extend that line by the radius of the circle
        * If the circle’s center is on that line they are colliding at exactly that rect corner
        * Using Pythagoras formula to compare the distance between circle and rect centers.
        */ 
        let dx = distX-halfRect
        let dy = distY-halfRect

      
      if (dx*dx+dy*dy<=(radius*radius)) {
        collidingBuildings.push(building)
        continue
      }
      
    }
    return collidingBuildings
  }

}
module.exports = World