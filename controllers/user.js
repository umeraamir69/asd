const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



// innitialization move this to .env and there 
const secret = 'your_jwt_secret';
const saltRounds = 10;


const login = async (req, res) => {
    try {
      const {username, password} = req.body;
  
      if (!username || !password) {
        return res
          .status(400)
          .json({error: 'Missing username or password'});
      }
      const user = await User.findOne({username});
      if (!user) {
        return res
          .status(401)
          .json({error: 'Invalid username or password'});
      }
  
      if (!user.isActive) {
        return res
          .status(401)
          .json({error: 'User Not allowed'});
      }
  
      // Compare hashed password (replace with your hashing logic)
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res
          .status(401)
          .json({error: 'Invalid username or password'});
      }
  
      const payload = {
        user: {
          id: user._id,
          isAdmin: user.isAdmin
        }
      };
      const token = jwt.sign(payload, secret);
      res
        .status(200)
        .json({token, userdata : {username , email :user.email}});
    } catch (err) {
      console.error('Error logging in user:', err);
      res
        .status(500)
        .json({error: 'Internal server error'});
    }
  }
  
  // add user

  
  const registerUser = async (req, res) => {
    try {
      const {username, email, password, phone, address} = req.body;
  
      // Validate user data
      const validationErrors = [];
  
      if (!username || username.length < 3 || username.length > 20) {
        validationErrors.push('Username must be between 3 and 20 characters long');
      }
  
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        validationErrors.push('Invalid email format');
      }
  
      if (!password || password.length < 6) {
        validationErrors.push('Password must be at least 6 characters long');
      }
  
      if (validationErrors.length > 0) {
        return res
          .status(400)
          .json({error: 'Validation errors', errors: validationErrors});
      }
  
      const existingUser = await User.findOne({
        $or: [{
            username
          }, {
            email
          }]
      });
      if (existingUser) {
        return res
          .status(400)
          .json({error: 'Username or email already exists'});
      }
  
      const newUser = new User({username, email, password, phone, address});
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      newUser.password = hashedPassword;
  
      const savedUser = await newUser.save();
      res
        .status(201)
        .json(savedUser);
    } catch (err) {
      console.error('Error creating user:', err);
      res
        .status(400)
        .json({error: err.message});
    }
  };
  
  // get all user if admin
  const getUsers = async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
  
      if (!token) {
        return res
          .status(401)
          .json({error: 'Unauthorized: Missing token'});
      }
  
      const decoded = jwt.verify(token, secret);
      const user = decoded.user;
  
      if (!user.isAdmin) {
        return res
          .status(403)
          .json({error: 'Forbidden: User is not an admin'});
      }
  
      const users = await User.find();
      res.json(users);
    } catch (err) {
      console.error('Error getting users:', err);
      res
        .status(500)
        .json({error: 'Internal Server Error'});
    }
  };
  
  //delete user
  
  const deleteUser = async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
  
      if (!token) {
        return res
          .status(401)
          .json({error: 'Unauthorized: Missing token'});
      }
  
      const decoded = jwt.verify(token, secret);
      const user = decoded.user;
  
      if (!user.isAdmin) {
        return res
          .status(403)
          .json({error: 'Forbidden: User is not an admin'});
      }
  
      const userId = req.params.id;
  
      const userToDelete = await User.findById(userId);
      if (!userToDelete) {
        return res
          .status(404)
          .json({error: 'User not found'});
      }
  
      await User.findByIdAndDelete(userId);
      res.json({message: 'User deleted successfully'});
    } catch (err) {
      console.error('Error deleting user:', err);
      res
        .status(500)
        .json({error: 'Internal Server Error'});
    }
  };
  
  //change status
  const changeStatus = async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
  
      if (!token) {
        return res
          .status(401)
          .json({error: 'Unauthorized: Missing token'});
      }
  
      const decoded = jwt.verify(token, secret);
      const user = decoded.user;
  
      if (!user.isAdmin) {
        return res
          .status(403)
          .json({error: 'Forbidden: User is not an admin'});
      }
  
      const userId = req.params.id;
      const {isActive, isAdmin} = req.body;
      const updatedUser = await User.findByIdAndUpdate(userId, {
        "isActive": isActive,
        "isAdmin": isAdmin
      }, {new: true});
  
      if (!updatedUser) {
        return res
          .status(404)
          .json({error: 'User not found'});
      }
  
      res.json({message: 'User status updated successfully', user: updatedUser}); // Include updated user data (optional)
  
    } catch (err) {
      console.error('Error updating user status:', err);
      res
        .status(500)
        .json({error: 'Internal Server Error'});
    }
  };



  module.exports = {
    login,
    registerUser,
    getUsers,
    deleteUser,
    changeStatus
  };