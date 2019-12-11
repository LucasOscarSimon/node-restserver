const express = require('express');
const app = express();
const _ = require('underscore');
let { verifyToken, verifyAdmin_Role } = require('../middlewares/authentication');

let Category = require('../models/category');

/// ======================
/// Show all categories
/// ======================

app.get('/category', verifyToken, (req, res) => {
    let condition = { state: true };

    Category.find(condition)
        .sort('description')
        .populate('user', 'name role')
        .exec((err, categories) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categories
            });
        });
});

/// ======================
/// Show category by ID
/// ======================

app.get('/category/:id', verifyToken, (req, res) => {
    let id = req.params.id;

    Category.findById(id, (err, categoryDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoryDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Incorrect Id'
                }
            });
        }

        res.json({
            ok: true,
            category: categoryDB
        });
    });
});

/// ======================
/// Create a new category 
/// ======================

app.post('/category', verifyToken, (req, res) => {

    let body = req.body;

    let category = new Category({
        description: body.description,
        user: req.user._id
    });

    category.save((err, categoryDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoryDB)
            return res.status(400).json({
                ok: false,
                err
            });

        res.json({ ok: true, category: categoryDB });
    });
});

/// ======================
/// Updates a category 
/// ======================

app.put('/category/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['description']);

    Category.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoryDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            category: categoryDB
        });
    });
});

/// ======================
/// Delete a category 
/// ======================
app.delete('/category/:id', [verifyToken, verifyAdmin_Role], (req, res) => {
    let id = req.params.id;
    let changeState = { state: false };

    // Category.findByIdAndRemove(id, (err, deletedCategory) => {
    Category.findByIdAndUpdate(id, changeState, { new: true }, (err, deletedCategory) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!deletedCategory) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Id does not exists'
                }
            });
        }
        res.json({
            ok: true,
            message: 'The category was deleted'
        });
    })
});

module.exports = app;