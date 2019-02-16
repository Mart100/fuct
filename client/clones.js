$(() => {

  // show / hide cloneControl
  $('body').on('keydown', (event) => { if(event.key == 'c') $('#cloneControl').fadeIn(100) })
  $('body').on('keyup', (event) => { if(event.key == 'c') $('#cloneControl').fadeOut(100) })

  // Modes
  $('#cloneAttack').on('click', () => { socket.emit('cloneMode', 'attack') })
  $('#cloneFollow').on('click', () => { socket.emit('cloneMode', 'follow') })
  $('#cloneDefend').on('click', () => { socket.emit('cloneMode', 'defend') })

})
