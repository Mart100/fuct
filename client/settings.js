$(() => {
  // toggle Settings with Escape
  $('body').on('keydown', (event) => {
    if(event.key == 'Escape') $('#settings').fadeToggle(200)
  })

  // hide Settings with exit button
  $('#settings #exit').on('click', () => { $('#settings').fadeOut(200) })

  // if no cookies exit. ask permissions
  if(!cookiesAccepted) {
    $('#settings').append(`<div id="cookies">To save settings, Please accept cookies: <button>Accept</button> </div>`)

    // on cookies accept
    $('#settings > #cookies > button').on('click', () => { 
      cookiesAccepted = true
      $('#settings > #cookies').remove()
      setCookie('cookiesAccepted', 'true')
      setCookie('soundVolume', Number($('#settings > #volume').val()))
      setCookie('chatEnabled', $('#settings > #chat').prop('checked'))
    })
  }
})

// on settings change
$(() => {

  // sound Volume
  $('#settings > #volume').on('change', () => {
    let v = Number($('#settings > #volume').val())
    settings.volume = v
    if(cookiesAccepted) setCookie('soundVolume', v)
  })

  // chat Enabled
  $('#settings > #settings-chat').on('change', () => {
    let v = $('#settings > #settings-chat').prop('checked')
    settings.chatEnabled = v
    if(settings.chatEnabled) enableChat()
    else disableChat()
    if(cookiesAccepted) setCookie('chatEnabled', v)
  })

  // grid
  $('#settings > #settings-grid').on('change', () => {
    let v = $('#settings > #settings-grid').prop('checked')
    settings.grid = v
    if(cookiesAccepted) setCookie('grid', v)
  })
})

// load all settings from cookies
$(() => {

  // sound Volume
  if(getCookie('soundVolume') != "") settings.volume = Number(getCookie('soundVolume'))
  $('#settings > #volume').val(settings.volume)

  // chat Enabled
  if(getCookie('chatEnabled') != "") settings.chatEnabled = (getCookie('chatEnabled') == 'true')
  $('#settings > #settings-chat').prop('checked', settings.chatEnabled)
  if(settings.chatEnabled) enableChat()
  else disableChat()

  // Grid
  if(getCookie('grid') != "") settings.grid = (getCookie('grid') == 'true')
  $('#settings > #settings-grid').prop('checked', settings.grid)


})



// actual settings functions

function enableChat() {
  $('#chat').show()
}

function disableChat() {
  $('#chat').hide()
  player.typing = false
}