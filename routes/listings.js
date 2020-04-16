const moment = require('moment');
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

router.get('/myupcomingmeetups', ensureAuthenticated, (req, res) =>{
    const today = moment().format('YYYY-MM-DD');
    const currtime = moment().format('hh:mm');

    const statements = ["SELECT * from \"UserListing\" where (\"date\">'", today, "' or (\"date\"='", today, "' and \"time\">'", currtime, "')) and (\"id\" = any(SELECT \"listingID\" from \"ListingParticipants\" where \"userName\"='", req.user.userName + "'));"];
    const qry = statements.join('');

    pool.query(qry)
        .then(results => {
            let members = [];
            if (results === null) {
                let rsp = {length: 0};
                res.render('myupcomingmeetups', {listings: rsp, participants: members});
            } else {
                for(let i = 0; i < results.rows.length; i++){
                    const stmt2 = ["SELECT \"userName\" from \"ListingParticipants\" where \"listingID\" = any(SELECT \"id\" from \"UserListing\" where \"id\"=", results.rows[i].id + ");"];

                    pool.query(stmt2.join(''))
                        .then(res => {
                            let temp = [];
                            for (let j = 0; j < res.rows.length; j++) {
                                temp.push(res.rows[j].userName);
                            }
                            members.push(temp);
                            console.log(members);
                        })
                        .catch(err => {throw err;});
                    console.log(members);
                }

                console.log(members);
                let rsp = results.rows;
                res.render('myupcomingmeetups', {listings: rsp, participants: members});
            }
        })
        .catch(err => {throw err;});
});

// View current physical listings handler
router.get('/viewphysical', ensureAuthenticated, function(req, res){
    const today = moment().format('YYYY-MM-DD');
    const currtime = moment().format('hh:mm');

    const statements = ["SELECT * from \"UserListing\" where \"type\"='physical' and (\"date\">'", today ,"' or (\"date\"='", today ,"' and \"time\">'", currtime ,"'));"];
    const qry = statements.join('');

    pool.query(qry, (err, results) => {
        if (err) {
            throw err;
        }
        if (results === null) {
            let rsp = {length: 0};
            res.render('viewphysicallisting', {listings: res, owner: req.user.userName});
        } else {
            let rsp = results.rows;
            res.render('viewphysicallisting', {listings: rsp, owner: req.user.userName});
        }
    });
});

// View current virtual listings handler
router.get('/viewvirtual', ensureAuthenticated, function(req, res){
    const today = moment().format('YYYY-MM-DD');
    const currtime = moment().format('hh:mm');

    const statements = ["SELECT * from \"UserListing\" where \"type\"='virtual' and (\"date\">'", today ,"' or (\"date\"='", today ,"' and \"time\">'", currtime ,"'));"];
    const qry = statements.join('');

    pool.query(qry, (err, results) => {
        if (err) {
            throw err;
        }
        if (results === null) {
            let rsp = {length: 0};
            res.render('viewvirtuallisting', {listings: res, owner: req.user.userName});
        } else {
            let rsp = results.rows;
            res.render('viewvirtuallisting', {listings: rsp, owner: req.user.userName});
        }
    });
});

// Join virtual listing
router.post('/joinvirtual', (req, res) => {
    let { id } = req.body;

    const userName = req.user.userName;

    let statements = ["SELECT * FROM \"ListingParticipants\" WHERE \"userName\" = '", userName, "' AND \"listingID\" = ", id, ";"];
    let qry = statements.join('');

    pool
        .query(qry)
        .then(results => {
            if (results.rows.length === 0) {
                statements = ["INSERT INTO \"ListingParticipants\" (\"userName\", \"listingID\") VALUES ('", userName, "', ", id, ");"];
                qry = statements.join('');
                pool
                    .query(qry)
                    .then(() => {
                        req.flash('success_msg', 'You have successfully joined this meetup.');
                        res.redirect('/listings/viewvirtual')
                    })
                    .catch(e => console.error(e.stack))
            } else {
                req.flash('error_msg', 'You have already joined this meetup.');
                res.redirect('/listings/viewvirtual')
            }
        })
        .catch(e => console.error(e.stack))
});

