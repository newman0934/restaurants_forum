const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const fs = require("fs")

const adminController = {
    getRestaurants: (req, res) => {
        return Restaurant.findAll().then(restaurants => {
            return res.render("admin/restaurants", {
                restaurants: restaurants
            })
        })
    },
    createRestaurant: (req, res) => {
        return res.render("admin/create")
    },
    postRestaurant: (req, res) => {
        if (!req.body.name) {
            req.flash("error_messages", "name didn't exist")
            return res.redirect("back")
        }

        const {
            file
        } = req
        if (file) {
            fs.readFile(file.path, (err, data) => {

                if (err) console.log("Error: ", err)
                fs.writeFile(`upload/${file.originalname}`, data, () => {
                    return Restaurant.create({
                        name: req.body.name,
                        tel: req.body.tel,
                        address: req.body.address,
                        opening_hours: req.body.opening_hours,
                        description: req.body.description,
                        image: file ? `/upload/${file.originalname}` : null
                    }).then((restaurant) => {
                        req.flash("success_messages", "restaurant was sucessfully created")
                        res.redirect("/admin/restaurants")
                    })
                })
            })
        } else {
            return Restaurant.create({
                name: req.body.name,
                tel: req.body.tel,
                address: req.body.address,
                opening_hours: req.body.opening_hours,
                description: req.body.description,
                image: null
            }).then((restaurant) => {
                req.flash("success_messages", "restaurant was sucessfully created")
                res.redirect("/admin/restaurants")
            })
        }
    },
    getRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id).then(restaurant => {
            return res.render("admin/restaurant", {
                restaurant
            })
        })
    },
    editRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id).then(restaurant => {
            return res.render("admin/create", {
                restaurant
            })
        })
    },
    putRestaurant: (req, res) => {
        console.log(req)
        if (!req.body.name) {
            req.flash("error_messages", "name didn't exist")
            return req.redirect("back")
        }
        const {
            file
        } = req
        if (file) {
            fs.readFile(file.path, (err, data) => {
                if (err) console.log('Error: ', err)
                fs.writeFile(`upload/${file.originalname}`, data, () => {
                    return Restaurant.findByPk(req.params.id)
                        .then((restaurant) => {
                            restaurant.update({
                                name: req.body.name,
                                tel: req.body.tel,
                                address: req.body.address,
                                opening_hours: req.body.opening_hours,
                                description: req.body.description,
                                image: file ? `/upload/${file.originalname}` : restaurant.image
                            }).then((restaurant) => {
                                req.flash('success_messages', 'restaurant was successfully to update')
                                res.redirect('/admin/restaurants')
                            })
                        })
                })
            })
        } else {
            return Restaurant.findByPk(req.params.id)
                .then((restaurant) => {
                    restaurant.update({
                        name: req.body.name,
                        tel: req.body.tel,
                        address: req.body.address,
                        opening_hours: req.body.opening_hours,
                        description: req.body.description,
                        image: restaurant.image
                    }).then((restaurant) => {
                        req.flash('success_messages', 'restaurant was successfully to update')
                        res.redirect('/admin/restaurants')
                    })
                })
        }
    },
    deleteRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id).then((restaurant) => {
            restaurant.destroy().then((restaurant) => {
                res.redirect("/admin/restaurants")
            })
        })
    },
    editUsers: (req, res) => {
        return User.findAll().then(users => {
            return res.render("admin/users", {
                users
            })
        })
    },
    putUsers: (req, res) => {
        User.findByPk(req.params.id)
            .then(user => {
                if (user.isAdmin) {
                    user.update({
                        isAdmin: false
                    }).then(() => {
                        return res.redirect('/admin/users')
                    })
                } else {
                    user.update({
                        isAdmin: true
                    }).then(() => {
                        return res.redirect('/admin/users')
                    })
                }
            })
    }
}

module.exports = adminController