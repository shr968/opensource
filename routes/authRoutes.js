const express = require('express');
const router = express.Router();
const { db, auth: adminAuth } = require('../config/firebaseAdmin');
const { auth, sendPasswordResetEmail } = require('../config/firebase'); 
const { signInWithEmailAndPassword } = require("firebase/auth");
const bcrypt = require('bcrypt');
router.get("/login", (req, res) => {
    res.render("login");
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential) {
            res.redirect('/dashboard');
        }
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(401).send('Invalid credentials');
    }
});
router.get("/register", (req, res) => {
    res.render("register");
});
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!password || password.length < 6) {
        return res.status(400).send("Password must be at least 6 characters long.");
    }

    try {
        const userSnapshot = await db.collection('users').where('email', "==", email).get();
        if (!userSnapshot.empty) 
            return res.send('User already exists');
        const userRecord = await adminAuth.createUser({
            email,
            password 
        });
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.collection('users').doc(userRecord.uid).set({
            email,
            hashedPassword 
        });

        res.redirect('/login');
    } catch (error) {
        console.error("Error creating new user:", error);
        res.status(500).send("Error registering user");
    }
});
router.get('/forgot-password', (req, res) => {
    res.render('forgotPassword');
});
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const userRecord = await adminAuth.getUserByEmail(email);
        if (!userRecord) {
            return res.status(404).send('User not found.');
        }
        await sendPasswordResetEmail(auth, email);
        res.send('Reset password email sent. Please check your inbox.');
    } catch (error) {
        console.error("Error sending password reset email:", error);
        res.status(500).send("Error sending reset email");
    }
});
router.get('/upload',(req,res)=>{
    res.render('upload');
})
router.post('/upload', async (req, res) => {
    const { projectName, projectDescription, githubLink } = req.body;
    try {
        const response = await db.collection('projects').add({
            projectName,
            projectDescription,
            githubLink,
            createdAt: new Date()
        });
        if (response) res.redirect('/projects');
        else res.send('Error saving your project');
    } catch (err) {
        console.log(err);
    }
});
router.get('/dashboard',(req,res)=>{
    res.render('dashboard')
})
router.get('/projects', async (req, res) => {
    try {
        const projectsSnapshot = await db.collection('projects').get();
        const projects = projectsSnapshot.docs.map(doc => doc.data());
        res.render('projects', { projects });
    } catch (error) {
        console.error("Error fetching projects: ", error);
        res.status(500).send("Error retrieving projects");
    }
});

module.exports = router;
