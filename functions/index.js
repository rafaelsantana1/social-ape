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


//Auxiliary functions
const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; 
    if(email.match(emailRegEx)) return true;
    else return false;
}

const isEmpty = (string) => {
    if(string.trim() === '') return true;
    else return false;
}

//Signup Route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    }

    //Validate Data - Client
    let errors = {};

    if(isEmpty(newUser.email)){
        errors.email = 'Email must not be empty'
    } else if(!isEmail(newUser.email)){
        errors.email = 'Must be a valid email address'
    }
    if(isEmpty(newUser.password))                       errors.password = 'Password must not be empty'
    if(newUser.confirmPassword !== newUser.password)    errors.confirmPassword = 'Passwords must match'
    if(isEmpty(newUser.handle))                         errors.handle = 'Handle must not be empty'

    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    //Validate Data - Server
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

//Login route
app.post('/login', (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    }

    let errors = {};

    if (isEmpty(user.email)) errors.email = "Must not be empty";
    if (isEmpty(user.password)) errors.password = "Must not be empty";

    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.json({token});
        })
        .catch(err => {
            console.error(err);
            if(err.code === 'auth/wrong-password'){
                return res.status(403).json({ general: 'Wrong credentials'});
            } else return res.status(500).json({error: err.code});
        })
})




// https://baseurl.com/api/
exports.api = functions.https.onRequest(app);