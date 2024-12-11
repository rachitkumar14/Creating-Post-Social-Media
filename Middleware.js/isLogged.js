
const jwt = require('jsonwebtoken')

function isLogged(req,res,next)
{
        if(req.cookies.token==="")
        {
            res.redirect('/login')
        }
        else{
            const data=jwt.verify(req.cookies.token,"rachitishere")
            req.user = data;
           
        }
        next();
}

module.exports = isLogged;