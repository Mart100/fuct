const commands = {
	'suicide': {
		admin: false,
		code(SH, args, player, socket) {
			player.health = -1
			socket.emit('alert', {color: 'white', text: 'Congratz you just suicided!'})
		}
	},
	'discord': {
		admin: false,
		code(SH, args, player, socket) {
			socket.emit('chat', {id: 'Server', text: '<a href="https://discord.gg/YZahV2M">Discord Invite Link</a>'})
		}
	},
	'tp': {
		admin: true,
		code(SH, args, player, socket) {
			if(args[1] == 'random') {
				let target = SH.players[Math.round(Math.random()*SH.players.length)]
				player.pos.x = target.pos.x
				player.pos.y = target.pos.y
				return
			}
			for(let id in SH.players) {
				if(SH.players[id].username.toLowerCase() != args[1].toLowerCase()) continue
				player.pos.x = Number(SH.players[id].pos.x)
				player.pos.y = Number(SH.players[id].pos.y)
				return
			}
			// if no return. tp to positions
			player.pos.x = Number(args[1])+0.01
			player.pos.y = Number(args[2])+0.01
		}
	},
	'clearmap': {
		admin: true,
		code(SH, args, player, socket) {
			SH.buildings = {}
		}
	},
	'vanish': {
		admin: true,
		code(SH, args, player, socket) {
			if(!player.vanish) player.vanish = true
			else player.vanish = false
		}
	},
	'kill': {
		admin: true,
		code(SH, args, player, socket) {
			for(id in SH.players) if(SH.players[id].username == args[0]) SH.players[id].health = -1
		},
	},
	'speed': {
		admin: true,
		code() {
			player.speed = Number(args[1])
		}
	},
	'oof': {
		admin: true,
		code(SH, args, player, socket) {
			for(let x=-50;x<50;x++) {
				for(let y=-50;y<50;y++) {
					this.buildings[x+','+y] = {
						'type': 'barbedwire',
						'owner': socket.id,
						'pos': {
							'x': x,
							'y': y
						},
						'health': 1,
						'maxHealth': 1,
						'collision': false,
						'showhealth': 0
					}
				}
			}
		}
	},
	'help': {
		admin: false,
		code(SH, args, player, socket) {
			let text = `<br>
			<b>List of commands:</b> <br>
			<b>::discord</b> - (Sends discord invite link) <br>
			<b>::help</b> - (Sends this list) <br>
			<b>::suicide</b> - (Suicide)
			`
			console.log('test')
			socket.emit('chat', {id: 'Server', text: text})
		}
	}
}

module.exports = commands