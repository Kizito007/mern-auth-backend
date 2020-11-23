const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token)
        return res
            .status(401)
            .json({msg: "No authenication token, authorization denied"});

    const verfied = jwt.verify(token, process.env.JWT_SECRET)
    if (!verfied)
        return res
            .status(401)
            .json({msg: "Token verufucation failed, authorization denied"});

    req.user = verfied.id ;
    next ();
}

module.exports = auth ;