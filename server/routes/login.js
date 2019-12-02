const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
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

// Google configs

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {
    let token = req.body.idtoken;
    let googleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: false,
                err: e
            })
        });

    User.findOne({ email: googleUser.email }, (err, dbUser) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err
            });
        }

        if (dbUser) {
            if (dbUser.google === false) {
                res.status(400).json({
                    ok: false,
                    err: {
                        message: 'You should use your normal authentication'
                    }
                });
            } else {
                let token = jwt.sign({ user: dbUser }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRES_IN });

                res.json({
                    ok: true,
                    user: dbUser,
                    token
                });
            }
        } else {
            // User doesnt exists in the database

            let user = new User();
            user.name = googleUser.name;
            user.email = googleUser.email;
            user.img = googleUser.picture;
            user.google = true;
            user.password = ':)';

            user.save((err, dbUser) => {
                if (err) {
                    res.status(500).json({
                        ok: false,
                        err
                    });
                }

                let token = jwt.sign({ user: dbUser }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRES_IN });

                res.json({
                    ok: true,
                    user: dbUser,
                    token
                });
            });
        }
    });
});

module.exports = app;