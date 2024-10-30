const { initializeApp } = require("firebase/app");
const { getAuth, sendPasswordResetEmail } = require("firebase/auth");
const firebaseConfig = {
  apiKey: "AIzaSyCVU661S38ZOW536VVX-a_TcNRfa_YtAHM",
  authDomain: "opensourceuvce-fee8c.firebaseapp.com",
  projectId: "opensourceuvce-fee8c",
  storageBucket: "opensourceuvce-fee8c.appspot.com",
  messagingSenderId: "263262308670",
  appId: "1:263262308670:web:a9d5296b3b442af62bc46f",
  measurementId: "G-W9FQ1KX1WT"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 

module.exports = { auth, sendPasswordResetEmail };
