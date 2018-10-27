async function frame() {
    requestAnimationFrame(frame)
    if(player == undefined) return
    framecount++

    // set canvas to screen
    if(canvas.width != window.innerWidth) canvas.width = window.innerWidth
    if(canvas.height != window.innerHeight) canvas.height = window.innerHeight

    // Clear Screen
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // draw
    draw.grid()
    draw.otherPlayers()
    draw.inhand()
    draw.objects()
    // If player is in buildmode
    if(player.buildmode) draw.selectedGrid()
  }

const draw = {
  grid() {
    let gridWidthLines = 100
    let gridHeightLines = 100
    ctx.beginPath()
    ctx.strokeStyle = "#6d6d6d"
    ctx.lineWidth = 1
    let offX = player.offset.x()
    let offY = player.offset.y()
    let zoom = player.zoom

    for (let i = -Math.round(canvas.width/zoom/2); i <= Math.round(canvas.width/zoom/2); i++) { // lines on Y
        ctx.moveTo(canvas.width/2 + i*zoom - offX*zoom, 0)
        ctx.lineTo(canvas.width/2 + i*zoom - offX*zoom, canvas.height)
    }
    for (let i = -Math.round(canvas.height/zoom/2); i <= Math.round(canvas.height/zoom/2); i++) { // lines on X  
        ctx.moveTo(0           , canvas.height/2 + i*zoom - offY*zoom)
        ctx.lineTo(canvas.width, canvas.height/2 + i*zoom - offY*zoom)
    }
    ctx.stroke()
  },
  objects() {
    for(buildingname in buildings) {
      let building = buildings[buildingname]
      if(players[building.owner] == undefined) continue
      switch(building.type) {  
          case('turreticon'):
            ctx.beginPath()
            ctx.fillStyle = players[building.owner].color
            ctx.rect(canvas.width/2 + (building.pos.x-player.pos.x)*player.zoom, canvas.height/2 + (building.pos.y-player.pos.y)*player.zoom, player.zoom, player.zoom)
            ctx.fill()
            ctx.drawImage(images['turretbase'], canvas.width/2 + (building.pos.x-player.pos.x)*player.zoom, canvas.height/2 + (building.pos.y-player.pos.y)*player.zoom, player.zoom, player.zoom)
            // get closest player
            let closestplayer = { x: 9999, y: 9999 }
            for(id in players) {
              if(id == building.owner) continue
              // check if player is in range
              if(Math.abs(players[id].pos.x - building.pos.x+0.5)+Math.abs(players[id].pos.y - building.pos.y+0.5) > building.range) continue
              if(Math.abs(closestplayer.x - building.pos.x)+Math.abs(closestplayer.y - building.pos.y) >  Math.abs(players[id].pos.x - building.pos.x)+Math.abs(players[id].pos.y - building.pos.y)) {
                closestplayer = { x: players[id].pos.x, y: players[id].pos.y }
              }
            }
            // calculate angle
            let angle = Math.atan2(closestplayer.y - building.pos.y, closestplayer.x - building.pos.x) * 180 / Math.PI
            // if  no target look up
            if(closestplayer.x == 9999) angle = -90
            ctx.save()
            ctx.translate(canvas.width/2 + (building.pos.x-player.pos.x)*player.zoom+player.zoom/2, canvas.height/2 + (building.pos.y-player.pos.y)*player.zoom+player.zoom/2);
            ctx.rotate(angle*Math.PI/180);
            ctx.drawImage(images['turret'], -player.zoom/2, -player.zoom/2, player.zoom, player.zoom)
            ctx.restore()
            // draw bullets
            for(let num in building.bullets) {
              let bullet = building.bullets[num]
              ctx.beginPath()
              ctx.fillStyle = players[building.owner].color
              ctx.arc(canvas.width/2 + (bullet.pos.x-player.pos.x)*player.zoom, canvas.height/2 + (bullet.pos.y-player.pos.y)*player.zoom, player.zoom/5, 0, 2*Math.PI)
              ctx.fill()
            }
            break
          case('landmine'):
            // draw explosion
            if(building.exploding >= 1) {
              console.log(building.exploding)
              ctx.drawImage(images.explosion[Math.floor(building.exploding)], canvas.width/2 + (building.pos.x-player.pos.x)*player.zoom-player.zoom, canvas.height/2 + (building.pos.y-player.pos.y)*player.zoom-player.zoom, player.zoom*3, player.zoom*3)
              break
            }
            if(building.owner != player.id) break
            ctx.beginPath()
            ctx.drawImage(images[building.type], canvas.width/2 + (building.pos.x-player.pos.x)*player.zoom, canvas.height/2 + (building.pos.y-player.pos.y)*player.zoom, player.zoom, player.zoom)
            break
          case('wall'):
            let sidescount = 0
            let turn = 0
            for(side in building.sides) if(building.sides[side]) sidescount++
            // begin drawing
            ctx.beginPath()
            ctx.fillStyle = players[building.owner].color
            switch(sidescount.toString()) {
              case('0'):
                // draw color
                ctx.rect(canvas.width/2 + (building.pos.x-player.pos.x)*player.zoom, canvas.height/2 + (building.pos.y-player.pos.y)*player.zoom, player.zoom, player.zoom)
                ctx.fill()
                // draw shape
                ctx.save()
                ctx.translate(canvas.width/2 + (building.pos.x-player.pos.x)*player.zoom+player.zoom/2, canvas.height/2 + (building.pos.y-player.pos.y)*player.zoom+player.zoom/2)
                ctx.rotate(0*Math.PI/180)
                ctx.drawImage(images.walls['sides0'], -player.zoom/2, -player.zoom/2, player.zoom, player.zoom)
                ctx.restore()
                break
              case('1'):
                if(building.sides.N) turn = 0
                if(building.sides.E) turn = 90
                if(building.sides.S) turn = 180
                if(building.sides.W) turn = 270
                // draw color
                ctx.rect(canvas.width/2 + (building.pos.x-player.pos.x)*player.zoom, canvas.height/2 + (building.pos.y-player.pos.y)*player.zoom, player.zoom, player.zoom)
                ctx.fill()
                // draw shape
                ctx.save()
                ctx.translate(canvas.width/2 + (building.pos.x-player.pos.x)*player.zoom+player.zoom/2, canvas.height/2 + (building.pos.y-player.pos.y)*player.zoom+player.zoom/2)
                ctx.rotate(turn*Math.PI/180)
                ctx.drawImage(images.walls['sides1'], -player.zoom/2, -player.zoom/2, player.zoom, player.zoom)
                ctx.restore()
                break
              case('2'):
                // paralel
                if((building.sides.N && building.sides.S) || (building.sides.E && building.sides.W)) {
                  // turning
                  if(building.sides.N && building.sides.S) turn = 0
                  if(building.sides.E && building.sides.W) turn = 90
                  // draw color
                  ctx.rect(canvas.width/2 + (building.pos.x-player.pos.x)*player.zoom, canvas.height/2 + (building.pos.y-player.pos.y)*player.zoom, player.zoom, player.zoom)
                  ctx.fill()
                  // draw shape
                  ctx.save()
                  ctx.translate(canvas.width/2 + (building.pos.x-player.pos.x)*player.zoom+player.zoom/2, canvas.height/2 + (building.pos.y-player.pos.y)*player.zoom+player.zoom/2)
                  ctx.rotate(turn*Math.PI/180)
                  ctx.drawImage(images.walls['sides2hor'], -player.zoom/2, -player.zoom/2, player.zoom, player.zoom)
                  ctx.restore()
                }
                // else corner
                else {
                  // turning
                  if(building.sides.N && building.sides.E) turn = 90
                  if(building.sides.E && building.sides.S) turn = 180
                  if(building.sides.S && building.sides.W) turn = 270
                  if(building.sides.W && building.sides.N) turn = 0
                  // draw color
                  ctx.rect(canvas.width/2 + (building.pos.x-player.pos.x)*player.zoom, canvas.height/2 + (building.pos.y-player.pos.y)*player.zoom, player.zoom, player.zoom)
                  ctx.fill()
                  // draw shape
                  ctx.save()
                  ctx.translate(canvas.width/2 + (building.pos.x-player.pos.x)*player.zoom+player.zoom/2, canvas.height/2 + (building.pos.y-player.pos.y)*player.zoom+player.zoom/2)
                  ctx.rotate(turn*Math.PI/180)
                  ctx.drawImage(images.walls['sides2cor'], -player.zoom/2, -player.zoom/2, player.zoom, player.zoom)
                  ctx.restore()
                }
                break
              case('3'):
                // turning
                if(!building.sides.N) turn = 180
                if(!building.sides.E) turn = 270
                if(!building.sides.S) turn = 0
                if(!building.sides.W) turn = 90
                // draw color
                ctx.rect(canvas.width/2 + (building.pos.x-player.pos.x)*player.zoom, canvas.height/2 + (building.pos.y-player.pos.y)*player.zoom, player.zoom, player.zoom)
                ctx.fill()
                // draw shape
                ctx.save()
                ctx.translate(canvas.width/2 + (building.pos.x-player.pos.x)*player.zoom+player.zoom/2, canvas.height/2 + (building.pos.y-player.pos.y)*player.zoom+player.zoom/2)
                ctx.rotate(turn*Math.PI/180)
                ctx.drawImage(images.walls['sides3'], -player.zoom/2, -player.zoom/2, player.zoom, player.zoom)
                ctx.restore()
                break
              case('4'):
              // draw color
              ctx.rect(canvas.width/2 + (building.pos.x-player.pos.x)*player.zoom, canvas.height/2 + (building.pos.y-player.pos.y)*player.zoom, player.zoom, player.zoom)
              ctx.fill()
              break
            }

            break
          default:
            ctx.beginPath()
            ctx.fillStyle = players[building.owner].color
            ctx.rect(canvas.width/2 + (building.pos.x-player.pos.x)*player.zoom, canvas.height/2 + (building.pos.y-player.pos.y)*player.zoom, player.zoom, player.zoom)
            ctx.fill()
            ctx.drawImage(images[building.type], canvas.width/2 + (building.pos.x-player.pos.x)*player.zoom, canvas.height/2 + (building.pos.y-player.pos.y)*player.zoom, player.zoom, player.zoom)
      }
    }
    // after buildings are drawn. draw healthbar
    for(let id in buildings) {
      let building = buildings[id]
      // if has to show healthbar
      if(building.showhealth > 0) {
        // draw healthBar
        // draw progress
        ctx.beginPath()
        ctx.fillStyle = "#49ad40"
        ctx.rect(canvas.width/2 +(building.pos.x+0.5-player.pos.x)*player.zoom - player.zoom/1.5, canvas.height/2 + (building.pos.y+0.5-player.pos.y)*player.zoom - player.zoom/1.5, building.health * player.zoom / 75, player.zoom / 6)
        ctx.fill()
        // draw bar around
        let playerpos = { x: canvas.width/2+(building.pos.x+0.5-player.pos.x)*player.zoom, y: canvas.height/2+(building.pos.y+0.5-player.pos.y)*player.zoom }
        ctx.beginPath()
        ctx.strokeStyle = "#383838"
        ctx.lineWidth = player.zoom/20;
        ctx.moveTo(playerpos.x, playerpos.y-player.zoom/1.5)
        ctx.arcTo(playerpos.x+player.zoom/1.5, playerpos.y-player.zoom/1.5, playerpos.x+player.zoom/1.5, playerpos.y-player.zoom/2  , player.zoom/20)
        ctx.arcTo(playerpos.x+player.zoom/1.5, playerpos.y-player.zoom/2  , playerpos.x                , playerpos.y-player.zoom/2  , player.zoom/20)
        ctx.arcTo(playerpos.x-player.zoom/1.5, playerpos.y-player.zoom/2  , playerpos.x-player.zoom/1.5, playerpos.y-player.zoom/1.5, player.zoom/20)
        ctx.arcTo(playerpos.x-player.zoom/1.5, playerpos.y-player.zoom/1.5, playerpos.x                , playerpos.y-player.zoom/1.5, player.zoom/20)
        ctx.lineTo(playerpos.x, playerpos.y-player.zoom/1.5)
        ctx.stroke()
      }
    }
  },
  otherPlayers() {
    for(let id in players) {
      let username = players[id].username
      ctx.beginPath()
      ctx.fillStyle = players[id].color
      ctx.lineWidth = player.zoom / 10
      ctx.strokeStyle = "#383838"
      ctx.arc(canvas.width/2 + (players[id].pos.x-player.pos.x)*player.zoom, canvas.height/2 + (players[id].pos.y-player.pos.y)*player.zoom, player.zoom/2.5, 0, 2*Math.PI)
      ctx.fill()
      ctx.stroke()
      // draw name
      ctx.beginPath()
      ctx.font = ( 10 + player.zoom/2) + "px Arial";
      ctx.textAlign = "center"
      ctx.fillStyle = "#e2e2e2" //#5cd1a6
      ctx.strokeStyle = "#e2e2e2"
      ctx.fillText(username, canvas.width/2 + (players[id].pos.x-player.pos.x)*player.zoom, canvas.height/2 + (players[id].pos.y-player.pos.y)*player.zoom + player.zoom);
      ctx.stroke()
      // draw healthBar
      // draw progress
      ctx.beginPath()
      ctx.fillStyle = "#49ad40"
      ctx.rect(canvas.width/2 +(players[id].pos.x-player.pos.x)*player.zoom - player.zoom/1.5, canvas.height/2 + (players[id].pos.y-player.pos.y)*player.zoom - player.zoom/1.5, players[id].health * player.zoom / 75, player.zoom / 6)
      ctx.fill()
      // draw bar around
      let playerpos = { x: canvas.width/2+(players[id].pos.x-player.pos.x)*player.zoom, y: canvas.height/2+(players[id].pos.y-player.pos.y)*player.zoom }
      ctx.beginPath()
      ctx.strokeStyle = "#383838"
      ctx.lineWidth = player.zoom/20;
      ctx.moveTo(playerpos.x, playerpos.y-player.zoom/1.5)
      ctx.arcTo(playerpos.x+player.zoom/1.5, playerpos.y-player.zoom/1.5, playerpos.x+player.zoom/1.5, playerpos.y-player.zoom/2  , player.zoom/20)
      ctx.arcTo(playerpos.x+player.zoom/1.5, playerpos.y-player.zoom/2  , playerpos.x                , playerpos.y-player.zoom/2  , player.zoom/20)
      ctx.arcTo(playerpos.x-player.zoom/1.5, playerpos.y-player.zoom/2  , playerpos.x-player.zoom/1.5, playerpos.y-player.zoom/1.5, player.zoom/20)
      ctx.arcTo(playerpos.x-player.zoom/1.5, playerpos.y-player.zoom/1.5, playerpos.x                , playerpos.y-player.zoom/1.5, player.zoom/20)
      ctx.lineTo(playerpos.x, playerpos.y-player.zoom/1.5)
      ctx.stroke()
    }
  },
  selectedGrid() {
    ctx.beginPath()
    ctx.lineWidth = 10
    if(buildings[`${player.selectedGrid.x+Number(player.pos.x.toString().split('.')[0])},${player.selectedGrid.y+Number(player.pos.y.toString().split('.')[0])}`] == undefined) ctx.strokeStyle = "#4dd130"
    else ctx.strokeStyle = "#bc0909"
    ctx.rect(canvas.width/2 + (player.selectedGrid.x-player.offset.x())*player.zoom, canvas.height/2 + (player.selectedGrid.y-player.offset.y())*player.zoom, player.zoom, player.zoom)
    ctx.globalAlpha = 0.5
    let image = images[player.building.list[player.building.selected]]
    if(player.building.list[player.building.selected] == 'wall') image = images.walls.sides0
    ctx.drawImage(image, canvas.width/2 + (player.selectedGrid.x-player.offset.x())*player.zoom, canvas.height/2 + (player.selectedGrid.y-player.offset.y())*player.zoom, player.zoom, player.zoom)
    ctx.stroke()
    ctx.globalAlpha = 1
  },
  inhand() {
    // loop trough players
    for(let id in players) {
      let playerL = players[id]
      for(let item in players[id].hotbar.items) {
        if(playerL.hotbar.items[item].slot == playerL.hotbar.selected) {
          let image = images[item]
          ctx.drawImage(image, canvas.width/2 + (playerL.pos.x - player.pos.x)*player.zoom, canvas.height/2 + (playerL.pos.y - player.pos.y)*player.zoom, player.zoom, player.zoom)
        }
      }
    }
  }
}
