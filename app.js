const express = require('express')
const db = require("./models")
const app = express()
const port = 3000

const methodOverride = require("method-override")
app.use(methodOverride("_method"))

const handlebars = require("express-handlebars")
app.engine("handlebars",handlebars({ defaultLayout: 'main' }))
app.set("view engine","handlebars")

const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({extended:true}))

const session =require("express-session")
app.use(session({secret:"secret", resave:"false",saveUninitialized:"false"}))

const flash = require("connect-flash")
app.use(flash())

const passport = require("./config/passport")

app.use(passport.initialize())
app.use(passport.session())

app.use((req,res,next) => {
    res.locals.success_messages = req.flash("success_messages")
    res.locals.error_messages = req.flash("error_messages")
    res.locals.user = req.user
    next()
})



app.listen(port, () => {
    db.sequelize.sync()
  console.log(`Example app listening on port ${port}!`)
})

require("./routes")(app, passport)