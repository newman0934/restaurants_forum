const express = require('express')
const handlebars = require("express-handlebars")
const db = require("./models")
const app = express()
const port = 3000
const bodyParser = require("body-parser")
app.engine("handlebars",handlebars({ defaultLayout: 'main' }))
app.set("view engine","handlebars")

app.use(bodyParser.urlencoded({extended:true}))


app.listen(port, () => {
    db.sequelize.sync()
  console.log(`Example app listening on port ${port}!`)
})

require("./routes")(app)