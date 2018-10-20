class SocketHandler {
    constructor(world) {
        this.world = world
        this.sockets = []
    }
    addSocket(socket) {
        this.sockets.push(socket)
        //init all the socket event
        socket.on('chat', (data) => this.chatMessage(data, socket))
    }
    /**
     * handles a chatMessage
     * @param {Object} data The data containing the content, author etc
     */
    chatMessage(data, socket) {
        console.log(data.message.replace('::', '').split(' ')[0]+' -- '+data.message.replace('::', '').split(' '))
        // all commands
        if(data.message.startsWith('::')) {
        let args = data.message.replace('::', '').split(' ')
        switch(args[0]) {
            // commands everyone can access
            case('ping'):
                io.to(data.id).emit('alert', {color: 'white', text: data.text})
                break
            case('suicide'):
                players[data.id].died = true
                io.to(data.id).emit('alert', {color: 'white', text: 'Congratz you just suicided!'})
                break
            // commands only admins can use
            case('tp'):
                if(!players[data.id].admin) { io.to(data.id).emit('alert', {color: 'red', text: 'You dont have access to that command!'}); return }
                // Check if argument is a player
                for(id in players) {
                    if(players[id].username != args[1]) continue
                    players[data.id].pos.x = players[id].pos.x
                    players[data.id].pos.y = players[id].pos.y
                    return
                }
                // if no return. tp to positions
                players[data.id].pos.x = Number(args[1])+0.01
                players[data.id].pos.y = Number(args[2])+0.01
                break
            case('clearmap'):
                if(!players[data.id].admin) { io.to(data.id).emit('alert', {color: 'red', text: 'You dont have access to that command!'}); return }
                buildings = {}
                break
            case('kick'):
                if(!players[data.id].admin) { io.to(data.id).emit('alert', {color: 'red', text: 'You dont have access to that command!'}); return }
                for(id in players) if(players[id].username == args[1]) players[id].kick = true
                break
            case('vanish'):
                if(!players[data.id].admin) { io.to(data.id).emit('alert', {color: 'red', text: 'You dont have access to that command!'}); return }
                if(!players[data.id].vanish) players[data.id].vanish = true
                else players[data.id].vanish = false
                break
            case('kill'):
                if(!players[data.id].admin) { io.to(data.id).emit('alert', {color: 'red', text: 'You dont have access to that command!'}); return }
                for(id in players) if(players[id].username == args[0]) players[id].died = true
                break
            case('restart'):
                if(!players[data.id].admin) { io.to(data.id).emit('alert', {color: 'red', text: 'You dont have access to that command!'}); return }
                let a = just_crash_the_server_with_this_unkown_command
                console.log(a)
                break
            }
        } else this.broadcast('chat', data)
        
    }
    /**
     * Broadcasts to all the clients
     * @param {String} channel the channel of the socket (eg: chatMessage, move etc)
     * @param {Object} data The data that needs to be send over
     * @param {Object} socket The socket which will broadcast the message
     */
    broadcast(channel, data) {
        for(let socket of this.sockets) {
            socket.emit(channel, data)
        }
    }
}

module.exports = SocketHandler