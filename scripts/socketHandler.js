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
        socket.on('BUY', data => this.playerBuy(data, socket))
        socket.on('disconnect', data => this.onDisconnect(data, socket))
        socket.on('ping', data => this.ping(data, socket))
        let world = this.world

        
    }
    ping(data, socket) {
        console.log('Ping received')
        socket.emit('pong', '') 
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
    playerBuy(data, socket) {
        let player = this.players[socket.id]
        let item = data.item
        let itemPrice = 0

        // get item price
        if(typeof shopPrices[item] == 'number') itemPrice = shopPrices[item]
        
        // if player doesnt have enough money. return
        if(player.coins < itemPrice) return socket.emit('alert', {id: socket.id, color: 'red', text: `You need ${itemPrice-player.coins}$ more for ${item}`})

        // remove price from players balance
        player.coins -= itemPrice 

        // give building / tool to player
        if(data.type == 'tool') player.hotbar.list[item].level++
        if(data.type == 'building') player.building.list[item].amount++
    }
    playerData(data, socket) {
        let player = this.players[socket.id]
        switch(data.type) {
            case('movement'): {
                player.moving[data.direction] = data.isDown
                break
            }
            case('damage'): {
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
                case('oof'): {
                    if(!player.admin) return socket.emit('alert', {color: 'red', text: 'You dont have access to that command!'})
                    for(let x=-50;x<50;x++) {
                        for(let y=-50;y<50;y++) {
                            this.buildings[x+','+y] = {
                                'type': 'barbedwire',
                                'owner': socket.id,
                                'pos': {
                                    'x': x,
                                    'y': y
                                },
                                'health': 1000,
                                'maxHealth': 100,
                                'collision': false,
                                'showhealth': 0
                            }
                        }
                    }
                }
            }
        } else this.broadcast('chat', data)
        
    }
    buildData(data, socket) {
        if(4 < this.getDistanceBetween({x: data.pos.x+0.5, y: data.pos.y+0.5}, this.players[socket.id].pos)) return
        let building = this.buildings[`${data.pos.x},${data.pos.y}`]
        let player = this.players[socket.id]
        let bPosX = data.pos.x
        let bPosY = data.pos.y
        switch(data.type) {
            case('add'): {
                // if player does not have building return
                if(player.building.list[data.typeBuilding].amount < 1) return socket.emit('alert', {id: socket.id, color: 'red', text: `You dont have enough of this building!`})
                //if building already exists return
                if(this.buildings[`${data.pos.x},${data.pos.y}`] != undefined && data.typeBuilding != 'bulldozer') return
                // create building template
                let building = {
                    'type': data.typeBuilding,
                    'owner': socket.id,
                    'pos': {
                    'x': data.pos.x,
                    'y': data.pos.y
                    },
                    'health': 100,
                    'maxHealth': 100,
                    'collision': true,
                    'showhealth': 0
                }
                // what type
                switch(data.typeBuilding) {
                    case('turret'): {
                        building.bullets = {}
                        building.bulletspeed = 2
                        building.bulletdamage = 5
                        building.reloadspeed = 50
                        building.range = 10
                        building.timer = 0
                        break
                    }
                    case('landmine'): {
                        building.collision = false
                        building.exploding = 0
                        break
                    }
                    case('core'): {
                        // check if player already has core
                        for(let id in this.buildings) {
                            // continue if building is not a core
                            if(this.buildings[id].type != 'core') continue
                            // continue if building is not for the player
                            if(this.buildings[id].owner != socket.id) continue
                            // else player already has core. so return
                            return socket.emit('alert', {id: socket.id, color: 'red', text: `You already placed your core!`})
                        }
                        socket.emit('alert', {color: 'white', text: `You placed your core!`})
                        break
                    }
                    case('wall'): {
                        building.sides = {N: false, E: false, S: false, W: false}

                        let bSides = building.sides

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
                    case('barbedwire'): {
                        building.collision = false                      
                        break
                    }
                    case('bulldozer'): {
                        this.buildData({pos: data.pos, type: 'remove'}, socket)
                        return
                        break
                    }
                    case('empty'): {
                        return
                        break
                    }
                }
                this.buildings[`${data.pos.x},${data.pos.y}`] = building
                player.building.list[building.type].amount--
                break;
            }
            case('remove'):
                if(building == undefined) return

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
                if(building.health <= 0) this.buildData({pos: building.pos, type: 'remove'}, socket)
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

const shopPrices = {
    sword: [50, 100, 500, 1000],
    pickaxe: [50, 100, 500, 1000],
    miner: 10,
    turret: 100,
    wall: 10,
    landmine: 10,
    barbedwire: 10
}