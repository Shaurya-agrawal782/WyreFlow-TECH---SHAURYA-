const User = require('../models/user');
const jwt = require('jsonwebtoken'); //taking and implementing of jwt with jsonwebttokens 

const genToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });


exports.registerUser = async (req, res) => {   //registration 
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'All fields are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role }); // password auto-hashed
    return res.status(201).json({
      id: user._id, name: user.name, email: user.email, role: user.role, token: genToken(user)
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



exports.loginUser = async (req, res) => {        //login
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(400).json({ message: 'Invalid credentials' });

    return res.json({
      id: user._id, name: user.name, email: user.email, role: user.role, token: genToken(user)
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
