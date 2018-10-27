let framecount1, framecount2, fps
const Calculate = {
 totalbullets() {
   let counting = 0
   for(id in buildings) {
     counting += buildings.bullets.length
   }
   return counting
 }
}
function updateDebug() {
  var debug = `Debug:<br>
<b>Player: </b> <br>
&nbsp;x: ${player.pos.x}<br>
&nbsp;y: ${player.pos.y}<br>
&nbsp;zoomLVL: ${player.zoom} <br>
&nbsp;selectedGridX: ${player.selectedGrid.x} <br>
&nbsp;selectedGridy: ${player.selectedGrid.y} <br>
<b>FPS: ${fps}</b> <br>
<b>PING: ${ping.pong}</b> <br>
<b>Screen: </b> <br>
&nbsp;width: ${screen.width} <br>
&nbsp;height: ${screen.height} <br>
<b>Stats: </b> 
&nbsp;bullets: ${Calculate.totalbullets} <br>

`
  if(player.admin) {
    debug += `
<b>admin: </b> True <br>
`
  }
  $("#debugpanel").html(debug)
}
function toggleDebugPanel() {
  $("#adminpassInput").toggle()
  $("#debugpanel").toggle()
  
}

$(function() {
  setInterval(() => { 
    fps = (framecount2 - framecount1)
    framecount1 = framecount2
    framecount2 = framecount
    
  }, 1000)
  $(window).keydown(function(event) {
    if($("#adminpassInput").val()) {
      if(SHA256($("#adminpassInput").val()) == "7e87ccd85d4abbdc98f19c2005268d1b772f722a9ec19d96418a2727616342f5") {
         player.admin = true
      } else {
        player.admin = false
      }
    }
    if(event.keyCode == 119) {
      toggleDebugPanel()
    }
  })
})