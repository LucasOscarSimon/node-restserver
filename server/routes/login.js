const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const User = require('../models/user');

app.post('/login', (req, res) => {

    let body = req.body;
    User.findOne({ email: body.email }, (err, dbUser) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!dbUser) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Wrong (user) or password'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, dbUser.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Wrong (user) or password'
                }
            });
        }

        let token = jwt.sign({ user: dbUser }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRES_IN });

        res.json({
            ok: true,
            user: dbUser,
            token
        });
    })
});

module.exports = app;