$(function() {
    // Toggle BuildMode with b
    $('body').on('keydown', (event) => {
        if(event.keyCode == 66 && !player.buildmodeFired) {
            player.buildmodeFired = true
            // No longer in buildmode
            if(player.buildmode) {
                player.buildmode = false
                $('.HUD-buildSlot').css('display','none')
                $('#HUD-building').animate({'width': '0px', 'padding': '0px'}, 300)
            }
            // In buildmode
            else {
                player.buildmode = true
                $('#HUD-building').animate({'width': '741px', 'padding': '5px'}, 300, () => {
                $('.HUD-buildSlot').css('display','inline-block')
                })
            }
        }
    })
    $('body').on('keyup', (event) => {
        if(event.keyCode == 66) player.buildmodeFired = false
    })
    // Build when click and in buildmode
    $('#canvas').on('mousedown', function(event) {
        if(!player.buildmode) return
        build()
        /*player.placingInterval = setInterval(() => {
            build()
        })*/
    })
    $('#canvas').on('mouseup', function(event) {
        clearInterval(player.placingInterval)
    })
    // Clicking on builders taskbar
    $('#HUD-building').on('click', '*', (event) => {
        $('.HUD-buildSlot').css('background-color', 'rgba(0, 0, 0, 0.6)')
        // Color selected building darker
        // clicked image
        let slot

        if($(event.target).css('height') == '60px') slot = $(event.target) // slot itself
        else slot = $(event.target).parent() // amount text or image

        socket.emit('PLAYER_DATA', {type: 'buildSelected', selected: getSelectedBuilding(slot.attr('id')) })
        slot.css('background-color', 'rgba(0, 0, 0, 0.85)')
    })
})

// Function when building
function build() {
    let pos = {
        x: player.selectedGrid.x + Number(player.pos.x.toString().split('.')[0]), 
        y: player.selectedGrid.y + Number(player.pos.y.toString().split('.')[0])
    }
    // go away if out of range
    if(4 < getDistanceBetween({x: pos.x+0.5, y: pos.y+0.5}, player.pos)) return
    socket.emit('BUILD_DATA', { pos: pos, type: 'add', typeBuilding: player.building.selected })
    setTimeout(() => {updateBuildBar()}, 100)
}

function updateBuildBar() {
    for(let i = 0; i < 10; i++) {
        let name = getKeyByIndex(player.building.list, i)
        let image = images[name]
        if(name == 'wall') image = images.walls.sides0
        if(image == undefined) $('#HUD-buildSlot'+i+' > img').attr('src', 'https://i.imgur.com/GyZRyx1.png')
        else {
            $('#HUD-buildSlot'+i).html(`
                <img src="${image.src}"/>
                <span>${player.building.list[name].amount}</span>
            `)
        }
    }
}
function getSelectedBuilding(id) {
    let index = Number(id.replace('HUD-buildSlot',''))
    let name = getKeyByIndex(player.building.list, index)
    if(name == undefined) return 'empty'
    return name
}