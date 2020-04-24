const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// Welcome page
router.get('/', (req, res) => res.render('welcome'));

// Dashboard page
router.get('/dashboard', ensureAuthenticated, (req, res) =>
    res.render('dashboard', {
        name: req.user.firstName
    }));

// Dashboard - view listings
router.get('/viewlistings', ensureAuthenticated, (req, res) =>
    res.render('viewlistingdashboard', {
        name: req.user.firstName
    }));

// Dashboard - create listings
router.get('/createlistings', ensureAuthenticated, (req, res) =>
    res.render('createlistingdashboard', {
        name: req.user.firstName
    }));

module.exports = router;