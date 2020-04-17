const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const cron = require('node-cron');
const { initiateTwilioService } = require ('../twilio/outbound');
const { initiateDiscordService } = require ('../discord/outbound');

/*
    User account authentication system was created referencing
    Traversy Media's youtube tutorial.
*/

// API configuration
const TWILIO_SERVICE = false;

// Discord configuration
initiateDiscordService();

// Server configurations
const PORT = 5000;
const app = express();

// Passport configuration
const initializePassport = require('../config/passport');
initializePassport(passport);

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use( express.static("public"));

// Bodyparser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/', require('../routes/index'));
app.use('/users', require('../routes/users'))
app.use('/listings', require('../routes/listings'))

const port = process.env.PORT || PORT;

app.listen(port, console.log(`Server started on port ${port}`));

if (TWILIO_SERVICE) {
    cron.schedule("0 0 0 * * *", () => {
        initiateTwilioService();
    });
}

