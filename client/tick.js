function tick() {
    // if player died
    if(player.isDead) {
        // spawn back in 5 seconds
        setTimeout(() => {
            // remove death
            player.health = 100
            player.isDead = false
        }, 5000)
    }

    updateDebug()

    // If mouse is down
    if(Game.mousedown) {
        // Position mouse is on
        mouseX = Math.floor(player.pos.x + player.selectedGrid.x)
        mouseY = Math.floor(player.pos.y + player.selectedGrid.y)
        //console.log(mouseX+' -- '+mouseY)
        // If mouse is on building
        if(buildings[mouseX+','+mouseY] != undefined) {
            // if mouse is on core
            if(buildings[mouseX+','+mouseY].type == 'core') {
                // if building is in range and not himself
                if(10 > Math.abs(Math.abs(Math.abs(player.pos.x)-Math.abs(mouseX))-Math.abs(Math.abs(player.pos.x)-Math.abs(mouseX)))
                && buildings[mouseX+','+mouseY].owner != socket.id) {
                    let building = buildings[mouseX+','+mouseY]
                    socket.emit('alert', {id: player.id, color: 'green', text: `You destroyed ${players[building.owner].username}'s core!`})
                    socket.emit('alert', {id: building.owner, color: 'red', text: `${player.username} destroyed your core!`})
                    socket.emit('players', { id: building.owner, type: 'died', player: true})
                    delete building
                }
            }
        }
    }
}
