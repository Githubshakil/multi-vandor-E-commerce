const jwt = require('jsonwebtoken')


const protect = async (req,res, next) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }

    if(!token){
        return res.status(401).json({message: 'Not authorized, no token'})
    }


    try {
        const docoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
        req.user = docoded
        next()
    } catch (error) {
        return res.status(401).json({message: 'Not authorized, token failed'})
    }
}


const restrictTo = (...roles) => {
        return (req,res,next) => {
            if(!roles.includes(req.user.role)){
                return res.status(403).json({message:'You dont have permission'})
            }
            next()
        }
}

module.exports = {protect, restrictTo}