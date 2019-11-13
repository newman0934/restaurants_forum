const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const Comment = db.Comment
const fs = require("fs")
const imgur = require("imgur-node-api")
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const adminService = require("../services/adminService")
const adminController = {
    getRestaurants: (req, res) => {
      adminService.getRestaurants(req, res, (data) => {
          return res.render("admin/restaurants", data)
      })
    },
    createRestaurant: (req, res) => {
        Category.findAll().then(categories => {
            return res.render("admin/create", {
                categories
            })
        })
    },
    postRestaurant: (req, res) => {
        adminService.postRestaurant(req, res, (data) => {
            if(data["status"] === "error"){
                req.flash("error_messages", data["message"])
                return res.redirect("back")
            }
            req.flash("success_messages", data["message"])
            res.redirect("/admin/restaurants")
        })
    },
    getRestaurant: (req, res) => {
        adminService.getRestaurant(req, res, (data) => {
            return res.render("admin/restaurant", data)
        })
    },
    editRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id).then(restaurant => {
            Category.findAll().then(categories => {
                return res.render("admin/create", {
                    categories,
                    restaurant
                })
            })
        })
    },
    putRestaurant: (req, res) => {
        adminService.putRestaurant(req, res, (data) => {
            if(data["status"] === "error"){
                req.flash("error_messages", data["message"])
                return res.redirect("back")
            }
            req.flash("success_messages", data["message"])
            res.redirect("/admin/restaurants")
        })
    },
    deleteRestaurant: (req, res) => {
        adminService.deleteRestaurant(req, res, (data) => {
            if(data["status"] === "sucecss"){
                return res.redirect("/admin/restaurants")
            }
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
                    }).then((user) => {
                        req.flash("success_messages", `${user.name}成功更改為一般使用者`)
                        return res.redirect('/admin/users')
                    })
                } else {
                    user.update({
                        isAdmin: true
                    }).then((user) => {
                        req.flash("success_messages", `${user.name}成功更改為管理員`)
                        return res.redirect('/admin/users')
                    })
                }
            })
    },
    getUser: (req, res) => {
        return User.findByPk(req.params.id, {
            include: [
                Comment,
                {model: Comment, include: [Restaurant]},
                {model: User, as: "Followers"},
                {model: User, as: "Followings"},
                {model: Restaurant, as:"FavoritedRestaurants"}
            ]
        }).then(user => {
            let set = new Set()
            let commentRestaurant = user.Comments.filter(item =>!set.has(item.Restaurant.id)?  set.add(item.Restaurant.id): false)
            return res.render("user", {
                user,
                commentRestaurant,
                userId: req.user.id
            })
        })
        return res.redirect(`/users/${req.user.id}`)
    },
    editUser: (req, res) => {
        if (req.user.id == req.params.id) {
            return User.findByPk(req.params.id).then(user => {
                return res.render("editUser", {
                    user
                })
            })
        } else {
            req.flash("error_messages", "id不符")
            return res.redirect(`/restaurants`)
        }

    },
    putUser: (req, res) => {
        const {
            file
        } = req
        if (file) {

            imgur.setClientID(IMGUR_CLIENT_ID)
            imgur.upload(file.path, (err, img) => {
                return User.findByPk(req.params.id).then(user => {
                    user.update({
                        name: req.body.name,
                        image: file ? img.data.link : user.image
                    }).then(user => {
                        req.flash("success.messages", "資料已修改")
                        res.redirect(`/users/${user.id}`)
                    })
                })
            })
        } else {
            return User.findByPk(req.params.id).then(user => {
                user.update({
                    name: req.body.name,
                    image: user.image
                }).then(user => {
                    req.flash("success.messages", "資料已修改")
                    res.redirect(`/users/${user.id}`)
                })
            })
        }

    }
}

module.exports = adminController