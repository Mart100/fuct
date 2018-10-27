class SocketHandler {
    constructor(world) {
        this.world = world
        this.sockets = []
        this.buildings = world.buildings
        this.players = world.players
        
    }
    addSocket(socket) {
        this.sockets.push(socket)
        //init all the socket event
        socket.on('chat', (data) => this.chatMessage(data, socket))
        socket.on('PLAYER_DATA', data => this.playerData(data, socket))
        socket.on('BUILD_DATA', data => this.buildData(data, socket))
        socket.on('REQUEST_DESTROY_CORE', data => this.requestDestroyCore(data, socket))
        socket.on('disconnect', data => this.onDisconnect(data, socket))
        let world = this.world

        
    }
    sendData() {
        //console.log(this.world)
        this.broadcast('players', this.world.players)
        this.broadcast('buildings', this.world.buildings)
    }
    onDisconnect(data, socket) {
        // Remove buildings
        for(let name in this.buildings) {
            if(this.buildings[name].owner == socket.id) delete this.buildings[name]
        }
        // remove player
        delete this.players[socket.id]
    }
    requestDestroyCore(data, socket) {
        let player = this.players[socket.id]
        let building = data
        // if building is in range and not himself
        if(4 > Math.abs(Math.abs(player.pos.x)+Math.abs(player.pos.y)-Math.abs(building.pos.x)+Math.abs(building.pos.y)) && building.owner != socket.id) {
            socket.emit('alert', {id: player.id, color: 'green', text: `You destroyed ${this.players[building.owner].username}'s core!`})
            socket.emit('alert', {id: building.owner, color: 'red', text: `${player.username} destroyed your core!`})
            delete this.buildings[building.pos.x+','+building.pos.y]
        }
    }
    playerData(data, socket) {
        switch(data.type) {
            case('movement'):
                this.players[socket.id].moving[data.direction] = data.isDown
                break
            case('hotbar'):
                this.players[socket.id].hotbar = data.player
                break
            case('damagePlayer'):
                this.players[socket.id].health -= data.player
                break
            case('buildSelected'):
                this.players[socket.id].building.selected = data.selected
                break
            case('removeplayer'):
                delete players[socket.id]
                // Remove buildings
                for(name in buildings) if(buildings[name].owner == data.id) delete buildings[name]
                break
            default:
                if(data.type == 'admin') return
                players[data.id][data.type] = data.player
        }
    }
    chatMessage(data, socket) {
        console.log(data.message.replace('::', '').split(' ')[0]+' -- '+data.message.replace('::', '').split(' '))
        // all commands
        if(data.message.startsWith('::')) {
            let args = data.message.replace('::', '').split(' ')
            let player = this.world.players[socket.id]
            switch(args[0]) {
                // commands everyone can access
                case('ping'):
                    socket.emit('alert', {color: 'white', text: data.text})
                    break
                case('suicide'):
                    player.died = true
                    socket.emit('alert', {color: 'white', text: 'Congratz you just suicided!'})
                    break
                // commands only admins can use
                case('tp'):
                    if(!player.admin) return socket.emit('alert', {color: 'red', text: 'You dont have access to that command!'});
                    // Check if argument is a player
                    for(let id in players) {
                        if(player.username != args[1]) continue
                        player.pos.x = players[id].pos.x
                        player.pos.y = players[id].pos.y
                        return
                    }
                    // if no return. tp to positions
                    player.pos.x = Number(args[1])+0.01
                    player.pos.y = Number(args[2])+0.01
                    break
                case('clearmap'):
                    if(!player.admin) return socket.emit('alert', {color: 'red', text: 'You dont have access to that command!'}); 
                    buildings = {}
                    break
                case('kick'):
                    if(!player.admin) return socket.emit('alert', {color: 'red', text: 'You dont have access to that command!'}); 
                    for(id in players) if(players[id].username == args[1]) players[id].kick = true
                    break
                case('vanish'):
                    if(!player.admin) return socket.emit('alert', {color: 'red', text: 'You dont have access to that command!'}); 
                    if(!player.vanish) player.vanish = true
                    else player.vanish = false
                    break
                case('kill'):
                    if(!player.admin) return socket.emit('alert', {color: 'red', text: 'You dont have access to that command!'}); 
                    for(id in players) if(players[id].username == args[0]) players[id].died = true
                    break
                case('restart'):
                    if(!player.admin) return socket.emit('alert', {color: 'red', text: 'You dont have access to that command!'}); 
                    let a = just_crash_the_server_with_this_unkown_command
                    console.log(a)
                    break
            }
        } else this.broadcast('chat', data)
        
    }
    buildData(data, socket) {
        switch(data.type) {
            case('add'):
                this.buildings[data.id] = data.building
                switch(data.building.type) {
                    case('wall'):
                        let bPosX = data.building.pos.x
                        let bPosY = data.building.pos.y
                        this.buildings[`${data.building.pos.x},${data.building.pos.y}`].sides = {N: false, E: false, S: false, W: false}

                        let bSides = this.buildings[data.id].sides

                        if(this.buildings[(bPosX)+','+(bPosY+1)] != undefined && this.buildings[(bPosX)+','+(bPosY+1)].sides != undefined) {
                            bSides.S = true
                            this.buildings[(bPosX)+','+(bPosY+1)].sides.N = true
                        }
                        if(this.buildings[(bPosX+1)+','+(bPosY)] != undefined && this.buildings[(bPosX+1)+','+(bPosY)].sides != undefined) {
                            bSides.E = true
                            this.buildings[(bPosX+1)+','+(bPosY)].sides.W = true
                        }
                        if(this.buildings[(bPosX)+','+(bPosY-1)] != undefined && this.buildings[(bPosX)+','+(bPosY-1)].sides != undefined) {
                            bSides.N = true
                            this.buildings[(bPosX)+','+(bPosY-1)].sides.S = true
                        }
                        if(this.buildings[(bPosX-1)+','+(bPosY)] != undefined && this.buildings[(bPosX-1)+','+(bPosY)].sides != undefined) {
                            bSides.W = true
                            this.buildings[(bPosX-1)+','+(bPosY)].sides.E = true
                        }
                        break
                }
                break
            case('remove'):
                let building = buildings[data.id]
                // other stuff depends on building
                switch(building.type) {
                    case('wall'):
                    if(buildings[`${building.pos.x-1},${building.pos.y}`] != undefined) buildings[`${building.pos.x-1},${building.pos.y}`].sides.E = false
                    if(buildings[`${building.pos.x+1},${building.pos.y}`] != undefined) buildings[`${building.pos.x+1},${building.pos.y}`].sides.W = false
                    if(buildings[`${building.pos.x},${building.pos.y-1}`] != undefined) buildings[`${building.pos.x},${building.pos.y-1}`].sides.S = false
                    if(buildings[`${building.pos.x},${building.pos.y+1}`] != undefined) buildings[`${building.pos.x},${building.pos.y+1}`].sides.N = false
                    break
                }
                // then delete building
                delete buildings[data.id]
                break
            case('damage'):
                // if undefined building. return
                if(buildings[data.id] == undefined) return
                buildings[data.id].health -= data.data
                // show health of building
                buildings[data.id].showhealth = 10
                break
            default:
            console.log('received unkown type request via socket "buildings": '+data.type+' data: '+data.data+' for building: '+data.id)
        }
    }
    broadcast(channel, data) {
        for(let socket of this.sockets) {
            socket.emit(channel, data)
        }
    }
}
module.exports = SocketHandler