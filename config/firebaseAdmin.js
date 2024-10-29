const admin = require("firebase-admin");
const serviceAccount = require("./opensourceuvce-fee8c-firebase-adminsdk-sk1ij-6a698d897a.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://opensourceuvce-fee8c.firebaseio.com" 
});

const db = admin.firestore(); 
const auth = admin.auth();    

module.exports = { db, auth };
