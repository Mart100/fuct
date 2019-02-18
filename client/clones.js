$(() => {

  // show / hide cloneControl
  $('body').on('keydown', (event) => { if(event.key == 'c') $('#cloneControl').fadeIn(100) })
  $('body').on('keyup', (event) => { if(event.key == 'c') $('#cloneControl').fadeOut(100) })

  // Modes
  $('#cloneAttack').on('click', () => { 
    socket.emit('cloneMode', 'attack')
    resetSelectedClassAll()
    $('#cloneAttack').addClass('selected')
  })

  $('#cloneFollow').on('click', () => { 
    socket.emit('cloneMode', 'follow')
    resetSelectedClassAll()
    $('#cloneFollow').addClass('selected')
  })

  $('#cloneDefend').on('click', () => { 
    socket.emit('cloneMode', 'defend')
    resetSelectedClassAll()
    $('#cloneDefend').addClass('selected')
  })

})

function resetSelectedClassAll() {
  $('#cloneAttack').removeClass('selected')
  $('#cloneFollow').removeClass('selected')
  $('#cloneDefend').removeClass('selected')
}