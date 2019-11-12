const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const Comment = db.Comment
const fs = require("fs")
const imgur = require("imgur-node-api")
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = {
    getRestaurants: (req, res, callback) => {
        return Restaurant.findAll({
            include: [Category]
        }).then(restaurants => {
            callback({restaurants})
        })
    },
    getRestaurant: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id, { include: [Category]}).then(restaurant => {
            callback({restaurant})
        })
    },
    deleteRestaurant: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id)
        .then(restaurant => {restaurant.destroy()})
        .then(restaurant => callback({status:"success", message: "success"}))
    }
}

module.exports = adminService