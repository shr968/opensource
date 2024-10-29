const express = require('express');
const app = express();
const port = 4000
const authRoutes = require('./routes/authRoutes');
const path = require('path');
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(authRoutes);
app.get('/',(req,res)=>{
    res.send('index.html');
})
app.listen(port,()=>{
    console.log(`The server is running on port ${port}`);
})



