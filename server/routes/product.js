const express = require('express');
const _ = require('underscore');
let { verifyToken } = require('../middlewares/authentication');

const app = express();
let Product = require('../models/product');

/// ======================
/// Get all products
/// ======================
app.get('/product', verifyToken, (req, res) => {
    let from = req.query.from || 0;
    from = Number(from);

    let limit = req.query.limit || 5;
    limit = Number(limit);

    let condition = { available: true };

    Product.find(condition)
        .populate('user', 'name')
        .populate('category', 'description')
        .skip(from)
        .limit(limit)
        .exec((err, dbProducts) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!dbProducts) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Product.countDocuments(condition, (err, count) => {
                res.json({
                    ok: true,
                    products: dbProducts,
                    count
                });
            });
        });

});

/// ======================
/// Get product by id
/// ======================
app.get('/product/:id', verifyToken, (req, res) => {
    let id = req.params.id;

    Product.findById(id)
        .populate('user', 'name')
        .populate('category', 'description')
        .exec((err, dbProduct) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!dbProduct) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                product: dbProduct
            });
        });
});

/// ======================
/// Search products
/// ======================
app.get('/product/search/:keyword', verifyToken, (req, res) => {
    let keyword = req.params.keyword;
    let regEx = new RegExp(keyword, 'i');

    Product.find({ name: regEx })
        .populate('user', 'name')
        .populate('category', 'description')
        .exec((err, products) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                products
            });
        });
});


/// ======================
/// Creates a product
/// ======================
app.post('/product', verifyToken, (req, res) => {
    let body = req.body;

    let product = new Product({
        name: body.name,
        unitPrice: body.unitPrice,
        description: body.description,
        category: body.category,
        user: req.user._id
    });

    product.save((err, dbProduct) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!dbProduct) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.status(201).json({ ok: true, product: dbProduct });
    });
});

/// ======================
/// Updates a product
/// ======================
app.put('/product/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['name', 'unitPrice', 'description', 'available', 'category.description', 'user.name']);

    Product.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, dbProduct) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!dbProduct) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Id does not exists'
                }
            });
        }

        res.json({
            ok: true,
            product: dbProduct
        });
    });
});

/// ======================
/// Deletes a product
/// ======================
app.delete('/product/:id', verifyToken, (req, res) => {
    //Updates a new product
    //save the user
    //save the category

    let id = req.params.id;
    let changeState = { available: false };

    Product.findByIdAndUpdate(id, changeState, { new: true }, (err, deletedProduct) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!deletedProduct) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Id does not exists'
                }
            });
        }

        res.json({
            ok: true,
            message: 'The product was deleted'
        });
    });
});

module.exports = app;