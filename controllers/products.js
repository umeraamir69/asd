const Product = require("../models/Product");
const jwt = require('jsonwebtoken');

// innitialization move this to .env and there 
const secret = 'your_jwt_secret';



const getAllProducts = async (req, res) => {
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
  
      const product = await Product.find({});
      res
        .status(200)
        .json(product);
    } catch (err) {
      console.error('Error fetching orders:', err);
      res
        .status(500)
        .json({error: 'Internal Server Error'});
    }
  };


  const getProduct = async (req, res) => {
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
  
      const productId = req.params.id;
  
      const product = await Product.findById(productId);
  
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
      } else {
        res.json(product);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  


  const updateProduct = async (req, res) => {
    const productId = req.params.productId;
    const updateData = req.body;
    console.log(updateData)
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
  
  
      const updatedProduct = await Product.findByIdAndUpdate(productId, {updateData})
      console.log(updatedProduct)
      res.json(updatedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating product' });
    }
  };

  module.exports = {
    getAllProducts,
    getProduct,
    updateProduct
  };