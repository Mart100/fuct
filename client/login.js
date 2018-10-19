function register() {
  $("#errorMessage").hide()
  var nameInput = $("#nameInput").val()
  var passwordInput = $("#passwordInput").val()
  var hashPass = SHA256(passwordInput)
  database.ref('users').once('value').then(function(snapshot) {
    console.log(snapshot.val())
    for(var name in snapshot.val()) {
      if(name == nameInput) {
        $("#errorMessage").html('That name is already taken!')
        $("#errorMessage").show()
        return
      }
    }
    socket.emit('firebaseUser', {
      username: nameInput,
      password: hashPass
    })
    $("errorMessage").html("Succesfully registered, press login to login!")
  });
  

}
function login() {
  $("#errorMessage").hide()
  database.ref('users').once('value').then(function(snapshot) {
    console.log(snapshot.val())
    for(var name in snapshot.val()) {
      if(name == $("#nameInput").val()) {
        if(SHA256($("#passwordInput").val()) == snapshot.val()[name].password) {
          player.spawned = true


          player.id = socket.id
          if($('#nameInput').val() != '') player.username = $('#nameInput').val()
          // Decide player's color
          player.color = `rgb(${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)})`
          // send name and color
          socket.emit('players', { id: socket.id, type: 'newplayer', player: {color: player.color, username: player.username }})
          $("#loginScreen").hide()
          $('#backgroundOpacity').animate({'opacity': '0'}, 500, () => $('#backgroundOpacity').remove())
          return
        }
      }
    }
    $("#errorMessage").html("Wrong password or unkown username")
    $("#errorMessage").show()
  });
}