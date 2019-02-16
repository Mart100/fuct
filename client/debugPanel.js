let framecount1, framecount2, fps

const Calculate = {
 totalbullets() {
   let counting = 0
   for(id in buildings) {
     if(buildings[id].bullets != undefined) {
       counting += buildings[id].bullets.length
     }
   }
   return counting
 },
 totalClones() {
    let a = 0
    for(i in players) for(j of players[i].clones) if(j != undefined) a++
    return a
 }
}

function updateDebug() {
  let text = `
<span style="font-size: 25px;"><b>  Debug:</b></span><br>
<b>Player: </b> <br>
&nbsp;x: ${player.pos.x}<br>
&nbsp;y: ${player.pos.y}<br>
&nbsp;zoom: ${player.zoom} <br>
&nbsp;selectedGridX: ${player.selectedGrid.x} <br>
&nbsp;selectedGridy: ${player.selectedGrid.y} <br>
&nbsp;admin: ${player.admin} <br>
<b>Screen: </b> <br>
&nbsp;width: ${screen.width} <br>
&nbsp;height: ${screen.height} <br>
<b>World: </b> <br>
&nbsp;bullets: ${Calculate.totalbullets()} <br>
&nbsp;clones: ${Calculate.totalClones()} <br>
<b>Other: </b> <br>
&nbsp;FPS: ${fps} <br>
&nbsp;PING: ${ping.pong} <br>
&nbsp;TPS: ${tps} <br>
`

  $("#debugpanel").html(text)
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
    if(event.keyCode == 113) toggleDebugPanel()
  })

  // on admin input change
  $('#adminpassInput').on('change', () => {
    socket.emit('requestAdmin', $("#adminpassInput").val())
  })
})