const tick = require('./tick.js')
const SocketHandler = require('./SocketHandler.js')

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
        building: {
          selected: 1,
          list: ['core', 'miner', 'turreticon', 'landmine', 'wall', 'spongebob', 'spongebob', 'spongebob', 'spongebob', 'bulldozer'],
        },
        hotbar: {
            sword: 1,
            pickaxe: 1
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
    buildingCollision(player) {

      let radius = 0.9/2
      let allowedDirections = {
        N: true,
        S: true,
        W: true,
        E: true
      }
      for(let i in this.buildings) {
        let building = this.buildings[i]
        //Find the vertical & horizontal (distX/distY) distances between the circle’s center and the rectangle’s center
        let distX = Math.abs(player.pos.x - building.x+0.5)
        let distY = Math.abs(player.pos.y - building.y+0.5)

      }
      return allowedDirections

    }
    

}
module.exports = World