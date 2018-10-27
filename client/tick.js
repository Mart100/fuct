function tick() {
    // if player died
    if(player.isDead) {
        // spawn back in 5 seconds
        setTimeout(() => {
            // remove death
            player.health = 100
            player.isDead = false
        }, 5000)
    }

    updateDebug()
}
