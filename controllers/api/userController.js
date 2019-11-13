const bcrypt = require("bcrypt-nodejs")
const db = require("../../models")
const User = db.User

const jwt = require("jsonwebtoken")
const passportJWT = require("passport-jwt")
const JwtStrategy = passportJWT.Strategy
const ExtractJwt = passportJWT.ExtractJwt

let userController = {
    signIn : (req, res) => {
        if(!req.body.email || !req.body.password){
            return res.json({status: "error", message: "required fields didn't exist"})
        }
        let username = req.body.email
        let password = req.body.password

        User.findOne({ where: {email: username}}).then(user => {
            if(!user) return res.status(401).json({status: "error", message: "no such user found"})
            if(!bcrypt.compareSync(password, user.password)){
                return res.status(401).json({ status: 'error', message: 'passwords did not match' })
            }
            let payload = {id: user.id}
            let token = jwt.sign(payload, "alphacamp")
            return res.json({
                status: "success",
                message: "ok",
                token: token,
                user: {
                    id:user.id, name: user.name, email: user.email, isAdmin: user.isAdmin
                }
            })
        })
    }

}
module.exports = userController