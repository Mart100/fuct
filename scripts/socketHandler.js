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
    playerData(data, socket) {
        let player = this.players[socket.id]
        switch(data.type) {
            case('movement'): {
                player.moving[data.direction] = data.isDown
                break
            }
            case('damage'): {
                console.log('yeet')
                // if out of range Return
                if(player.hotbar.list['sword'].range < this.getDistanceBetween(player.pos, this.players[data.target].pos)) return

                this.players[data.target].health -= 5+(player.hotbar.list['sword'].level*2)
                break
            }
            case('buildSelected'): {
                player.building.selected = data.selected
                break
            }
            case('hotbarSelected'): {
                player.hotbar.selected = data.selected
                break
            }
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
                    player.health = -1
                    socket.emit('alert', {color: 'white', text: 'Congratz you just suicided!'})
                    break
                // commands only admins can use
                case('tp'):
                    if(!player.admin) return socket.emit('alert', {color: 'red', text: 'You dont have access to that command!'});
                    // Check if argument is a player
                    if(args[1] == 'random') {
                        let target = this.players[0]
                        player.pos.x = target.pos.x
                        player.pos.y = target.pos.y
                        return
                    }
                    for(let id in this.players) {
                        if(this.players[id].username != args[1]) continue
                        player.pos.x = Number(this.players[id].pos.x)
                        player.pos.y = Number(this.players[id].pos.y)
                        return
                    }
                    // if no return. tp to positions
                    player.pos.x = Number(args[1])+0.01
                    player.pos.y = Number(args[2])+0.01
                    break
                case('clearmap'):
                    if(!player.admin) return socket.emit('alert', {color: 'red', text: 'You dont have access to that command!'}); 
                    this.buildings = {}
                    break
                case('kick'):
                    if(!player.admin) return socket.emit('alert', {color: 'red', text: 'You dont have access to that command!'}); 
                    break
                case('vanish'):
                    if(!player.admin) return socket.emit('alert', {color: 'red', text: 'You dont have access to that command!'}); 
                    if(!player.vanish) player.vanish = true
                    else player.vanish = false
                    break
                case('kill'):
                    if(!player.admin) return socket.emit('alert', {color: 'red', text: 'You dont have access to that command!'}); 
                    for(id in players) if(players[id].username == args[0]) players[id].health = -1
                    break
                case('crash'):
                    if(!player.admin) return socket.emit('alert', {color: 'red', text: 'You dont have access to that command!'}); 
                    let a = just_crash_the_server_with_this_unkown_command
                    console.log(a)
                    break
                case('speed'):
                    if(!player.admin) return socket.emit('alert', {color: 'red', text: 'You dont have access to that command!'})
                    player.speed = Number(args[1])
                    break

            }
        } else this.broadcast('chat', data)
        
    }
    buildData(data, socket) {
        if(4 < this.getDistanceBetween({x: data.building.pos.x+0.5, y: data.building.pos.y+0.5}, this.players[socket.id].pos)) return
        let building = this.buildings[`${data.building.pos.x},${data.building.pos.y}`]
        let player = this.players[socket.id]
        switch(data.type) {
            case('add'): {
                //if building already exists return
                if(this.buildings[data.id] != undefined) return
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
                        break;
                }
                break;
            }
            case('remove'):
                if(building == undefined) return

                let bPosX = data.building.pos.x
                let bPosY = data.building.pos.y
                // other stuff depends on building
                switch(building.type) {
                    case('wall'): {
                        if(this.buildings[`${bPosX-1},${bPosY}`] != undefined && this.buildings[`${bPosX-1},${bPosY}`].sides != undefined) this.buildings[`${bPosX-1},${bPosY}`].sides.E = false
                        if(this.buildings[`${bPosX+1},${bPosY}`] != undefined && this.buildings[`${bPosX+1},${bPosY}`].sides != undefined) this.buildings[`${bPosX+1},${bPosY}`].sides.W = false
                        if(this.buildings[`${bPosX},${bPosY-1}`] != undefined && this.buildings[`${bPosX},${bPosY-1}`].sides != undefined) this.buildings[`${bPosX},${bPosY-1}`].sides.S = false
                        if(this.buildings[`${bPosX},${bPosY+1}`] != undefined && this.buildings[`${bPosX},${bPosY+1}`].sides != undefined) this.buildings[`${bPosX},${bPosY+1}`].sides.N = false
                        break
                    }
                    case('core'): {
                        socket.emit('alert', {id: player.id, color: 'green', text: `You destroyed ${this.players[building.owner].username}'s core!`})
                        socket.emit('alert', {id: building.owner, color: 'red', text: `${player.username} destroyed your core!`})
                        break
                    }
                }
                // then delete building
                delete this.buildings[`${bPosX},${bPosY}`]
                break
            case('damage'):
                // if undefined building. return
                if(building == undefined) return
                building.health -= 5+(player.hotbar.list['pickaxe'].level*2)
                // show health of building
                building.showhealth = 10
                // if buiding health is 0 remove building
                if(building.health <= 0) this.buildData({building: building, type: 'remove'}, socket)
                break
            default:
            console.log('received unkown type request via socket "buildings": '+data.type+' data: '+data.data+' for building: '+data.id)
        }
    }
    getDistanceBetween(a, b) {
        var c = a.x - b.x
        var d = a.y - b.y
        var result = Math.sqrt( c*c + d*d )
        return result
    }
    broadcast(channel, data) {
          for(let socket of this.sockets) {
            socket.emit(channel, data)
        }
    }
}
module.exports = SocketHandler