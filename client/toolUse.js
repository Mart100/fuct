$(() => {
    $('#canvas').on('click', function(event) {
        let mousePos = {x: event.pageX, y: event.pageY}
        let tool

        // if building return
        if(player.buildmode) return
        // get tool
        for(item in player.hotbar.list) if(player.hotbar.list[item].slot == player.hotbar.selected) tool = item

        switch(tool) {
            case('sword'): {
                // get target player
                let target = 'none'
                for(let num in players) {
                    if(players[num].id == player.id) continue
                    if(player.zoom/2.5 < getDistanceBetween(mousePos, players[num].pos)) {
                        console.log(getDistanceBetween(mousePos, players[num].pos))
                        target = players[num]
                    }
                }

                // if out of range Return
                if(player.hotbar.list[tool].range < getDistanceBetween(player.pos, target.pos)) return

                // damage player
                if(target != 'none') socket.emit('PLAYER_DATA', {target: target.id, type: 'damage'})

                break
            }
            case('pickaxe'): {
                let pos = {
                    x: player.pos.x+player.selectedGrid.x,
                    y: player.pos.y+player.selectedGrid.y
                }
                if(pos.x > 0) pos.x = Math.floor(pos.x)
                else pos.x = Math.ceil(pos.x)
                if(pos.y > 0) pos.y = Math.floor(pos.y)
                else pos.y = Math.ceil(pos.y)

                let building = buildings[pos.x+','+pos.y]
                // if theres no building at cursor return
                if(building == undefined) return
                // if its too far away return
                if(4 < getDistanceBetween({x: player.selectedGrid.x+0.5-player.offset.x(), y: player.selectedGrid.y+0.5-player.offset.y()}, {x: 0, y: 0})) return

                // damage building
                socket.emit('BUILD_DATA', { pos: pos, type: 'damage'})
                break
            }
        }
    })
})