$(function() {
  // Toggle Shop with S
  $('body').keydown(function(event) {
    if(event.keyCode == 70) {
      // No longer in buildmode
      if(player.inshop) {
        console.log('test')
        player.inshop = false
        $('#HUD-shopCont').fadeOut(400, () => { $('#HUD-shopCont').css('display', 'none') })
        $('#HUD-shopList').fadeOut(400, () => { $('#HUD-shopList').css('display', 'none') })
      }
      // In buildmode
      else {
        player.inshop = true
        $('#HUD-shopCont').css({'width': '700px', 'height': '500px', 'left': '50%', 'transform': 'translateX(-50%)', 'bottom': `${screen.height/2-250}px`})
        $('#HUD-shopCont').fadeIn(400)
        $('#HUD-shopList1').fadeIn(400)
      }
    }
  })
})
