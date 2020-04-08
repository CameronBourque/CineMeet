const LocalStrategy = require('passport-local').Strategy;
const { pool } = require('../config/database');

function initialize(passport) {
    const authenticateUser = (email, password, done) => {
        const statements = ["SELECT * FROM \"User\" WHERE email = '", email, "';"];
        const query = statements.join('');
        pool.query(query, (err, results) => {
                if (err) {
                    throw err;
                }
                if (results.rows.length > 0) {
                    const user = results.rows[0];
                    if (password === user.password) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Password is invalid.'} );
                    }
                } else {
                    return done(null, false, { message: 'There is not an account registered under that email.'} );
                }
            }
        );
    }

    passport.use(
        new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
            },
            authenticateUser
        )
    );

    passport.serializeUser((user, done) => done(null, user.id));

    passport.deserializeUser((id, done) => {
        const statements = ["SELECT * FROM \"User\" WHERE id = '", id, "';"];
        const query = statements.join('');
        pool.query(query, (err, results) => {
            if (err) {
                throw err;
            }

            return done(null, results.rows[0]);
        });
    });

}

module.exports = initialize;