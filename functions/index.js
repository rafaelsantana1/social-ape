const functions = require('firebase-functions');
const app = require('express')()
const { getAllScreams, postOneScream } = require('./handlers/screams')
const FBAuth = require('./util/fbAuth')
const { signup, login } = require('./handlers/users')


//screams routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);
//users routes
app.post('/signup', signup);
app.post('/login', login);


// https://baseurl.com/api/
exports.api = functions.https.onRequest(app);