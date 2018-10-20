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
    addPlayer(socket) {
        //joins the room
        socket.join(this.id)

        socket.emit('buildings', this.buildings)
        this.socketHandler.addSocket(socket)
        this.players[socket.id] = {
            id: socket.id,
            pos: {
                x: 0,
                y: 0
            },
            admin: true,
            movement: 'none',
            building: {
              selected: 1
            },
            hotbar: {
                sword: 1,
                pickaxe: 1
            },
            buildmode: false,
            color: `rgb(${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)})`,
            health: 100,
            isDead: false
        }

    }
    

}
module.exports = World