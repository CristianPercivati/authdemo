const express = require("express")
const session = require("express-session")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const User = require("./models/user.js")


const app = express()

app.set("view engine","ejs")
app.set("views","views")

app.use(session({secret: 'secretpass', resave: false, saveUninitialized: false}))
app.use(express.urlencoded({extended: true}))

const mongoConnect = async() => {
    await mongoose.connect('mongodb+srv://cpercivati:cpercivati@cluster0.po0m89e.mongodb.net/authDemo', {useNewUrlParser: true})
    .then( () => {console.log("conectado")})
    .catch( () => {console.log("error")})
}

mongoConnect()

const requiredLoginMiddleware = (req, res, next) => {
    if (!req.session.user_id){
        res.redirect("/login")
    } else {
        next()
    }
}
app.get('/register', (req,res) => {
    console.log(req.session.user_id)
    if(req.session.user_id){
        res.send("You're already registered.")
    }
    else{
        res.render('register')
    }
})
app.post('/register', async (req,res)=>{
    
    const {password, username} = req.body
    const passwordHashed = await bcrypt.hash(password,12)
    const user = new User({
        username: username,
        pass: passwordHashed    
    })
    const userExists = await User.findOne({username})
    console.log(userExists)
    if (!userExists){
    req.session.user_id=user._id
    user.save()
    res.send("You're registered.")
    }
    else{
        res.send("User already exists.")
    }
})

app.get('/login', (req,res) => {
    if(req.session.user_id){
    res.redirect("/result")
    }
    else{
    res.render("login")
    }
})

app.post('/login', async(req,res) => {
    const {username, password} = req.body
    const user = await User.findOne({ username })
    let isLogged = false
    if (user){
        const validPassword = await bcrypt.compare(password,user.pass)
        isLogged = validPassword ? true : false
        if (isLogged){
            req.session.user_id=10
            res.redirect("/result")
        }else{
            res.send("Contraseña incorrecta")
        }
    }
    else{
        res.send("Usuario incorrecto")
    }
})

app.get("/logout", requiredLoginMiddleware, (req, res) => {
req.session.user_id=null
// o req.session.destroy()
res.redirect("/login")
})

app.get("/result", requiredLoginMiddleware, (req, res) => {
        res.send("You're logged!")
})

app.listen(3000, () => {
    console.log("App running on port 3000.")
})