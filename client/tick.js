function tick() {
    updateDebug()
    // countdown spawning
    if(player.spawning > 0) {
        $('#HUD-spawning').css('display', 'block')
        $('#HUD-spawning span').html(Math.round(player.spawning*10)/10)
        if(player.spawning < 0.1) {
            setTimeout(() => {
                $('#HUD-spawning').css('display', 'none')
            }, 100)
        }
    }
}
