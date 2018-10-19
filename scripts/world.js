const tick = require('./tick.js')

class World {
    constructor(id) {
        this.id = id

    }
    tick() {
        tick()
    }
}
module.exports = World