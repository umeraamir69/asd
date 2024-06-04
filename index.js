const express = require('express');
const app = express();
const port = 4000;
const apiRouter = require('./router/routes');
const connect = require('./database/mongoDb');
var cors = require('cors')




app.use(express.json());

app.use(cors({

  methods: ['GET', 'POST', 'DELETE', 'PUT'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true,
}));


app.use('/api', apiRouter);


connect().then(() => {
  try {
      app.listen(port, () => {
          console.log(`Server connected to http://localhost:${port}`);
      })
  } catch (error) {
      console.log('Cannot connect to the server')
  }
}).catch(error => {
  console.log("Invalid database connection...!");
})