function tick() {
    updateDebug()
    // countdown spawning
    if(player.spawning) {
        $('#HUD-spawning').show()
        let timeLeft = Math.round(50 - (new Date() - new Date(player.spawning))/100)/10
        $('#HUD-spawning span').html(timeLeft)
    }
    if($('#HUD-spawning').css('display') == 'block' && !player.spawning) $('#HUD-spawning').hide()
}
