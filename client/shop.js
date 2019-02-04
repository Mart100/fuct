let shop = {}
$(function() {
    // Toggle Shop with S
    $('body').on('keydown', (event) => {
        if(event.keyCode != 70 || player.inshopFired) return
        player.inshopFired = true
        // No longer in shop
        if(player.inshop) {
            player.inshop = false
            $('#HUD-shop').fadeOut(400, () => { $('#HUD-shopCont').css('display', 'none') })
        }
        // In shop
        else {
            player.inshop = true
            $('#HUD-shop').css({'display': 'block', 'width': '700px', 'height': '500px', 'left': '50%', 'transform': 'translateX(-50%)', 'bottom': `${screen.height/2-250}px`})
            $('#HUD-shop').fadeIn(400)
        }
    })
    $('body').on('keyup', (event) => {
        if(event.keyCode == 70) player.inshopFired = false
    })

    $('#HUD-shopNavTools').on('mousedown', showTools)
    $('#HUD-shopNavBuildings').on('mousedown', showBuildings)

    shop = {
        tools: [
            {
                img: images['sword'].src,
                for: 'pickaxe'
            },
            {
                img: images['pickaxe'].src,
                for: 'sword'
            }
        ],
        buildings: [
            {
                img: images['core'].src,
                for: 'core'
            },
            {
                img: images['miner'].src,
                for: 'miner'
            },
            {
                img: images['turret'].src,
                for: 'turret'
            },
            {
                img: images['landmine'].src,
                for: 'landmine'
            },
            {
                img: images.walls.sides0.src,
                for: 'wall'
            },
            {
                img: images['barbedwire'].src,
                for: 'barbedwire'
            },
            {
                img: images['spongebob'].src,
                for: 'spongebob'
            },
            {
                img: images['bulldozer'].src,
                for: 'bulldozer'
            },
        ],
    }
})
function showTools() {
    $('#HUD-shopNavTools').css({'background-color': 'rgba(0, 0, 0, 1)', 'cursor': 'default'})
    $('#HUD-shopNavBuildings').css({'background-color': 'rgba(0, 0, 0, 0.4)', 'cursor': 'pointer'})
    $('#HUD-shopIndex').html('')
    for(let num in shop.tools) {
        $('#HUD-shopIndex').append(`<div id="HUD-shopList${num}" class="HUD-shopList"><img src="${shop.tools[num].img}"/></div>`)
    }
}
function showBuildings() {
    $('#HUD-shopNavTools').css({'background-color': 'rgba(0, 0, 0, 0.4)', 'cursor': 'pointer'})
    $('#HUD-shopNavBuildings').css({'background-color': 'rgba(0, 0, 0, 1)', 'cursor': 'default'})
    $('#HUD-shopIndex').html('')
    for(let num in shop.buildings) {
        $('#HUD-shopIndex').append(`<div id="HUD-shopList${num}" class="HUD-shopList"><img src="${shop.buildings[num].img}"/></div>`)
    }
}