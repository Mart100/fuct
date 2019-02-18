// some socket.on
socket.on('buildings', function(data) {
  buildings = data
})

socket.on('Pong', () => {
  ping.pong = performance.now() - ping.ping
})

socket.on('players', data => {
  players = data
})
socket.on('TPS', data => {
  tps = data
})
socket.on('privatePlayerData', data => {
  player = jQuery.extend(player, data)
})
socket.on('destroyed', (data) => {
  let stats = data.stats
  $('#backgroundOpacity').show()
  $('#backgroundOpacity').animate({'opacity': '0.6'}, 1000)
  // show stats
  $('#stats > p').html(
  `
  <b>Kills: </b>${stats.kills}<br>
  <b>Deaths: </b>${stats.deaths}<br>
  <b>Cores destroyed: </b>${stats.coreDestroys}<br>
  <b>total Coins: </b>${stats.totalCoins}<br>
  `)
  $('#stats').fadeIn()
  
  $('#stats > #continue').off().on('click', () => {
    $('#stats').fadeOut()
    $('#menu').fadeIn()
  })
  
})
socket.on('clones', (data) => {
  clones = data
})

socket.on('leaderboard', (data) => {
  let html = ''
  for(playerL of data) {
    let name = `<b>${playerL.username}: </b>`
    if(player.username == playerL.username) name = '<u>'+name+'</u>'
    let total = `${name} ${playerL.totalCoins}<br>`
    html += total
  }
  $('#leaderboard').html(html)
})

// ping
setInterval(() => {
  ping.ping = performance.now()
  socket.emit('Ping', ping.ping)
}, 1000)