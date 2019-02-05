let shop = {}
$(function() {
    // Toggle Shop with S
    $('body').on('keydown', (event) => {
        if(event.keyCode != 70 || player.inshopFired) return
        player.inshopFired = true
        // No longer in shop
        if(player.inshop) {
            player.inshop = false
            $('#HUD-shop').fadeOut(400)
        }
        // In shop
        else {
            player.inshop = true
            $('#HUD-shop').fadeIn(400)
        }
    })


    $('body').on('keyup', (event) => {
        if(event.keyCode == 70) player.inshopFired = false
    })

    $('#HUD-shopNavTools').on('mousedown', showTools)
    $('#HUD-shopNavBuildings').on('mousedown', showBuildings)

    // create shop object
    shop = {
        tools: [
            { img: images['sword'].src, for: 'sword' },
            { img: images['pickaxe'].src, for: 'pickaxe' }
        ],
        buildings: [
            { img: images['miner'].src, for: 'miner' },
            { img: images['turret'].src, for: 'turret' },
            { img: images['landmine'].src, for: 'landmine' },
            { img: images.walls.sides0.src, for: 'wall' },
            { img: images['barbedwire'].src, for: 'barbedwire' }
        ],
    }

    // show tools
    showTools()
})

function showTools() {
    $('#HUD-shopNavTools').css({'background-color': 'rgba(0, 0, 0, 1)', 'cursor': 'default'})
    $('#HUD-shopNavBuildings').css({'background-color': 'rgba(0, 0, 0, 0.4)', 'cursor': 'pointer'})
    $('#HUD-shopIndex').html('')
    for(let num in shop.tools) {
        let tool = shop.tools[num]
        $('#HUD-shopIndex').append(`<div id="HUD-shopList-${tool.for}" class="HUD-shopItem"><img src="${tool.img}"/></div>`)
    }
    shopElementClick('tool')
}
function showBuildings() {
    $('#HUD-shopNavTools').css({'background-color': 'rgba(0, 0, 0, 0.4)', 'cursor': 'pointer'})
    $('#HUD-shopNavBuildings').css({'background-color': 'rgba(0, 0, 0, 1)', 'cursor': 'default'})
    $('#HUD-shopIndex').html('')
    for(let num in shop.buildings) {
        let building = shop.buildings[num]
        $('#HUD-shopIndex').append(`<div id="HUD-shopList-${building.for}" class="HUD-shopItem"><img src="${building.img}"/></div>`)
    }
    shopElementClick('building')
}

function shopElementClick(type) {
    // On shop element click
    $('.HUD-shopItem').off().on('click', (event) => {

        let id
        if(event.target.localName == 'img') id = event.target.parentElement.attributes.id.value
        else id = event.target.attributes.id.value

        let item = id.split('-')[2]

        // send buy request to server
        socket.emit('BUY', {item: item, type: type})

        // refresh amount / level
        if(type == 'building') setTimeout(updateBuildBar, 100)
    })
}