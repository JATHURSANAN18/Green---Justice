const jwt = require('jsonwebtoken');
const { Authority } = require('../models');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const authority = await Authority.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!authority) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.authority = authority;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
