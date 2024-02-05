let cfg = require('./config.json')
const jwt = require('jsonwebtoken');

function authenticateAdmin(req, res, next) {
  let tokenHeader = req.header('Authorization');

  if (!tokenHeader || !tokenHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized - Missing or invalid token' });
  }

  let token = tokenHeader.split(' ')[1];

  jwt.verify(token, cfg.auth_admin.jwt_key, (err, user) => {
    if (err) {
        console.log(err);
        return res.status(403).json({ message: 'Forbidden - Invalid token for Admin' });
    }

    req.user = user;
    next();
  });
}


module.exports = authenticateAdmin;

