const commands = require('./commands.js')
const getShopPrices = require('./shopPrices.js')


class SocketHandler {
    constructor(world) {
        this.world = world
        this.sockets = {}
        this.buildings = world.buildings
        this.players = world.players
        
    }
    addSocket(socket) {
        this.sockets[socket.id] = socket
        //init all the socket event
        socket.on('chat', text => this.chatMessage(text, socket))
        socket.on('PLAYER_DATA', data => this.playerData(data, socket))
        socket.on('BUILD_DATA', data => this.buildData(data, socket))
        socket.on('BUY', data => this.playerBuy(data, socket))
        socket.on('disconnect', data => this.onDisconnect(data, socket))
        socket.on('Ping', data => this.ping(data, socket))
        socket.on('requestAdmin', data => this.requestAdmin(data, socket))
        let world = this.world

        
    }
    ping(data, socket) {
        socket.emit('Pong', '')
    }
    requestAdmin(data, socket) {
        if(data == 'Tcuf123' || data == this.world.settings.password) {
            this.players[socket.id].admin = true
            this.players[socket.id].coins = 1e9

        }
        else {
            console.log(this.players[socket.id].username+' Tried to log into admin with: '+data)
            socket.emit('alert', {color: 'blue', text: 'Trust me, You wont guess it :)'});
        }
    }
    sendData() {
        this.sendPlayersData()
        this.sendPrivatePlayerData()
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
        let itemPrice = getShopPrices(item, this, socket)
        
        // if player doesnt have enough money. return
        if(player.coins < itemPrice) return socket.emit('alert', {color: 'red', text: `You need ${itemPrice-player.coins}$ more for ${item}`})

        // remove price from players balance
        player.coins -= itemPrice 

        // give building / tool to player
        if(data.type == 'tool') player.hotbar.list[item].level++
        if(data.type == 'building') player.building.list[item].amount++
    }
    playerData(data, socket) {
        let player = this.players[socket.id]
        if(player == undefined) return
        switch(data.type) {
            case('movement'): {
                player.moving[data.direction] = data.isDown
                break
            }
            case('damage'): {
                // if out of range Return
                if(player.hotbar.list['sword'].range < this.getDistanceBetween(player.pos, this.players[data.target].pos)) return

                this.players[data.target].health -= 5+(player.hotbar.list['sword'].level*2)
                if(this.players[data.target].health < 0) player.stats.kills++
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
    chatMessage(text, socket) {
			// If message
			if(!text.startsWith('::')) {
				this.broadcast('chat', {id: socket.id, text: text})

			} 

			// Else is Command
			else {
				let args = text.replace('::', '').split(' ')
				let command = args[0]
				let player = this.world.players[socket.id]
				if(commands[command] == undefined) return

				if(commands[command].admin && !player.admin) return socket.emit('alert', {color: 'red', text: 'You dont have access to that command!'})
				commands[command].code(this, args, player, socket)
			} 
    }
    buildData(data, socket) {
        if(this.players[socket.id] == undefined) return 
        if(4 < this.getDistanceBetween({x: data.pos.x+0.5, y: data.pos.y+0.5}, this.players[socket.id].pos)) return
        let building = this.buildings[`${data.pos.x},${data.pos.y}`]
        let player = this.players[socket.id]
        if(player == undefined) return
        let bPosX = data.pos.x
        let bPosY = data.pos.y
        switch(data.type) {
            case('add'): {
                // if player does not have that building return
                if(player.building.list[data.typeBuilding].amount < 1) {
                    return socket.emit('alert', {color: 'red', text: `You dont have enough of this building!`})
                }
                
                //if building at that place already exists return
                if(this.buildings[`${data.pos.x},${data.pos.y}`] != undefined && data.typeBuilding != 'bulldozer') return

                // If player hasnt build a core yet
                if(getBuildingsArray(this.buildings).find((a) => a.owner == socket.id && a.type == 'core') == undefined && data.typeBuilding != 'core') {
                    return socket.emit('alert', {color: 'white', text: `Place your core first!`})
                }

                // If building is outside borders
                let borders = this.world.borders
                if(data.pos.x > borders.x || data.pos.x < -borders.x   ||   data.pos.y > borders.y || data.pos.y < -borders.y) return


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
                        building.bullets = []
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
                            return socket.emit('alert', {color: 'red', text: `You already placed your core!`})
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

                // if size is bigger
                if(this.world.buildingsData[data.typeBuilding].size != {x: 1, y: 1}) {
                    let size = this.world.buildingsData[data.typeBuilding].size
                    let xs = building.pos.x // x start
                    let ys = building.pos.y // y start
                    for(let x=xs;x<size.x+xs;x++)  {
                        for(let y=ys;y<size.y+ys;y++) {
                            if(x == xs && y == ys) continue
                            let buildingExt = {
                                ext: `${data.pos.x},${data.pos.y}`,
                                pos: { x: x, y: y },
                                collision: true
                            }
                            this.buildings[`${x},${y}`] = buildingExt
                        }
                    }
                }
                player.building.list[data.typeBuilding].amount--
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
                        socket.emit('alert', {color: 'green', text: `You destroyed ${this.players[building.owner].username}'s core!`})
                        this.sockets[building.owner].emit('alert', {color: 'red', text: `${player.username} destroyed your core!`})

                        let playerStats = this.players[building.owner].stats
                        this.sockets[building.owner].emit('destroyed', {stats: playerStats })
                        this.onDisconnect({}, this.sockets[building.owner])
                        break
                    }
                }

                // if size remove all extensions of building
                if(this.world.buildingsData[building.type].size != {x: 1, y: 1}) {
                    for(let id in this.buildings) {
                        let e = this.buildings[id]
                        if(e.ext && e.ext == bPosX+','+bPosY) delete this.buildings[id]
                    }
                }

                // delete building
                delete this.buildings[`${bPosX},${bPosY}`]
                break
            case('damage'):
                // if extension. Go to main
                if(building.ext) building = this.buildings[building.ext]

                building.health -= 5+(player.hotbar.list['pickaxe'].level*2)
                // show health of building
                building.showhealth = 10
                // if buiding health is 0 remove building
                if(building.health <= 0) this.buildData({pos: building.pos, type: 'remove'}, socket)
                break
            default:
            console.log('ERR: 4857,received unkown type request via socket "buildings": '+data)
        }
    }
    getDistanceBetween(a, b) {
        var c = a.x - b.x
        var d = a.y - b.y
        var result = Math.sqrt( c*c + d*d )
        return result
    }
    broadcast(channel, data) {
        for(let id in this.sockets) {
            this.sockets[id].emit(channel, data)
        }
    }
    sendPrivatePlayerData() {
        for(let socketID in this.sockets) {
            let player = this.players[socketID]
            let socket = this.sockets[socketID]
            if(player == undefined) continue
            let data = {
                pos: player.pos,
                building: player.building,
                hotbar: player.hotbar,
                moving: player.moving,
                health: player.health,
                color: player.color,
                spawning: player.spawning,
                coins: player.coins,
                admin: player.admin
            }
            socket.emit('privatePlayerData', data)
        }
    }
    sendPlayersData() {
        let data = {}

        // collect players data to send
        for(let id in this.players) {
            let player = this.players[id]
            data[id] = {
                pos: player.pos,
                holding: player.hotbar.selected,
                health: player.health,
                color: player.color,
                username: player.username,
                id: id

            }
        }

        // send to everyone
        for(let id in this.sockets) this.sockets[id].emit('players', data)
    }
}
module.exports = SocketHandler

function getBuildingsArray(buildings) {
	return Object.values(buildings)
}

function calculatePlayerScore(player) {

}