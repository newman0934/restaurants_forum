const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const Comment = db.Comment
const fs = require("fs")
const imgur = require("imgur-node-api")
const IMGUR_CLIENT_ID = "aa4a5e6ee3ad18c"

const adminController = {
    getRestaurants: (req, res) => {
        return Restaurant.findAll({include: [Category]}).then(restaurants => {
            return res.render("admin/restaurants", {
                restaurants: restaurants
            })
        })
    },
    createRestaurant: (req, res) => {
        Category.findAll().then(categories => {
            return res.render("admin/create",{
                categories
            })
        })
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
            imgur.setClientID(IMGUR_CLIENT_ID)
            imgur.upload(file.path, (err, img) => {
                return Restaurant.create({
                    name: req.body.name,
                    tel: req.body.tel,
                    address: req.body.address,
                    opening_hours: req.body.opening_hours,
                    description: req.body.description,
                    image: file ? img.data.link : null,
                    CategoryId: req.body.categoryId
                }).then((restaurant) => {
                    req.flash("success_messages", "restaurant was sucessfully created")
                    res.redirect("/admin/restaurants")
                })
            })
        } else {
            return Restaurant.create({
                name: req.body.name,
                tel: req.body.tel,
                address: req.body.address,
                opening_hours: req.body.opening_hours,
                description: req.body.description,
                image: null,
                CategoryId: req.body.categoryId
            }).then((restaurant) => {
                req.flash("success_messages", "restaurant was sucessfully created")
                res.redirect("/admin/restaurants")
            })
        }
    },
    getRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id, {include: [Category]}).then(restaurant => {
            return res.render("admin/restaurant", {
                restaurant
            })
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
        if (!req.body.name) {
            req.flash("error_messages", "name didn't exist")
            return req.redirect("back")
        }
        const {
            file
        } = req
        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID)
            imgur.upload(file.path, (err, img) => {
                return Restaurant.findByPk(req.params.id)
                .then((restaurant) => {
                    restaurant.update({
                        name: req.body.name,
                        tel: req.body.tel,
                        address: req.body.address,
                        opening_hours: req.body.opening_hours,
                        description: req.body.description,
                        image: file ? img.data.link : restaurant.image,
                        CategoryId: req.body.categoryId
                    }).then((restaurant) => {
                        req.flash('success_messages', 'restaurant was successfully to update')
                        res.redirect('/admin/restaurants')
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
                        image: restaurant.image,
                        CategoryId: req.body.categoryId
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
                    }).then((user) => {
                        req.flash("success_messages",  `${user.name}成功更改為一般使用者`)
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
    getUser: (req,res) => {
        if(req.user.id == req.params.id){
            return User.findByPk(req.params.id,{
                include:[
                    Comment, {model: Comment, include: [Restaurant]}
                ]
            }).then(user => {
                let totalComments = user.dataValues.Comments.length
                let commentRestaurant = []
   
                user.Comments.map(item => {
                    commentRestaurant.push(item.Restaurant.image)                    
                })
                
                return res.render("user",{user,totalComments,commentRestaurant})
            })
        }else{
            req.flash("error_messages","id不符")
            return res.redirect(`/users/${req.user.id}`)
        }
    },
    editUser: (req,res) => {
        if(req.user.id == req.params.id){
            return User.findByPk(req.params.id).then(user => {
                return res.render("editUser",{user})
            })
        }else{
            req.flash("error_messages","id不符")
            return res.redirect(`/users/${req.user.id}/edit`)
        }
  
    },
    putUser: (req,res) =>{
        const {file} = req
        console.log(file)
        if(file){

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
        }else{
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