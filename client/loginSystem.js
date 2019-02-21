$(() => {
  // NAV Login button click
  $('#playScreen #nav #login').on('click', () => {
    $('#playScreen #nav #login').addClass('selected')
    $('#playScreen #nav #playAsGuest').removeClass('selected')
    $('#playScreen').animate({'height': '340px'}, 100, () => {
      $('#playScreen #content').html('<div id="firebaseui-auth-container">')
      firebaseUI.start('#firebaseui-auth-container', firebaseUIconfig)
    })

  })

  // Register button click
  $('#playScreen #nav #register').on('click', () => {
    $('#playScreen #content').html(`
      <input type="text" id="username" placeholder="username" maxlength="20"></input>
      <input type="email" id="email" placeholder="email" maxlength="20"></input>
      <input type="password" id="password" placeholder="password" maxlength="20"></input>
      <input type="password" id="passwordConfirm" placeholder="Confirm Password" maxlength="20"></input>
      <div id="playButton">Play</div>
    `)
  })


  // NAV playAsGuest button click
  $('#playScreen #nav #playAsGuest').on('click', () => {
    $('#playScreen #nav #playAsGuest').addClass('selected')
    $('#playScreen #nav #login').removeClass('selected')
    $('#playScreen #content').html(`
      <input type="text" id="nameInput" placeholder="username" maxlength="20"></input>
      <div id="playButton">Play</div>
    `)
  })
})



// FirebaseUI config.
let firebaseUIconfig = {
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      requireDisplayName: false
    },
  ],
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  tosUrl: '<your-tos-url>',
  signInFlow: 'popup',
  privacyPolicyUrl: '<your-privacy-policy-url>',
  callbacks: {
    signInSuccessWithAuthResult: function(authResult) {
      firebaseUser = authResult.user
      console.log(authResult)
      loggedIn()
    }
  }
}
let firebaseUI = new firebaseui.auth.AuthUI(firebase.auth())


function loggedIn() {
  socket.emit('getUsername')
  $('#playScreen #nav').remove()
  $('#playScreen #content').html(`
    <input type="text" id="nameInput" placeholder="username" maxlength="20"></input>
    <div id="playButton">Play</div>
  `)
}