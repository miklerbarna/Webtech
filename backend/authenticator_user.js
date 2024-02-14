let cfg = require('./config.json')
const jwt = require('jsonwebtoken');

function authenticateUser(req, res, next) {
  let tokenHeader = req.header('Authorization');

  if (!tokenHeader || !tokenHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized - Missing or invalid token' });
  }

  let token = tokenHeader.split(' ')[1];

  //If admin, let it in always
  jwt.verify(token, cfg.auth_admin.jwt_key, (err, user) => {
    if (!err) {
        req.user = user;
        next();
    } else {
      jwt.verify(token, cfg.auth_user.jwt_key, (err, user) => {
        if (err) {
            console.log(err);
            return res.status(403).json({ message: 'Forbidden - Invalid token for User' });
        }
    
        req.user = user;
        next();
      });
    }
  });

}

module.exports = authenticateUser;

