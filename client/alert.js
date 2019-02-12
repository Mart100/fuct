// on alert
socket.on('alert', data => alert(data) )

function alert(data) {
  let id = 'alert-'+Math.round(Math.random()*1000)
  $('#alerts').append( `<div id="${id}">${data.text}</div>`)

  // if too many alerts. Remove first one
  if($('#alerts').children().length > 5) $('#alerts div:first-child').remove()
  // set color
  $('#'+id).css('color', data.color)
  // Set opacity to full
  // Wait 4 seconds. than begin dissapearing
  setTimeout(function() {
    // animate fade away
    $('#'+id).animate({'opacity': 0}, 1000, () => {
      $('#'+id).remove()
    })
  }, 2000)
}