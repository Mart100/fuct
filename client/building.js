$(function() {
    // Toggle BuildMode with b
    $('body').on('keydown', (event) => {
        if(isChatting()) return
        if(event.keyCode == 66 && !player.buildmodeFired) {
            player.buildmodeFired = true
            // No longer in buildmode
            if(player.buildmode) {
                player.buildmode = false
                $('.buildSlot').css('display','none')
                $('#buildbar').animate({'width': '0px', 'padding': '0px'}, 300)
            }
            // In buildmode
            else {
                player.buildmode = true

                $('.buildSlot').css('display','inline-block')

                $('#buildbar').css('width', 'auto')
                let buildbarAutoWidth = $('#buildbar').css('width', 'auto').width()
                $('#buildbar').css('width', '0')

                $('#buildbar').animate({'width': buildbarAutoWidth, 'padding': '5px'}, 300, () => {
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
    $('#buildbar').on('click', '*', (event) => {
        $('.buildSlot').css('background-color', 'rgba(0, 0, 0, 0.6)')
        // Color selected building darker
        // clicked image
        let slot

        if($(event.target).css('height') == '60px') slot = $(event.target) // slot itself
        else slot = $(event.target).parent() // amount text or image

        let selected = slot.attr('id').replace('buildSlot-','')
        socket.emit('PLAYER_DATA', {type: 'buildSelected', selected: selected })
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
    setTimeout(() => {updateBuildbar()}, 100)
}

function updateBuildbar() {
    $('#buildbar').html('')
    for(let name in player.building.list) {

        let image = images[name]
        if(name == 'wall') image = images.walls.sides0

        let building = player.building.list[name]

        $('#buildbar').append(`
        <div class="buildSlot" id="buildSlot-${name}">
            <img src="${image.src}"/>
            <span>${player.building.list[name].amount}</span>
        </div>
        `)
    }
}