const admin = require('firebase-admin');
const functions = require('firebase-functions');


//Firebase Admin SDK - Auth
var serviceAccount = require("../social-ape-ca574-firebase-adminsdk-vkk1f-65b32846df.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-ape-ca574.firebaseio.com"
});

//Functions
exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("HelloMan");
});

exports.getScreams = functions.https.onRequest((req, res) => {
    admin.firestore().collection('screams').get()
        .then(data=>{
            let screams = [];
            data.forEach(doc => {
                screams.push(doc.data());
            })
            return res.json(screams);
        })
        .catch(err => console.error(err));
});

exports.createScream = functions.https.onRequest((req, res) => {
    if(req.method !== 'POST'){
        return res.status(400).json({error: 'Method not allowed'});
    }

    const newScream = {
        body: req.body.body,
        userhandle:req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };

    admin
        .firestore()
        .collection('screams')
        .add(newScream)
        .then(doc => {
            res.json({message: `document ${doc.id} created succesfully`});
        })
        .catch(err => {
            res.status(500).json({error: 'something went wrong (Rafael)'});
            console.error(err);
        });
   });