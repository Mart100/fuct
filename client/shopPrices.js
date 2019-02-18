let shopPrices = {}

function getShopPrices(a, buildings, player) {
  // get all prices
  if(a == 'all') {
    let tools = getToolPrices(player)
    let buildings = getBuildingPrices(buildings, player)

    return {tools: tools, buildings: buildings}
  }

  // get all building prices
  if(a == 'buildings') return getBuildingPrices(buildings, player)

  // get all tool prices
  if(a == 'tools') return getBuildingPrices(buildings, player)

  // get specific building price
  if(shopPrices.buildings[a] != undefined) return getBuildingPrice(a, buildings, player)

  // get specific tool type
  if(shopPrices.tools[a] != undefined) return getToolPrice(a, player)

  // get shopPrices object
  if(a == 'full') return shopPrices

  return 'ERR: shopPrice not found'
}

function getMinerPrice(buildings, player) {
  let buildingsArray = Object.values(buildings)
  let amountOfMiners = buildingsArray.filter((a) => a.owner == socket.id && a.type == 'miner' ).length
  amountOfMiners += player.building.list['miner'].amount
  return 2 * amountOfMiners * amountOfMiners
}

function getToolPrices(player) {
  let toolPrices = {}
  for(let tool in shopPrices.tools) toolPrices[tool] = getToolPrice(tool, player)
  return toolPrices
}

function getBuildingPrices(buildings, player) {
  let buildingPrices = {}
  for(let building in shopPrices.buildings) buildingPrices[building] = getBuildingPrice(building, buildings, player)
  return buildingPrices
}

function getToolPrice(tool, player) {
  let currentLevel = player.hotbar.list[tool].level
  return price = shopPrices.tools[tool][currentLevel]
}

function getBuildingPrice(building, buildings, player) {
  let price = 0
  let buildingData = buildingsData[building]
  if(buildingData.price == undefined) {
    if(building == 'miner') price = getMinerPrice(buildings, player)
  }
  else price = buildingData.price
  return price
}

socket.on('shopPrices', (data) => {
  shopPrices = data
  shopPrices.buildings = {}
})