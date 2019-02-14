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
  $('#settings > #chat').on('change', () => {
    let v = $('#settings > #chat').prop('checked')
    console.log(v)
    settings.chatEnabled = v
    if(cookiesAccepted) setCookie('chatEnabled', v)
  })
})

// load all settings from cookies
$(() => {

  // sound Volume
  if(getCookie('soundVolume') != "") settings.volume = Number(getCookie('soundVolume'))
  $('#settings > #volume').val(settings.volume)

  // chat Enabled
  if(getCookie('chatEnabled') != "") settings.chatEnabled = (getCookie('chatEnabled') == 'true')
  $('#settings > #chat').prop('checked', settings.chatEnabled)


})