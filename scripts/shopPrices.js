function getShopPrices(a, SH, socket) {
  // get all prices
  if(a == 'all') {
    let tools = getToolPrices(SH, socket)
    let buildings = getBuildingPrices(SH, socket)

    return {tools: tools, buildings: buildings}
  }

  // get all building prices
  if(a == 'buildings') return getBuildingPrices(SH, socket)

  // get all tool prices
  if(a == 'tools') return getBuildingPrices(SH, socket)

  // get specific building price
  if(shopPrices.buildings[a] != undefined) return getBuildingPrice(a, SH, socket)

  // get specific tool type
  if(shopPrices.tools[a] != undefined) return getToolPrice(a, SH, socket)

  return 'ERR: shopPrice not found'
}

module.exports = getShopPrices

function getMinerPrice(SH, socket) {
  let buildingsArray = Object.values(SH.buildings)
  let player = SH.players[socket.id]
  let amountOfMiners = buildingsArray.filter((a) => a.owner == socket.id && a.type == 'miner' ).length
  amountOfMiners += player.building.list['miner'].amount
  return shopPrices.buildings.miner * amountOfMiners * amountOfMiners
}

function getToolPrices(SH, socket) {
  let toolPrices = {}
  for(let tool in shopPrices.tools) toolPrices[tool] = getToolPrice(tool, SH, socket)
  return toolPrices
}

function getBuildingPrices(SH, socket) {
  let buildingPrices = {}
  for(let building in shopPrices.buildings) toolPrices[tool] = getBuildingPrice(building, SH, socket)
  return buildingPrices
}

function getToolPrice(tool, SH, socket) {
  let player = SH.players[socket.id]
  let currentLevel = player.hotbar.list[tool].level
  return price = shopPrices.tools[tool][currentLevel]
}

function getBuildingPrice(building, SH, socket) {
  let price = 0
  if(building == 'miner') price = getMinerPrice(SH, socket)
  else price = shopPrices.buildings[building]
  return price
}


const shopPrices = {
  tools: {
    sword: [50, 100, 500, 1000],
    pickaxe: [50, 100, 500, 1000]
  },
  buildings: {
    miner: 2,
    turret: 100,
    wall: 10,
    landmine: 10,
    barbedwire: 10
  }
}