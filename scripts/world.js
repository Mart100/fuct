const tick = require('./tick.js')
const SocketHandler = require('./socketHandler.js')

class World {
    constructor(id) {
        this.id = id
        this.players = {}
        this.buildings = {}
        this.socketHandler = new SocketHandler(this)
    }
    tick() {
        tick(this)
    }
    addPlayer(socket, username) {
      //joins the room
      socket.join(this.id)

      socket.emit('buildings', this.buildings)

      this.players[socket.id] = {
        id: socket.id,
        pos: {
            x: Math.random()*5,
            y: Math.random()*5
        },
        admin: true,
        moving: {
            north: false,
            east: false,
            south: false,
            west: false
        },
        spawning: 0,
        speed: 0.05,
        building: {
            selected: 1,
            list: ['core', 'miner', 'turreticon', 'landmine', 'wall', 'barbedwire', 'spongebob', 'spongebob', 'spongebob', 'bulldozer']
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
      //console.log(this.players)
      this.socketHandler.addSocket(socket)
        

    }
    // collisionPlayer(player) {
    //     var direction = {
    //         N: false,
    //         NE: false,
    //         E: false,
    //         ES: false,
    //         S: false,
    //         SW: false,
    //         W: false,
    //         WN: false
    //     }
    //     var offset = {}
    //     offset.x = Number('0.' + player.pos.x.toString().split('.')[1])
    //     offset.y = Number('0.' + player.pos.y.toString().split('.')[1])
    //     var boundry1 = 0.69
    //     var boundry2 = 0.31
    //     if(player.pos.y < 0) {
    //       if(offset.y > boundry1) direction.N = true
    //       if(offset.y < boundry2) direction.S = true
    //     } else {
    //       if(offset.y < boundry1) direction.N = true
    //       if(offset.y > boundry2) direction.S = true
    //     }
    //     if(player.pos.x < 0) {
    //       if(offset.x < boundry2) direction.E = true
    //       if(offset.x > boundry1) direction.W = true
    //     } else {
    //       if(offset.x > boundry1) direction.E = true
    //       if(offset.x < boundry2) direction.W = true
    //     }
    //     if(direction.N && direction.E) direction.NE = true
    //     if(direction.E && direction.S) direction.ES = true
    //     if(direction.S && direction.W) direction.SW = true
    //     if(direction.W && direction.N) direction.WN = true
    //     for(let name in direction) {
    //       switch(name) {
    //         case('W'):
    //           if(this.buildings[`${Math.round(player.pos.x)-1},${Math.floor(player.pos.y)}`] == undefined) direction.W = false
    //           else if(!this.buildings[`${Math.round(player.pos.x)-1},${Math.floor(player.pos.y)}`].collision) direction.W = false
    //         case('E'):
    //           if(this.buildings[`${Math.round(player.pos.x)},${Math.floor(player.pos.y)}`] == undefined) direction.E = false
    //           else if(!this.buildings[`${Math.round(player.pos.x)},${Math.floor(player.pos.y)}`].collision) direction.E = false
    //         case('N'):
    //           if(this.buildings[`${Math.floor(player.pos.x)},${Math.round(player.pos.y)-1}`] == undefined) direction.N = false
    //           else if(!this.buildings[`${Math.floor(player.pos.x)},${Math.round(player.pos.y)-1}`].collision) direction.N = false
    //         case('S'):
    //           if(this.buildings[`${Math.floor(player.pos.x)},${Math.round(player.pos.y)}`] == undefined) direction.S = false
    //           else if(!this.buildings[`${Math.floor(player.pos.x)},${Math.round(player.pos.y)}`].collision) direction.S = false
    //         case('NE'):
    //           if(this.buildings[`${Math.floor(player.pos.x)+1},${Math.floor(player.pos.y)-1}`] == undefined) direction.NE = false
    //           else if(!this.buildings[`${Math.floor(player.pos.x)+1},${Math.floor(player.pos.y)-1}`].collision) direction.NE = false
    //         case('ES'):
    //           if(this.buildings[`${Math.floor(player.pos.x)+1},${Math.floor(player.pos.y)+1}`] == undefined) direction.ES = false
    //           else if(!this.buildings[`${Math.floor(player.pos.x)+1},${Math.floor(player.pos.y)+1}`].collision) direction.ES = false
    //         case('SW'):
    //           if(this.buildings[`${Math.floor(player.pos.x)-1},${Math.floor(player.pos.y)+1}`] == undefined) direction.SW = false
    //           else if(!this.buildings[`${Math.floor(player.pos.x)-1},${Math.floor(player.pos.y)+1}`].collision) direction.SW = false
    //         case('WN'):
    //           if(this.buildings[`${Math.floor(player.pos.x)-1},${Math.floor(player.pos.y)-1}`] == undefined) direction.WN = false
    //           else if(!this.buildings[`${Math.floor(player.pos.x)-1},${Math.floor(player.pos.y)-1}`].collision) direction.WN = false
    //       }
    //     }
    //     // if on building
    //     if(this.buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)] != undefined) {
    //       direction.N = true
    //       if(this.buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)].type == 'landmine') direction.N = false
    //     }
    //     return direction
    // }
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