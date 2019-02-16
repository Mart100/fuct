const tick = require('./tick.js')
const SocketHandler = require('./socketHandler.js')
const getShopPrices = require('./shopPrices.js')

class World {
  constructor(id, settings) {
    this.id = id
    this.players = {}
    this.buildings = {}
    this.socketHandler = new SocketHandler(this)
    this.tps = {
      latestTPS: process.hrtime()[0],
      startTickCount: 0
    }
    this.tickCount = 0
    this.buildingsData = settings.buildingsData
    this.borders = settings.borders
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
        x: (Math.random()*this.borders.x*2)-this.borders.x,
        y: (Math.random()*this.borders.y*2)-this.borders.y
      },
      admin: false,
      moving: {
        north: false,
        east: false,
        south: false,
        west: false
      },
      spawning: false,
      speed: 0.05,
      building: {
        selected: 'core',
        list: {}
      },
      clones: [],
      hotbar: {
        selected: 1,
        list: {
          sword: {
            level: 1,
            range: 3
          },
          pickaxe: {
            level: 1,
          }
        }
      },
      username: username,
      color: `rgb(${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)})`,
      health: 100,
      isDead: false,
      stats: {
        kills: 0,
        deaths: 0,
        coreDestroys: 0,
        totalCoins: 0
      }
    }

    // add startBuildings to building.list
    for(let buildingName in this.buildingsData) {
      let building = this.buildingsData[buildingName]
      this.players[socket.id].building.list[buildingName] = {amount: building.startAmount}
    }
    this.socketHandler.addSocket(socket)


  }
  moveAllowed(player, direction) {

    let playerX = player.pos.x
    let playerY = player.pos.y
    let borders = this.borders

    if(direction == 'north') playerY -= player.speed
    if(direction == 'east') playerX += player.speed
    if(direction == 'south') playerY += player.speed
    if(direction == 'west') playerX -= player.speed

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