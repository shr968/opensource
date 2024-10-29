const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const {db,auth} = require('../config/firebaseAdmin');
const {sendOtp}=require('../services/otpService')
let otpStorage = {};
router.get("/login", (req, res) => {
    res.render("login"); 
  });

router.get("/register",(req,res)=>{
    res.render("register")
});
router.post('/register',async (req,res)=>{
    const {email,password}=req.body;
    try{
        const userSnapshot = await db.collection('users').where('email',"==",email).get();
        if(!userSnapshot.empty)
            res.send('User already exists')
        const hashedPassword = await bcrypt.hash(password,10);
        const userRecord = await auth.createUser({
            email,
            password:hashedPassword
        })
        await db.collection('users').doc(userRecord.uid).set({
            email,
            password:hashedPassword
        });
        res.redirect('/login');
    } catch (error) {
        console.error("Error creating new user:", error);
        res.status(500).send("Error registering user");
    }
})
router.post('/login',async (req,res)=>{
    const {email, password}=req.body;
    try{
        const userSnapshot = await db.collection('users').where('email',"==",email).get();
        if(userSnapshot.empty)
            return res.status(400).send('User not found');
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        const hashedPassword = userData.password;
        const match = await bcrypt.compare(password, hashedPassword);
        if (match) {
            res.redirect('/dashboard');
        } else {
            res.status(401).send('Invalid credentials'); 
        }
    }catch(err){
        console.log(err);
    }
})

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body; 

    try {
        const userSnapshot = await db.collection('users').where('email', '==', email).get(); 

        if (userSnapshot.empty) {
            return res.status(400).send('User not found'); 
        }

        const otp = await sendOtp(email); 
        otpStorage[email] = otp; 
        res.send('OTP sent to your email'); 
    } catch (error) {
        console.error('Error requesting OTP:', error);
        res.status(500).send('Error sending OTP'); 
    }
});

router.patch('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body; 
    if (otpStorage[email] !== otp) {
        return res.status(400).send('Invalid OTP'); 
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10); 
        await db.collection('users').doc(email).update({ password: hashedPassword }); 
        delete otpStorage[email]; 
        res.send('Password reset successfully'); 
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).send('Error resetting password'); 
    }
});

router.get('/forgot-password', (req, res) => {
    res.render('forgotPassword'); 
});

router.get('/reset-password', (req, res) => {
    res.render('resetPassword'); 
});
router.get('/dashboard',(req,res)=>{
    res.render('dashboard');
})
router.get('/upload',(req,res)=>{
    res.render('upload')
})
router.post('/upload',async (req,res)=>{
    const {projectName, projectDescription, githubLink} = req.body;
    try{
        const response = await db.collection('projects').add({
            projectName,
            projectDescription,
            githubLink,
            createdAt: new Date()
        });
        if(response)
            res.redirect('/projects')
        else
            res.send('Error saving your project')
    }catch(err){
        console.log(err);
    }
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