const jwt = require('jsonwebtoken');

module.exports = (req, res, next, allowedRoles) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.tokenData = decoded;
        if(!decoded.role || (allowedRoles && allowedRoles.length > 0 && allowedRoles.indexOf(decoded.role) === -1) ) {
            return res.status(401).json({
                message: 'Auth failed'
            });
        }
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
};