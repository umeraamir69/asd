const express = require('express');
const router = express.Router();
const multer = require('multer'); // Import multer for file uploads
const path = require("path");

const User = require('../controllers/user');
const Order = require('../controllers/order');
const Product = require('../controllers/products');




/////// Upload data function  /////////////////////////////
const upload = multer({
  dest: 'uploads/', // Change this to your desired upload directory
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.xlsx']; // Restrict to Excel files only
    const extname = path.extname(file.originalname);
    cb(null, allowedExtensions.includes(extname));
  }
});
//////////////////////////////////////////////////////


/////// User  /////////////////////////////
router.post('/login', User.login);
router.post('/users', User.registerUser);
router.get('/users', User.getUsers);
router.delete('/users/:id', User.deleteUser);
router.post('/users/status/:id', User.changeStatus);
//////////////////////////////////////////////////////


/////// Order   /////////////////////////////
router.get('/orders', Order.order);
router.post('/orders', upload.single('excelFile'),  Order.addOrder );
router.get('/orders',Order.getOrders);
router.get('/orders/:orderId', Order.singleOrder);
router.put('/orders/:id', Order.updateOrder );
router.delete('/orders/:id',Order.deleteOrder);

router.post('/orders/:orderId/update', upload.single('file'), Order.updateProductsFromExcel);


//////////////////////////////////////////////////////



/////// Products  /////////////////////////////

router.get('/products', Product.getAllProducts);
router.get('/products/:id', Product.getProduct);
router.put('/products/:productId' , Product.updateProduct);

module.exports = router;