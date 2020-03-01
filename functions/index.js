const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');
const { 
    getAllScreams, 
    postOneScream, 
    getScream,
    commentOnScream
 } = require('./handlers/screams');
const { 
    signup, 
    login, 
    uploadImage, 
    addUserDetails, 
    getAuthenticatedUser
} = require('./handlers/users');


//screams routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);
app.get('/scream/:screamId', getScream);
//To-do
//delete scream
//like a scream
//unlike a scream
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);

//users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);


// https://baseurl.com/api/
exports.api = functions.https.onRequest(app);