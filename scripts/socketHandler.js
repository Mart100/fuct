class SocketHandler {
    constructor(world) {
        this.world = world
    }
    addSocket(socket) {
        //init all the socket event
        socket.on('chatMessage', (data) => this.chatMessage(data, socket))
    }
    /**
     * handles a chatMessage
     * @param {Object} data The data containing the content, author etc
     */
    chatMessage(data) {
        this.world
    }
}

module.exports = SocketHandler