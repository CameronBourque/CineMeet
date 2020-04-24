const express = require('express');
const router = express.Router();
const passport = require('passport');
const { pool } = require('../config/database');
const { ensureAuthenticated } = require('../config/auth');

// Login
router.get('/login', (req, res) => res.render('login'));

// Register
router.get('/register', (req, res) => {
    const errors = [];
    errors.push({message: "Please make sure to fill out every field."})
    res.render('register', { errors })
});

// Settings
router.get('/settings', ensureAuthenticated, function(req, res) {
    const userName = req.user.userName;

    const statements = ["SELECT \"discordChannel\", \"twilioService\" FROM \"User\" WHERE \"userName\" = '", userName, "';"];
    const query = statements.join('');

    pool
        .query(query)
        .then(results => {
            let discord = results.rows[0].discordChannel;
            const twilioService = results.rows[0].twilioService;
            if (discord === null) {
                discord = '';
            }
            res.render('settings', {
                discord,
                twilioService
            });
        })
        .catch(e => console.error(e.stack))
});

// Save settings handler
router.post('/settings', ensureAuthenticated, function(req, res) {
    const { discord, twilio } = req.body;
    const userName = req.user.userName;

    const statements = ["UPDATE \"User\" SET \"discordChannel\" = '", discord, "', \"twilioService\" = '", twilio, "' WHERE \"userName\" = '", userName, "';"];
    const query = statements.join('');

    pool
        .query(query)
        .then(() => {
            req.flash('success_msg', 'You have successfully changed your settings.');
            res.redirect('/dashboard');
        })
        .catch(e => console.error(e.stack))
});

// Friends
router.get('/friends', ensureAuthenticated, function(req, res) {
    const userName = req.user.userName;

    const statements = ["SELECT friend FROM \"UserFriends\" WHERE owner = '", userName, "';"];
    const query = statements.join('');

    pool
        .query(query)
        .then(results => {
            res.render('friendslist', { friends: results.rows });
        })
        .catch(e => console.error(e.stack))

});

// Add friend
router.post('/addfriend', (req, res) => {
    let { friend } = req.body;
    const userName = req.user.userName;

    let statements = ["SELECT * FROM \"User\" WHERE \"userName\" = '", friend, "';"];
    let query = statements.join('');
    pool
        .query(query)
        .then(results => {
            if (results.rows.length > 0) {
                if (results.rows[0].userName !== userName) {
                    statements = ["INSERT INTO \"UserFriends\" (owner, friend) VALUES ('", userName, "', '", friend, "');"];
                    query = statements.join('');
                    pool
                        .query(query)
                        .then(() => {
                                req.flash('success_msg', 'You have successfully added ' + friend + '. This person can now see your private listings.');
                                res.redirect('/users/friends');
                            }
                        )
                        .catch(e => console.error(e.stack))
                } else {
                    req.flash('error_msg', 'You cannot add yourself as a friend.');
                    res.redirect('/users/friends');
                }
            } else {
                req.flash('error_msg', 'That user does not exist.');
                res.redirect('/users/friends');
            }
        })
        .catch(e => console.error(e.stack))
});

// Register handler
router.post('/register', (req, res) => {
    const { firstName, lastName, userName, email, phone, password, password2 } = req.body;
    let errors = [];

    // Check required fields
    if (!firstName || !lastName || !userName || !email || !phone || !password || !password2) {
        errors.push({ message: 'Please make sure to fill out every field.' } );
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
        // this parses phone numbers so that they all format the same way
        function parsePhone(number){
            let ret = "";
            let i = 0;
            if(number.indexOf("+1") != 0){
                ret = "+1";
                i = 2;
            }
            for(; i < number.length; i++){
                if(number[i] >= '0' && number[i] <= '9'){
                    ret += number[i];
                }
            }
            return ret;
        }
        let phoneN = parsePhone(phone);
        const statements = ["SELECT * FROM \"User\" WHERE email = '", email, "' OR \"userName\" = '", userName, "';"];
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
                    const statements = ["INSERT INTO \"User\" (\"firstName\", \"lastName\", \"userName\", email, phone, password) VALUES (", "\'" + firstName + "\', ", "\'" + lastName + "\', ", "\'" + userName + "\', ", "\'" + email + "\', ", "\'" + phoneN + "\', ", "\'" + password + "\');"];
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