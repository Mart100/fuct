const admin = require("firebase-admin")
let database

module.exports = {
  connect() {
    let serviceAccount = require("../firebaseCredentials.json")
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://fuct-a1df5.firebaseio.com"
    })
    database = admin.database()
  },
  createUser(data) {
    let userInfo = {}
    if(data.email) userInfo.email = data.email
    if(data.username) userInfo.displayName = data.username
    if(data.password) userInfo.password = data.password
    admin.auth().createUser(userInfo)
      .then(userRecord => { console.log("Successfully created new user:", userRecord.uid) })
      .catch(err => { console.log("Error creating new user:", err) })
  },
  getUser(uid) {
    admin.auth().getUser(uid)
      .then(userRecord => { return userRecord.toJSON() })
      .catch(error => { console.log("Error fetching user data:", error) })

  }
}