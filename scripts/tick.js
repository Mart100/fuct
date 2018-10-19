function tick(world) {
    //console.log(new Date() - latestframe)
    latestframe = new Date()
    // loop trough all buildings
    for(let key in buildings) {
      let building = buildings[key]
      // If building is turret...
      if(building.type == 'turreticon') {
        // shoottimer
        building.timer++
        // check if bullet hit player
        for(let num in building.bullets) {
          let bullet = building.bullets[num]
          // if player left. skip collision
          if(players[bullet.target] == undefined) continue
          var circle1 = {radius: 1/2.5, x: bullet.pos.x, y: bullet.pos.y}
          var circle2 = {radius: 1/5, x: players[bullet.target].pos.x, y: players[bullet.target].pos.y}
  
          let dx = circle1.x - circle2.x;
          let dy = circle1.y - circle2.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
  
          if (distance < circle1.radius + circle2.radius) {
            players[bullet.target].health -= 1
            //console.log('hit: '+players[bullet.target].username)
            delete building.bullets[num]
          }
        }
        // if timer is ready
        if(building.timer > building.reloadspeed) {
          building.timer = 0
          // Calculate closest player
          let closestplayer = { x: 9999, y: 9999 }
          let closestplayerid = 'none'
          for(let id in players) {
            // if player is undefined somehow
            if(players[id] == undefined) continue
            // dont shoot to owner
            if(id == building.owner) continue
            // dont shoot if target is to far away
            if(Math.abs(players[id].pos.x - building.pos.x+0.5)+Math.abs(players[id].pos.y - building.pos.y+0.5) > building.range) continue
            if(Math.abs(closestplayer.x - building.pos.x+0.5)+Math.abs(closestplayer.y - building.pos.y+0.5) > Math.abs(players[id].pos.x - building.pos.x+0.5)+Math.abs(players[id].pos.y - building.pos.y+0.5)) {
              closestplayer = { x: players[id].pos.x, y: players[id].pos.y }
              closestplayerid = id
            }
          }
          // if no target avaible
          if(closestplayerid == 'none') continue
            // calculate angle
          let angle = Math.atan2(closestplayer.y - building.pos.y-0.5, closestplayer.x - building.pos.x-0.5)
          for(let i=0;i<1e2;i++) {
           if(building.bullets[i] == undefined) {
             nummer = i
             break
           }
          }
          building.bullets[nummer] = {
            pos: {
              x: building.pos.x+0.5,
              y: building.pos.y+0.5
            },
            slope: {
              x: Math.cos(angle),
              y: Math.sin(angle)
            },
            target: closestplayerid,
            traveled: 0
          }
        }
        // Move bullets
        for(let num in building.bullets) {
          let bullet = building.bullets[num]
          bullet.pos.x += bullet.slope.x / 10 * building.bulletspeed
          bullet.pos.y += bullet.slope.y / 10 * building.bulletspeed
          bullet.traveled += Math.abs(bullet.slope.x) / 10 * building.bulletspeed + Math.abs(bullet.slope.y) / 10 * building.bulletspeed
          // delete bullets if their to far away
          if(bullet.traveled > building.range) delete building.bullets[num]
        }
      }
      // landmine
      if(building.type == 'landmine') {
        if(building.exploding >= 1) building.exploding += 0.2
        if(building.exploding >= 19) delete buildings[key]
      }
      // show health of building
      if(building.showhealth > 0) building.showhealth -= 0.05
    }
    // loop trough all players
    for(id in players) {
      let player = players[id]
      if(player == undefined || player.username == undefined) delete players[id]
      if(player.pos == undefined || player.movement == undefined) continue
      // move players
      if(player.movement.north) player.pos.y -= 0.03
      if(player.movement.east) player.pos.x += 0.03
      if(player.movement.south) player.pos.y += 0.03
      if(player.movement.west) player.pos.x -= 0.03
      // building collision
      let directions = collisionPlayer(player)
      player.directions = directions
      if(directions.W || directions.SW || directions.WN) player.pos.x += (Math.abs(Number('0.' + player.pos.x.toString().split('.')[1])-0.5))/10
      if(directions.E || directions.NE || directions.ES) player.pos.x -= (Math.abs(Number('0.' + player.pos.x.toString().split('.')[1])-0.5))/10
      if(directions.N || directions.NE || directions.WN) player.pos.y += (Math.abs(Number('0.' + player.pos.y.toString().split('.')[1])-0.5))/10
      if(directions.S || directions.SW || directions.ES) player.pos.y -= (Math.abs(Number('0.' + player.pos.y.toString().split('.')[1])-0.5))/10
      // player collision
      for(idColl in players) {
        let playerColl = players[idColl]
        // if player is undefined return
        if(playerColl == undefined || playerColl.pos == undefined) continue
        // if player is player return
        if(id == idColl) continue
        let dx = player.pos.x - playerColl.pos.x
        let dy = player.pos.y - playerColl.pos.y;
        let distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < 0.9) {
          let angle = Math.atan2(player.pos.y - playerColl.pos.y, player.pos.x - playerColl.pos.x)
          player.pos.x += Math.cos(angle) * (1-Math.abs(Number('0.' + player.pos.x.toString().split('.')[1])-Number('0.' + playerColl.pos.x.toString().split('.')[1])))/40
          player.pos.y += Math.sin(angle) * (1-Math.abs(Number('0.' + player.pos.y.toString().split('.')[1])-Number('0.' + playerColl.pos.x.toString().split('.')[1])))/40
        }
      }
      // When player stands on landmine
      if(buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)] != undefined
         && buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)].type == 'landmine'
         && buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)].owner != id
         && buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)].exploding == 0) {
        let landmine = buildings[Math.floor(player.pos.x)+','+Math.floor(player.pos.y)]
        // start with explosion animation
        landmine.exploding = 1
        // damage players
        for(id in players) {
          if(Math.abs(players[id].pos.x - landmine.pos.x+0.5)+Math.abs(players[id].pos.y - landmine.pos.y+0.5) < 3.5) {
            players[id].health -= (4 - Math.abs(players[id].pos.x - landmine.pos.x+0.5)+Math.abs(players[id].pos.y - landmine.pos.y+0.5))*5
          }
        }
  
      }
      // if player has 0 health
      if(player.health < 0) player.died = true
      // if player is in vanish
      if(player.vanish) player.health = 100
      // regenerate player
      if(player.health < 100) player.health += 0.01
    }
  }
module.exports = tick