function cloneAI(clone, world) {
  if(clone == undefined) return
  let mode = world.players[clone.owner].cloneMode
  
  if(mode == 'defend') defendMode(clone, world)
  if(mode == 'follow') followMode(clone, world)
  if(mode == 'attack') attackMode(clone, world)
}

module.exports = cloneAI

function defendMode(clone, world) {
  
}

function attackMode(clone, world) {
  let owner = world.players[clone.owner]

  resetMoving(clone)

  // Get closest core
  let closestCore = {x: 10000000, y: 10000000}
  let closestCoreDist = 1e9
  for(let i in world.buildings) {
    let building = world.buildings[i]
    if(building.type != 'core') continue
    if(building.owner == owner.id) continue
    let distance = getDistanceBetween(owner.pos, building.pos)
    if(distance < closestCoreDist) {
      closestCoreDist = distance
      closestCore = building.pos
    }
  }
  
  // attack if closest core found
  if(closestCore.x != 10000000) {

    // Go to core
    goTo(clone, closestCore)

    // If building in the way use pickaxe

    // North
    if(clone.moving.north) {
      let nBuilding = world.buildings[Math.floor(clone.pos.x)+','+Math.floor(clone.pos.y-1)]
      if(nBuilding != undefined && nBuilding.owner != clone.owner) {
        world.socketHandler.buildData({type: 'damage', clone: clone, pos: nBuilding.pos})
      }
    }

    // East
    if(clone.moving.east) {
      let eBuilding = world.buildings[Math.floor(clone.pos.x+1)+','+Math.floor(clone.pos.y)]
      if(eBuilding != undefined && eBuilding.owner != clone.owner) {
        world.socketHandler.buildData({type: 'damage', clone: clone, pos: eBuilding.pos})
      }
    }

    // South
    if(clone.moving.south) {
      let sBuilding = world.buildings[Math.floor(clone.pos.x)+','+Math.floor(clone.pos.y+1)]
      if(sBuilding != undefined && sBuilding.owner != clone.owner) {
        world.socketHandler.buildData({type: 'damage', clone: clone, pos: sBuilding.pos})
      }
    }

    // West
    if(clone.moving.west) {
      let wBuilding = world.buildings[Math.floor(clone.pos.x-1)+','+Math.floor(clone.pos.y)]
      if(wBuilding != undefined && wBuilding.owner != clone.owner) {
        world.socketHandler.buildData({type: 'damage', clone: clone, pos: wBuilding.pos})
      }
    }

  }

}

function followMode(clone, world) {
  let owner = world.players[clone.owner]

  resetMoving(clone)
  goTo(clone, owner.pos)

}

function goTo(clone, pos) {

  let cp = clone.pos

  // X
  if(cp.x > pos.x) clone.moving.west = true
  else clone.moving.east = true

  // Y
  if(cp.y > pos.y) clone.moving.north = true
  else clone.moving.south = true

}

function resetMoving(clone) {
  clone.moving.north = false
  clone.moving.east = false
  clone.moving.south = false
  clone.moving.west = false
}

function getDistanceBetween(a, b) {
  let c = a.x - b.x
  let d = a.y - b.y
  let result = Math.sqrt( c*c + d*d )
  return result
}