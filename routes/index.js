const restControllers = require("../controllers/restControllers");
const adminController = require("../controllers/adminController");
const userController = require("../controllers/userController");
const categoryController = require("../controllers/categoryController")
const commentController = require("../controllers/commentController")
const multer = require("multer")
const upload = multer({
    dest: "temp/"
})

module.exports = (app, passport) => {
    const authenticated = (req, res, next) => {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/signin')
    }
    const authenticatedAdmin = (req, res, next) => {
        if (req.isAuthenticated()) {
            if (req.user.isAdmin) {
                return next()
            }
            return res.redirect('/')
        }
        res.redirect('/signin')
    }

    app.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))
    app.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
    app.get("/admin/restaurants/create", authenticatedAdmin, adminController.createRestaurant)
    app.post('/admin/restaurants', authenticatedAdmin, upload.single("image"), adminController.postRestaurant)
    app.get("/admin/restaurants/:id", authenticatedAdmin, adminController.getRestaurant)
    app.get("/admin/restaurants/:id/edit", authenticatedAdmin, adminController.editRestaurant)
    app.put('/admin/restaurants/:id', authenticatedAdmin, upload.single("image"), adminController.putRestaurant)
    app.delete("/admin/restaurants/:id", authenticatedAdmin, adminController.deleteRestaurant)

    app.get("/admin/categories", authenticatedAdmin, categoryController.getCategories)
    app.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)
    app.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)
    app.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)
    app.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

    app.get('/admin/users', authenticatedAdmin, adminController.editUsers)
    app.put('/admin/users/:id', authenticatedAdmin, adminController.putUsers)

    app.get('/users/top', authenticated, userController.getTopUser)
    app.post('/following/:userId', authenticated, userController.addFollowing)
    app.delete('/following/:userId', authenticated, userController.removeFollowing)
    app.get("/users/:id", authenticated, adminController.getUser)
    app.get("/users/:id/edit", authenticated, adminController.editUser)
    app.put("/users/:id", authenticated, upload.single('image'), adminController.putUser)

    app.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
    app.get('/restaurants', authenticated, restControllers.getRestaurants)
    app.get("/restaurants/feeds", authenticated, restControllers.getFeeds)
    app.get('/restaurants/top', authenticated, restControllers.getTopRestaurants)
    app.get('/restaurants/:id', authenticated, restControllers.getRestaurant)
    app.get('/restaurants/:id/dashboard', authenticated, restControllers.getDashboard)
    app.get("/signup", userController.signUpPage);
    app.post("/signup", userController.signUp);

    app.get("/signin", userController.signInPage);
    app.post(
        "/signin",
        passport.authenticate("local", {
            failureRedirect: "/signin",
            failureFlash: true
        }),
        userController.signIn
    );

    app.post("/comments", authenticated, commentController.postComment)
    app.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)
    app.get("/logout", userController.logout);

    app.post("/favorite/:restaurantId", authenticated, userController.addFavorite)
    app.delete("/favorite/:restaurantId", authenticated, userController.removeFavorite)

    app.post('/like/:restaurantId', authenticated, userController.addLike)
    app.delete('/like/:restaurantId', authenticated, userController.removeLike)
    


};