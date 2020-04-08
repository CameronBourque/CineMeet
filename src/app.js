const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

/*
    User account authentication system was created referencing
    Traversy Media's youtube tutorial.
*/

const app = express();

// Passport configuration
const initializePassport = require('../config/passport');
initializePassport(passport);

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

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

const port = process.env.PORT || 5000;

app.listen(port, console.log(`Server started on port ${port}`));

