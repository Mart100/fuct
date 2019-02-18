let backgroundNoiseStrength = 50

function createBackground() {
  size = player.world.borders
  noise.seed(Math.random())
  for(let x=0;x<size.x;x++) {
    if(!background[x]) background[x] = []
    for(let y=0;y<size.y;y++) {
      background[x][y] = (noise.simplex2(x/backgroundNoiseStrength, y/backgroundNoiseStrength)+1)/2*255
    }
  }
}