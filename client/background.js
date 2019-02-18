let backgroundStrength = 50
let backgroundMin = 0
let backgroundMax = 255
let backgroundPlus = 1.5
let backgroundTimes = 120
//defaultSettings()

function createBackground() {
  size = player.world.borders
  noise.seed(Math.random())
  for(let x=0;x<size.x;x++) {
    if(!background[x]) background[x] = []
    for(let y=0;y<size.y;y++) {
      let val = (noise.simplex2(x/backgroundStrength, y/backgroundStrength)+backgroundPlus)/2*backgroundTimes
      if(val > backgroundMax) val = backgroundMax
      if(val < backgroundMin) val = backgroundMin
      background[x][y] = val
    }
  }
}
function defaultSettings() {
  backgroundStrength = 50
  backgroundMin = 0
  backgroundMax = 255
  backgroundPlus = 2
  backgroundTimes = 100
}