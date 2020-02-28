const admin = require('firebase-admin');
const functions = require('firebase-functions');
const app = require('express')();

// //Init - No Auth
// admin.initializeApp();
//Firebase Admin SDK - Auth
var serviceAccount = require("../social-ape-ca574-firebase-adminsdk-vkk1f-65b32846df.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-ape-ca574.firebaseio.com"
});

// Your web app's Firebase configuration
// Needed for Login
const firebaseConfig = {
apiKey: "AIzaSyAws6yH2s4WrYIY5IoYNHqVhjiYpsSZ1Rw",
authDomain: "social-ape-ca574.firebaseapp.com",
databaseURL: "https://social-ape-ca574.firebaseio.com",
projectId: "social-ape-ca574",
storageBucket: "social-ape-ca574.appspot.com",
messagingSenderId: "511264358668",
appId: "1:511264358668:web:6af970bda38a49b7db4929",
measurementId: "G-68ZSTQ207H"
};
const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

// Shortcut for admin.firestore()
const db = admin.firestore();


// Functions Using Express
// Get Screams
app.get('/screams', (req, res) => {
    db
    .collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data=>{
        let screams = [];
        data.forEach(doc => {
            screams.push({
                screamId: doc.id,
                body: doc.data().body,
                userHandle: doc.data().userHandle,
                createdAt: doc.data().createdAt
            });
        })
        return res.json(screams);
    })
    .catch(err => console.error(err));
})

// Post Scream
app.post('/scream', (req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle:req.body.userHandle,
        createdAt: new Date().toISOString()
    };
    db
    .collection('screams')
    .add(newScream)
    .then(doc => {
        res.json({message: `document ${doc.id} created succesfully`});
    })
    .catch(err => {
        res.status(500).json({error: 'something went wrong (Rafael)'});
        console.error(err);
    });
})

//Signup Route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    }
    //Validate Data
    let token, userId;
    db
    .doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
        if(doc.exists){
            return res.status(400).json({handle: 'this handle is already taken'});
        } else {
            return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
        }
    })
    .then(data => {
        userId = data.user.uid;
        return data.user.getIdToken();
    })
    .then(idToken => {
        token = idToken;
        const userCredentials = {
            handle: newUser.handle,
            email: newUser.email,
            createdAt: new Date().toISOString(),
            userId: userId
        };
        return db.doc(`/users/ ${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
        return res.status(201).json({ token: token })
    })
    .catch(err => {
        console.error(err);
        if(err.code === "auth/email-already-in-use"){
            return res.status(400).json({ email: 'email already in use' });
        } else {
            return res.status(500).json({error : err.code});
        }
    });

    // //Simple auth (not validated) 
    // firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
    //     .then(data => {
    //         return res.status(201).json({message: `user ${data.user.uid} signed up succesfully`});
    //     })
    // .catch(err => {
    //      console.error(err);
    //      return res.status(500).json({error: err.code});
    // })
});

// https://baseurl.com/api/
exports.api = functions.https.onRequest(app);