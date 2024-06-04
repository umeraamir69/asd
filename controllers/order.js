const Order = require("../models/Order");
const jwt = require('jsonwebtoken');
const Product = require("../models/Product");
const xlsx = require('xlsx');


// innitialization move this to .env and there 
const secret = 'your_jwt_secret';


const order = async (req, res) => {
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
  
      let query = {};
  
      if (!user.isAdmin) {
        query.userEmail = user.email;
      }
  
      const orders = await Order.find(query);
      res.json(orders);
    } catch (err) {
      console.error('Error getting orders:', err);
      res
        .status(500)
        .json({error: 'Internal Server Error'});
    }
  };


const addOrder = async (req, res) => {
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
      const userId = user.id
      let {title, email, endDate, description} = req.body;
  
      const validationErrors = [];
  
      if (!title || title.length < 3 || title.length > 255) {
        validationErrors.push('Title must be between 3 and 255 characters long');
      }

      if (!email || email.length < 6 || email.length > 255 || !email.includes("@") || !email.includes(".")) {
        validationErrors.push('Please Enter Valid Email.');
      }
  
      if (!endDate) {
        validationErrors.push('End date is required');
      } else if (!(endDate instanceof Date)) {
        try {
          // Attempt to parse the provided value into a Date object
          endDate = new Date(endDate);
        } catch (error) {
          console.log(error)
          validationErrors.push('Invalid end date format');
        }
        // If parsing succeeded, proceed with future date check
        if (endDate && endDate.getTime() <= Date.now()) {
          validationErrors.push('End date must be a future date (after today)');
        }
      } else {
        // endDate is already a valid Date object, proceed with future date check
        if (endDate.getTime() <= Date.now()) {
          validationErrors.push('End date must be a future date (after today)');
        }
      }
  
      if (!description || description.length < 5 || description.length > 1000) {
        validationErrors.push('Description must be between 5 and 1000 characters long');
      }
  
      if (validationErrors.length > 0) {
        return res
          .status(400)
          .json({error: 'Validation errors', errors: validationErrors});
      }
  
      const excelFile = req.file; // Access uploaded Excel file
  
      if (!excelFile) {
        return res
          .status(400)
          .json({error: 'Missing Excel file'});
      }
  
      const workbook = await xlsx.readFile(excelFile.path); // Read Excel file
  
      const products = []; // Array to store product objects
  
      workbook
        .SheetNames
        .forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const range = xlsx
            .utils
            .decode_range(worksheet['!ref']); // Get used range
  
          for (let row = 9; row <= range.e.r; row++) {
            const productData = {};
  
            for (let col = range.s.c; col <= range.e.c; col++) {
              const cellAddress = xlsx
                .utils
                .encode_cell({c: col, r: row});
              const cellValue = worksheet[cellAddress]
                ?.v;
  
              switch (col) {
                case 2:
                  productData.STYLE = cellValue;
                  break;
                case 3:
                  productData.FABRIC = cellValue;
                  break;
                case 4:
                  productData.VENDOR = cellValue;
                  break;
                case 5:
                  if (typeof cellValue === 'number') {
                    productData.AUDIT = new Date((cellValue - 25569) * 86400000).toDateString();
                  } else {
                    productData.AUDIT = cellValue;
                  }
                  break;
                case 6:
                  productData.XXS = cellValue;
                  break;
                case 7:
                  productData.XS = cellValue;
                  break;
                case 8:
                  productData.S = cellValue;
                  break;
                case 9:
                  productData.M = cellValue;
                  break;
                case 10:
                  productData.L = cellValue;
                  break;
                case 11:
                  productData.XL = cellValue;
                  break;
                case 12:
                  productData.XXL = cellValue;
                  break;
                case 13:
                  productData.TOTAL = cellValue;
                  break;
                case 14:
                  if (typeof cellValue === 'number') {
                    productData.PODATE = new Date((cellValue - 25569) * 86400000).toDateString();
                  } else {
                    productData.PODATE = cellValue;
                  }
                case 15:
                  productData.LAB = cellValue;
                  break;
                case 16:
                  if (typeof cellValue === 'number') {
                    productData.PROTO = new Date((cellValue - 25569) * 86400000).toDateString();
                  } else {
                    productData.PROTO = cellValue;
                  }
                  break;
                case 17:
                  productData.PPS = cellValue;
                  break;
                case 18:
                  if (typeof cellValue === 'number') {
                    productData.YARN = new Date((cellValue - 25569) * 86400000).toDateString();
                  } else {
                    productData.YARN = cellValue;
                  }
                  break;
                case 19:
                  if (typeof cellValue === 'number') {
                    productData.knittingstartDate = new Date((cellValue - 25569) * 86400000).toDateString();
                  } else {
                    productData.knittingstartDate = cellValue;
                  }
                  break;
                case 20:
                  if (typeof cellValue === 'number') {
                    productData.knittingendDate = new Date((cellValue - 25569) * 86400000).toDateString();
                  } else {
                    productData.knittingendDate = cellValue;
                  }
                  break;
                case 21:
                  if (typeof cellValue === 'number') {
                    productData.dyeingstartDate = new Date((cellValue - 25569) * 86400000).toDateString();
                  } else {
                    productData.dyeingstartDate = cellValue;
                  }
                  break;
                case 22:
                  if (typeof cellValue === 'number') {
                    productData.dyeingendDate = new Date((cellValue - 25569) * 86400000).toDateString();
                  } else {
                    productData.dyeingendDate = cellValue;
                  }
                  break;
                case 23:
                  if (typeof cellValue === 'number') {
                    productData.cuttingstartDate = new Date((cellValue - 25569) * 86400000).toDateString();
                  } else {
                    productData.cuttingstartDate = cellValue;
                  }
                  break;
                case 24:
                  if (typeof cellValue === 'number') {
                    productData.cuttingendDate = new Date((cellValue - 25569) * 86400000).toDateString();
                  } else {
                    productData.cuttingendDate = cellValue;
                  }
                  break;
                case 25:
                  if (typeof cellValue === 'number') {
                    productData.emblishmentstartDate = new Date((cellValue - 25569) * 86400000).toDateString();
                  } else {
                    productData.emblishmentstartDate = cellValue;
                  }
                  break;
                case 26:
                  if (typeof cellValue === 'number') {
                    productData.emblishmentendDate = new Date((cellValue - 25569) * 86400000).toDateString();
                  } else {
                    productData.emblishmentendDate = cellValue;
                  }
                  break;
                case 27:
                  if (typeof cellValue === 'number') {
                    productData.sewingstartDate = new Date((cellValue - 25569) * 86400000).toDateString();
                  } else {
                    productData.sewingstartDate = cellValue;
                  }
                  break;
                case 28:
                  if (typeof cellValue === 'number') {
                    productData.sewingendDate = new Date((cellValue - 25569) * 86400000).toDateString();
                  } else {
                    productData.sewingendDate = cellValue;
                  }
                  break;
                case 29:
                  if (typeof cellValue === 'number') {
                    productData.finishingstartDate = new Date((cellValue - 25569) * 86400000).toDateString();
                  } else {
                    productData.finishingstartDate = cellValue;
                  }
                  break;
                case 30:
                  if (typeof cellValue === 'number') {
                    productData.finishingendDate = new Date((cellValue - 25569) * 86400000).toDateString();
                  } else {
                    productData.finishingendDate = cellValue;
                  }
                  break;
                case 31:
                  if (typeof cellValue === 'number') {
                    productData.packingstartDate = new Date((cellValue - 25569) * 86400000).toDateString();
                  } else {
                    productData.packingstartDate = cellValue;
                  }
                  break;
                case 32:
                  if (typeof cellValue === 'number') {
                    productData.packingendDate = new Date((cellValue - 25569) * 86400000).toDateString();
                  } else {
                    productData.packingendDate = cellValue;
                  }
                  break;
                case 33:
                  if (typeof cellValue === 'number') {
                    productData.AUDIT = new Date((cellValue - 25569) * 86400000).toDateString();
                  } else {
                    productData.AUDIT = cellValue;
                  }
                  break;
                case 34:
                  productData.REMARKS = cellValue;
                  break;
              }
            }
            products.push(productData);
          }
        });
      const createdProducts = await Promise.all(products.map(async(productData) => {
        const newProduct = new
        Product(productData);
        await newProduct.save();
        return newProduct._id; //
      }));
      const newOrder = new Order({title,email, endDate, description, userId, products: createdProducts});
  
      await newOrder.save();
  
      res
        .status(201)
        .json(newOrder);
    } catch (err) {
      console.error('Error creating order:', err);
      res
        .status(500)
        .json({error: 'Internal Server Error'});
    }
  };



  const getOrders = async (req, res) => {
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
  
      const orders = await Order.find({});
      res
        .status(200)
        .json(orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      res
        .status(500)
        .json({error: 'Internal Server Error'});
    }
  };


  const singleOrder = async (req, res) => {
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
      const {orderId} = req.params;
      const order = await Order
        .findById(orderId)
        .populate('products');
      res
        .status(200)
        .json(order);
    } catch (err) {
      console.error('Error fetching order:', err);
      res
        .status(500)
        .json({error: 'Internal Server Error'});
    }
  };





  const updateOrder = async (req, res) => {
    try {
      const {status, endDate, description} = req.body;
  
      const updatedOrder = await Order.findByIdAndUpdate(req.params.id, {
        status,
        ...(endDate && {
          endDate
        }),
        ...(description && {
          description
        })
      }, {new: true} // Return the updated document
      );
  
      if (!updatedOrder) {
        return res
          .status(404)
          .json({error: 'Order not found'});
      }
  
      res.json({message: 'Order updated successfully', order: updatedOrder});
    } catch (err) {
      console.error('Error updating order:', err);
      res
        .status(500)
        .json({error: 'Internal Server Error'});
    }
  };


  const deleteOrder = async (req, res) => {
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
      const orderId = req.params.id;
  
      const deletedOrder = await Order.findByIdAndDelete(orderId);
  
      if (!deletedOrder) {
        return res
          .status(404)
          .json({error: 'Order not found'});
      }
  
      res.json({message: 'Order deleted successfully'});
    } catch (err) {
      console.error('Error deleting order:', err);
      res
        .status(500)
        .json({error: 'Internal Server Error'});
    }
  };
  

  const updateProductsFromExcel = async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
  
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
      }
  
      const decoded = jwt.verify(token, secret);
      const user = decoded.user;
  
      if (!user.isAdmin) {
        return res.status(403).json({ error: 'Forbidden: User is not an admin' });
      }
  
      const { orderId } = req.params;
  
      const order = await Order.findById(orderId).populate('products');
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      const excelFile = req.file; // Access uploaded Excel file
      if (!excelFile) {
        return res.status(400).json({ error: 'Missing Excel file' });
      }
  
      const workbook = await xlsx.readFile(excelFile.path);
      const products = [];
  
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const range = xlsx.utils.decode_range(worksheet['!ref']);
  
        for (let row = 9; row <= range.e.r; row++) {
          const productData = {};
  
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = xlsx.utils.encode_cell({ c: col, r: row });
            const cellValue = worksheet[cellAddress]?.v;
  
            switch (col) {
              case 2: productData.STYLE = cellValue; break;
              case 3: productData.FABRIC = cellValue; break;
              case 4: productData.VENDOR = cellValue; break;
              case 5: productData.AUDIT = typeof cellValue === 'number' ? new Date((cellValue - 25569) * 86400000).toDateString() : cellValue; break;
              case 6: productData.XXS = cellValue; break;
              case 7: productData.XS = cellValue; break;
              case 8: productData.S = cellValue; break;
              case 9: productData.M = cellValue; break;
              case 10: productData.L = cellValue; break;
              case 11: productData.XL = cellValue; break;
              case 12: productData.XXL = cellValue; break;
              case 13: productData.TOTAL = cellValue; break;
              case 14: productData.PODATE = typeof cellValue === 'number' ? new Date((cellValue - 25569) * 86400000).toDateString() : cellValue; break;
              case 15: productData.LAB = cellValue; break;
              case 16: productData.PROTO = typeof cellValue === 'number' ? new Date((cellValue - 25569) * 86400000).toDateString() : cellValue; break;
              case 17: productData.PPS = cellValue; break;
              case 18: productData.YARN = typeof cellValue === 'number' ? new Date((cellValue - 25569) * 86400000).toDateString() : cellValue; break;
              case 19: productData.knittingstartDate = typeof cellValue === 'number' ? new Date((cellValue - 25569) * 86400000).toDateString() : cellValue; break;
              case 20: productData.knittingendDate = typeof cellValue === 'number' ? new Date((cellValue - 25569) * 86400000).toDateString() : cellValue; break;
              case 21: productData.dyeingstartDate = typeof cellValue === 'number' ? new Date((cellValue - 25569) * 86400000).toDateString() : cellValue; break;
              case 22: productData.dyeingendDate = typeof cellValue === 'number' ? new Date((cellValue - 25569) * 86400000).toDateString() : cellValue; break;
              case 23: productData.cuttingstartDate = typeof cellValue === 'number' ? new Date((cellValue - 25569) * 86400000).toDateString() : cellValue; break;
              case 24: productData.cuttingendDate = typeof cellValue === 'number' ? new Date((cellValue - 25569) * 86400000).toDateString() : cellValue; break;
              case 25: productData.emblishmentstartDate = typeof cellValue === 'number' ? new Date((cellValue - 25569) * 86400000).toDateString() : cellValue; break;
              case 26: productData.emblishmentendDate = typeof cellValue === 'number' ? new Date((cellValue - 25569) * 86400000).toDateString() : cellValue; break;
              case 27: productData.sewingstartDate = typeof cellValue === 'number' ? new Date((cellValue - 25569) * 86400000).toDateString() : cellValue; break;
              case 28: productData.sewingendDate = typeof cellValue === 'number' ? new Date((cellValue - 25569) * 86400000).toDateString() : cellValue; break;
              case 29: productData.finishingstartDate = typeof cellValue === 'number' ? new Date((cellValue - 25569) * 86400000).toDateString() : cellValue; break;
              case 30: productData.finishingendDate = typeof cellValue === 'number' ? new Date((cellValue - 25569) * 86400000).toDateString() : cellValue; break;
              case 31: productData.packingstartDate = typeof cellValue === 'number' ? new Date((cellValue - 25569) * 86400000).toDateString() : cellValue; break;
              case 32: productData.packingendDate = typeof cellValue === 'number' ? new Date((cellValue - 25569) * 86400000).toDateString() : cellValue; break;
              case 33: productData.AUDIT = typeof cellValue === 'number' ? new Date((cellValue - 25569) * 86400000).toDateString() : cellValue; break;
              case 34: productData.REMARKS = cellValue; break;
            }
          }
          products.push(productData);
        }
      });
  
      for (let productData of products) {
        const existingProduct = await Product.findOne({ orderId: order._id, STYLE: productData.STYLE });
        if (existingProduct) {
          // Update existing product
          await Product.updateOne({ _id: existingProduct._id }, productData);
        } else {
          // Add new product
          const newProduct = new Product({ ...productData, orderId: order._id });
          await newProduct.save();
          order.products.push(newProduct._id);
        }
      }
  
      await order.save();
  
      res.status(200).json({ message: 'Products updated successfully', order });
  
    } catch (err) {
      console.error('Error updating products:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };


  module.exports = {
    order,
    addOrder,
    getOrders,
    singleOrder,
    updateOrder,
    deleteOrder,
    updateProductsFromExcel
  };





