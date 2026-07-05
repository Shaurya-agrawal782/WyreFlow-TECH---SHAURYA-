const jwt = require('jsonwebtoken');
const User = require('../models/user');


const protect = async (req, res, next) => {  //login must and jWT valid token
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) return res.status(401).json({ message: 'User not found' });
      return next();
    } catch {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  }
  return res.status(401).json({ message: 'Not authorized, no token' });
};



const authorize = (...roles) => (req, res, next) => {   // only employer - checking the role of a user then proceed with the suitable access.
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: Access denied' });
  }
  next();
};

module.exports = { protect, authorize };