// Join physical listing
router.post('/joinphysical', (req, res) => {
    let { id } = req.body;

    const userName = req.user.userName;

    let statements = ["SELECT * FROM \"ListingParticipants\" WHERE \"userName\" = '", userName, "' AND \"listingID\" = ", id, ";"];
    let qry = statements.join('');

    pool
        .query(qry)
        .then(results => {
            if (results.rows.length === 0) {
                statements = ["INSERT INTO \"ListingParticipants\" (\"userName\", \"listingID\") VALUES ('", userName, "', ", id, ");"];
                qry = statements.join('');
                pool
                    .query(qry)
                    .then(() => {
                        req.flash('success_msg', 'You have successfully joined this meetup.');
                        res.redirect('/listings/viewvirtual')
                    })
                    .catch(e => console.error(e.stack))
            } else {
                req.flash('error_msg', 'You have already joined this meetup.');
                res.redirect('/listings/viewvirtual')
            }
        })
        .catch(e => console.error(e.stack))
});

// Leave listing
router.post('/leave', (req, res) => {
    let { id } = req.body;

    const userName = req.user.userName;

    let statements = ["SELECT owner FROM \"UserListing\" where id = ", id, ";"];
    let qry = statements.join('');

    pool
        .query(qry)
        .then(results => {
            if (results.rows[0].owner !== userName) {
                statements = ["DELETE FROM \"ListingParticipants\" WHERE \"userName\" = '", userName, "' AND \"listingID\" = ", id, ";"];
                qry = statements.join('');
                pool
                    .query(qry)
                    .then(() => {
                        req.flash('success_msg', 'You have successfully left the meetup.');
                        res.redirect('/listings/myupcomingmeetups')
                    })
                    .catch(e => console.error(e.stack))
            } else {
                req.flash('error_msg', 'You may not leave your own meetup.');
                res.redirect('/listings/myupcomingmeetups')
            }
        })
        .catch(e => console.error(e.stack))
});

// Create virtual listing handler
router.post('/createvirtual', (req, res) => {
    let { listingname, moviename, date, time, service, eventtype } = req.body;
    let errors = [];

    // Handle single quotes
    listingname = parseSingleQuotes(listingname);
    moviename = parseSingleQuotes(moviename);

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
        let statements = ["INSERT INTO \"UserListing\" (\"listingName\", \"movieName\", date, time, service, status, type, owner) VALUES (\'", listingname + "\', '", moviename + "', '", date + "', '", time + "', '", service + "', '", eventtype + "', '", "virtual" + "', '", owner + "');"];
        let query = statements.join('');
        pool
            .query(query)
            .then(() => {
                statements = ["SELECT id FROM \"UserListing\" ORDER BY id DESC LIMIT 1"]
                query = statements.join('');
                pool
                    .query(query)
                    .then(results => {
                        statements = ["INSERT INTO \"ListingParticipants\" (\"userName\", \"listingID\") VALUES ('", owner, "', ", results.rows[0].id, ");"];
                        query = statements.join('');
                        pool
                            .query(query)
                            .then(() => {
                                req.flash('success_msg', 'Your virtual meetup has successfully been posted!');
                                res.redirect('/dashboard');
                            })
                            .catch(e => console.error(e.stack))
                    })
                    .catch(e => console.error(e.stack))
            })
            .catch(e => console.error(e.stack))
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

    // Handle single quotes
    listingname = parseSingleQuotes(listingname);
    moviename = parseSingleQuotes(moviename);
    venue = parseSingleQuotes(venue);
    address = parseSingleQuotes(address);
    address2 = parseSingleQuotes(address2);
    city = parseSingleQuotes(city);
    zipcode = parseSingleQuotes(zipcode);

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
        let query = statements.join('');

        pool
            .query(query)
            .then(() => {
                statements = ["SELECT id FROM \"UserListing\" ORDER BY id DESC LIMIT 1"]
                query = statements.join('');
                pool
                    .query(query)
                    .then(results => {
                        statements = ["INSERT INTO \"ListingParticipants\" (\"userName\", \"listingID\") VALUES ('", owner, "', ", results.rows[0].id, ");"];
                        query = statements.join('');
                        pool
                            .query(query)
                            .then(() => {
                                req.flash('success_msg', 'Your physical meetup has successfully been posted!');
                                res.redirect('/dashboard');
                            })
                            .catch(e => console.error(e.stack))
                    })
                    .catch(e => console.error(e.stack))
            })
            .catch(e => console.error(e.stack))
    }
});

function parseSingleQuotes(value) {
    let arr = value.split(' ');
    for (let i = 0; i < arr.length; i++) {
        const temp = arr[i].replace("'", "''");
        arr[i] = temp;
    }
    return (arr.join(' '));
}

module.exports = router;