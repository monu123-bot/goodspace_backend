const { default: mongoose } = require('mongoose')
const Users = mongoose.model('users');
const jwt = require('jsonwebtoken')

const Auth = async (req, res,next) => {

    try {
        const header = req.headers['authorization']
        const token = header && header.split(' ')[1]
        console.log(token)
        if (token == null) {
            return res.status(400).json({ msg: "unauthorized" })
        }
        console.log("11")
        const verifyToken = jwt.verify(token, process.env.SECRET_KEY)
        console.log("verifytoken",verifyToken)
        if (verifyToken) {
            const user = await Users.findOne({ email: verifyToken._id })
            if (!user) {
                return res.status(400).json({ msg: "verification Failed" })
            }
            console.log("1")
            req.user = user
            next()
        } else {
            return res.status(401).json({ msg: "unauthorized" })
        }
    } catch (error) {
        console.log("2")
        return res.status(400).json({ err: error.message })

    }


}

module.exports = { Auth }