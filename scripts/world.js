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

        this.socketHandler.addSocket(socket)
        this.players[socket.id] = {
            id: socket.id,
            pos: {
                x: 0,
                y: 0
            }
        }

    }
    

}
module.exports = World