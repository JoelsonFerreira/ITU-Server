require('dotenv').config({path: '.env'});
const express = require('express');
const port = process.env.PORT || 8080;

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@test.yvyek.mongodb.net/ecommerce?retryWrites=true&w=majority`, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(() => {
        console.log('Database connected.');
    }, err => {
        console.log('Database not connected: ', err);
    }
);

const app = express();

app.use(express.json());

const productRouter = require('./routes/product.router');

app.use('/product', productRouter);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}...`);
});
