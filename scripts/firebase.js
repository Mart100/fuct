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
  getUser(uid) {
    admin.auth().getUser(uid)
      .then(userRecord => { return userRecord.toJSON() })
      .catch(error => { console.log("Error fetching user data:", error) })

  }
}