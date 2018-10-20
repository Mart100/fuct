const tick = require('./tick.js')
const SocketHandler = require('./SocketHandler.js')

class World {
    constructor(id) {
        this.id = id
        this.players = []
        this.socketHandler = new SocketHandler(this)
    }
    tick() {
        tick()
    }
    addPlayer(socket) {
        //joins the room
        socket.join(this.id)

        this.socketHandler.addSocket(socket)
        this.players.push({
            id: socket.id,
            pos: {
                x: 0,
                y: 0
            }
        })

    }
    /**
     * 
     * @param {String} channel the channel of the socket (eg: chatMessage, move etc)
     * @param {Object} data The data that needs to be send over
     * @param {Object} socket The socket which will broadcast the message
     */
    broadcast(channel, data, socket) {
        
    }

}
module.exports = World