const admin = require('firebase-admin');

// //Init - No Auth
// admin.initializeApp();
//Firebase Admin SDK - Auth
var serviceAccount = require("../../social-ape-ca574-firebase-adminsdk-vkk1f-65b32846df.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-ape-ca574.firebaseio.com",
  storageBucket: "gs://social-ape-ca574.appspot.com"
});

// Shortcut for admin.firestore()
const db = admin.firestore();



//Export variables
module.exports = { admin, serviceAccount, db };
