const user      = require("../models/user.model");
const product   = require("../models/product.model");
const sale      = require("../models/sale.model");
const nodemailer = require('nodemailer');

class UserController {
    buy(req, res) {
        const { productCart, userData } = req.body;

        user.findOne({ email: userData.email }, (err, data) => {
            if(err) throw err;

            if(!data) {
                // create user
                user.create(userData).catch(err => res.json({ message: "erro"}));
                return;
            }

            // verify productCart
            const ids = productCart.map(prod => prod.id);
            
            product.find({
                '_id': {
                    $in : ids
                }
            }, (err, data) => {
                if(err) throw err;
                
                const outstock = [];

                productCart.forEach(prod => {
                    const prodStock = data.find(prodStock => prodStock._id == prod.id);
                    if(prodStock.quant < prod.quant) outstock.push(prodStock);
                });

                if(outstock.length > 0) {
                    res.json({ message: "produtos sem estoque", products: outstock });

                    
                } else {
                    productCart.forEach(async prod => {
                        const prodStock = data.find(prodStock => prodStock._id == prod.id);
                        await product.updateOne({ _id: prod.id }, { quant: prodStock.quant - prod.quant });
                    });

                    res.json({ message: "compra realizada" });
                    // [o] remover do db (vulgo diminuir a coluna quant)
                    
                    
                    
                    // [x/4] enviar email
                    
                    let transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 587,
                        requireTLS: true,
                        secure: false,
                        auth: {
                            user: process.env.COMPANY_EMAIL,
                            pass: process.env.COMPANY_EMAIL_PASS
                        },
                    });

                    let message = {
                        from: "faltabrio@gmail.com",
                        to: userData.email,
                        subject: "ITU - Sua compra foi realizada com successo!",
                        text: `Parabéns ${userData.name}, pela sua nova aquisição. Nesse e-mail segue as instruções para acesso ao(s) jogo(s) comprado(s):\nO(s) jogo(s) e sua(s) respectiva(s) chave(s):\n${productCart.reduce((acum, elem) => acum + `${elem.title} - ${elem.id}\n`, "")}\nValor total: ${productCart.reduce((acum, elem) => acum + elem.quant * elem.price, 0)}\nO pagamento deverá ser feito via Pix na chave: 44a9b2ea-7460-4c9e-914a-fb4c3da57f0b.\nObrigado pela preferência e aproveite seus jogos.`
                    }
                    
                    
                    transporter.sendMail(message, (err) => {
                        if(err)
                        {
                            console.log(err);
                        }
                    });
                }
            });
        });
    }
}

module.exports = new UserController;