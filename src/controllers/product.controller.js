const product = require("../models/product.model");

class ProductController {
    // get all products
    all(req, res) {
        product.find((err, data) => {
            if(err) throw err;
            res.json(data);
        });
    }

    // get one product by id
    one(req, res)  {
        const id = req.params.id;

        product.findById(id, (err, data) => {
            if(err) throw err;
            res.json(data);
        });
    }

    // create one product
    save(req, res)  {
        const { auth_token, products } = req.body;

        if(auth_token == process.env.ADMINTOKEN) {
            product.create(products)
                .then(data => res.json({ message: "ok", data }))
                .catch(err => res.json({ message: "error"}));

            return res.status(201);
        } 

        return res.status(401);
    }

    // get one product by id
    remove(req, res)  {
        const id = req.params.id;
        
        product.deleteOne({ _id: id }, (err) => {
            if (!err) {
                res.json({ message: "ok" });
            }
            else {
                console.log(err);
                res.json({ message: "error" });
            }
        });
    }
}

module.exports = new ProductController;