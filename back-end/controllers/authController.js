const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Authority } = require('../models');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const loginAuthority = async (req, res) => {
  try {
    const { username, password } = req.body;
    const authority = await Authority.findOne({ where: { username } });

    if (authority && (await bcrypt.compare(password, authority.password))) {
      res.json({
        id: authority.id,
        username: authority.username,
        role: authority.role,
        departmentId: authority.departmentId,
        token: generateToken(authority.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const registerAuthority = async (req, res) => {
  try {
    const { username, password, role, departmentId } = req.body;
    const authorityExists = await Authority.findOne({ where: { username } });

    if (authorityExists) {
      return res.status(400).json({ message: 'Authority already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const authority = await Authority.create({
      username,
      password: hashedPassword,
      role,
      departmentId
    });

    if (authority) {
      res.status(201).json({
        id: authority.id,
        username: authority.username,
        token: generateToken(authority.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid authority data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { loginAuthority, registerAuthority };
