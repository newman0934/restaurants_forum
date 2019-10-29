const restContooler = require("../controllers/restControllers")

module.exports = app => {
    app.get("/",(req,res) => {
        res.redirect("/restaurants")
    })

    app.get("/restaurants", restContooler.getRestaurants)
}