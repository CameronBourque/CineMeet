const express = require('express');
const router = express.Router();
const passport = require('passport');
const { pool } = require('../config/database');

// Login
router.get('/login', (req, res) => res.render('login'));

// Register
router.get('/register', (req, res) => res.render('register'));

// Register handler
router.post('/register', (req, res) => {
    const { firstName, lastName, userName, email, phone, password, password2 } = req.body;
    let errors = [];

    // Check required fields
    if (!firstName || !lastName || !userName || !email || !phone || !password || !password2) {
        errors.push({ message: 'Please fill in all fields.' } );
    }

    // Check if passwords match
    if (password !== password2) {
        errors.push({ message: 'Password do not match.' } );
    }

    // Check password length
    if (password.length < 6) {
        errors.push({ message: 'Password must be at least 6 characters.' } );
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            firstName,
            lastName,
            userName,
            email,
            phone,
            password,
            password2
        });
    } else {
        const statements = ["SELECT * FROM \"User\" WHERE email = '", email, "';"];
        const query = statements.join('');
        pool.query(query, (err, results) => {
                if (err) {
                    throw err;
                }
                if (results.rows.length > 0) {
                    errors.push( { message: 'That username / email is already in use.'} );
                    res.render('register', {
                        errors,
                        firstName,
                        lastName,
                        userName,
                        email,
                        phone,
                        password,
                        password2
                    });
                } else {
                    const statements = ["INSERT INTO \"User\" (\"firstName\", \"lastName\", \"userName\", email, phone, password) VALUES (", "\'" + firstName + "\', ", "\'" + lastName + "\', ", "\'" + userName + "\', ", "\'" + email + "\', ", "\'" + phone + "\', ", "\'" + password + "\');"];
                    const query = statements.join('');
                    pool.query(query, (err, results) => {
                        if (err) {
                            throw err;
                        }
                        req.flash('success_msg', 'Thank you for registering! You may now login.');
                        res.redirect('/users/login')
                    });
                }
            }
        );
    }
});

// Login handler
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    }) (req, res, next);
});

// Logout handler
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You have successfully logged out.');
    res.redirect('/users/login');
});

module.exports = router;