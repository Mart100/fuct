const buildingsData = {
  cloneFactory: {
    name: 'cloneFactory',
    startAmount: 0,
    price: 1000,
    size: {x: 2, y: 2},
    health: 500
  },
  core: {
    name: 'core',
    startAmount: 1,
    price: 0,
    size: {x: 2, y: 2},
    health: 1000
  },
  miner: {
    name: 'miner',
    startAmount: 1,
    price: minerPriceFunction,
    size: {x: 1, y: 1},
    health: 100
  },
  turret: {
    name: 'turret',
    startAmount: 2,
    price: 100,
    size: {x: 1, y: 1},
    health: 400
  },
  wall: {
    name: 'wall',
    startAmount: 20,
    price: 10,
    size: {x: 1, y: 1},
    health: 200
  },
  landmine: {
    name: 'landmine',
    startAmount: 5,
    price: 25,
    size: {x: 1, y: 1},
    health: 10
  },
  barbedwire: {
    name: 'barbedwire',
    startAmount: 5,
    price: 5,
    size: {x: 1, y: 1},
    health: 100
  }
}



module.exports = buildingsData

function minerPriceFunction(SH, socket) {
  let buildingsArray = Object.values(SH.buildings)
  let player = SH.players[socket.id]
  let amountOfMiners = buildingsArray.filter((a) => a.owner == socket.id && a.type == 'miner' ).length
  amountOfMiners += player.building.list['miner'].amount
  return 2 * amountOfMiners * amountOfMiners
}