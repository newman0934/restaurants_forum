const db = require("../models")
const Restaurant = db.Restaurant
const Category = db.Category
const pageLimit = 10
const Comment = db.Comment
const User = db.User


let restController = {
  getRestaurants: (req, res) => {
    let offset = 0
    let whereQuery = {}
    let categoryId = ""

    if(req.query.page){
      offset = (req.query.page - 1) * pageLimit
    }
    if(req.query.categoryId){
      categoryId = Number(req.query.categoryId)
      whereQuery["categoryId"] = categoryId
    }
    Restaurant.findAndCountAll({include: Category, where:whereQuery, offset:offset, limit: pageLimit}).then(results => {
      let page = Number(req.query.page) || 1
      let pages = Math.ceil(results.count / pageLimit)
      let totalPage = Array.from({ length: pages}).map((item, index) => index + 1)
      let prev = page - 1 < 1 ? 1 : page - 1
      let next = page + 1 > pages ? pages: page + 1

      const data = results.rows.map(r => ({
        ...r.dataValues,
        description:r.dataValues.description.substring(0,50),
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
        isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)
      }))
      Category.findAll().then( categories => {
        return res.render("restaurants", {
          restaurants:data,
          categories,
          categoryId,
          page,
          totalPage,
          prev,
          next
        })
      })
    })
  },
  getRestaurant: (req,res) =>{
    return Restaurant.findByPk(req.params.id,{
      include: [
        Category,
        {model:User, as:"FavoritedUsers"},
        {model:User, as:"LikedUsers"},
        {model:Comment, include:[User]}
      ]
    }).then(restaurant => {
      restaurant.increment("viewCounts")
      const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
      const isLiked = restaurant.LikedUsers.map(d => d.id).includes(req.user.id)
      return res.render("restaurant",{restaurant, isFavorited, isLiked})
    })
  },
  getFeeds: (req, res) => {
    return Restaurant.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [Category]
    }).then(restaurants => {
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      }).then(comments => {
        return res.render('feeds', {
          restaurants: restaurants,
          comments: comments
        })
      })
    })
  },
  getDashboard: (req,res) => {
    return Restaurant.findByPk(req.params.id, {include: [Category, Comment]}).then(restaurant =>{
      res.render("dashboard",{restaurant})
    })
  }
};

module.exports = restController;
