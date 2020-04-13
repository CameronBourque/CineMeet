const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { ensureAuthenticated } = require('../config/auth');

router.get('/createphysical', ensureAuthenticated, (req, res) =>
    res.render('createphysicallisting', {
    }));

router.get('/createvirtual', ensureAuthenticated, (req, res) =>
    res.render('createvirtuallisting', {
    }));

router.get('/viewvirtual', ensureAuthenticated, (req, res) =>
    res.render('viewvirtuallisting', {
    }));

// Create virtual listing handler
router.post('/createvirtual', (req, res) => {
    let { listingname, moviename, date, time, service, eventtype } = req.body;
    let errors = [];

    // Check required fields
    if (!listingname || !moviename || !date || !time || !service || !eventtype) {
        errors.push({ message: 'Please fill in all fields.' } );
    }

    if (errors.length > 0) {
        res.render('createvirtuallisting', {
            errors,
            listingname,
            moviename,
            date,
            time,
            service,
            eventtype
        });
    } else {
        const owner = req.user.userName;
        const statements = ["INSERT INTO \"UserListing\" (\"listingName\", \"movieName\", date, time, service, status, type, owner) VALUES ('", listingname + "', '", moviename + "', '", date + "', '", time + "', '", service + "', '", eventtype + "', '", "virtual" + "', '", owner + "');"];
        const query = statements.join('');
        pool.query(query, (err, results) => {
                if (err) {
                    throw err;
                }
                req.flash('success_msg', 'Your virtual meetup has successfully been posted!');
                res.redirect('/dashboard')
            }
        );
    }
});

// Create physical listing handler
router.post('/createphysical', (req, res) => {
    let { listingname, moviename, date, time, venue, address, address2, city, state, zipcode, eventtype } = req.body;
    let errors = [];

    // Check required fields
    if (!listingname || !moviename || !date || !time || !venue || !address || !city || !state || !zipcode || !eventtype) {
        errors.push({ message: 'Please fill in all fields.' } );
    }

    if (errors.length > 0) {
        res.render('createphysicallisting', {
            errors,
            listingname,
            moviename,
            date,
            time,
            venue,
            address,
            address2,
            city,
            state,
            zipcode,
            eventtype
        });
    } else {
        const owner = req.user.userName;
        let statements = null;
        if (address2 === '') {
            statements = ["INSERT INTO \"UserListing\" (\"listingName\", \"movieName\", date, time, \"venueName\", address, address2, city, state, zipcode, status, type, owner) VALUES ('", listingname + "', '", moviename + "', '", date + "', '", time + "', '", venue + "', '", address + "', ", "null" + ", '", city + "', '", state + "', '", zipcode + "', '", eventtype + "', '", "physical" + "', '", owner + "');"];
        } else {
            statements = ["INSERT INTO \"UserListing\" (\"listingName\", \"movieName\", date, time, \"venueName\", address, address2, city, state, zipcode, status, type, owner) VALUES ('", listingname + "', '", moviename + "', '", date + "', '", time + "', '", venue + "', '", address + "', '", address2 + "', '", city + "', '", state + "', '", zipcode + "', '", eventtype + "', '", "physical" + "', '", owner + "');"];
        }
        const query = statements.join('');
        pool.query(query, (err, results) => {
                if (err) {
                    throw err;
                }
                req.flash('success_msg', 'Your physical meetup has successfully been posted!');
                res.redirect('/dashboard')
            }
        );
    }
});

module.exports = router;