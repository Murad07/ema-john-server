const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kzt0x.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());

const port = 5000;

app.get('/', (req, res) => {
  res.send("hello from db it's working");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const productsCollection = client.db('emaJohnStore').collection('products');
  const ordersCollection = client.db('emaJohnStore').collection('orders');

  //Add all data from fakedata api
  app.post('/addProduct', (req, res) => {
    const products = req.body;

    productsCollection.insertMany(products).then((result) => {
      console.log(res.send(result.insertedCount));
      res.send(result.insertedCount);
    });
  });

  //Read data from server - all products
  // app.get('/products', (req, res) => {
  //   productsCollection.find({}).toArray((err, documents) => {
  //     res.send(documents);
  //   });
  // });

  app.get('/products', (req, res) => {
    const search = req.query.search;
    productsCollection
      .find({ name: { $regex: search } })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  // load single product
  app.get('/product/:key', (req, res) => {
    productsCollection
      .find({ key: req.params.key })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });

  // load some specific products
  app.post('/productsByKeys', (req, res) => {
    const productKeys = req.body;
    productsCollection
      .find({ key: { $in: productKeys } })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  // Order information
  app.post('/addOrder', (req, res) => {
    const order = req.body;

    ordersCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
});

app.listen(process.env.PORT || port);
