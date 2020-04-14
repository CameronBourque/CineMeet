const twilio = require('twilio');
const { pool } = require('../config/database');

const accountSid = 'ACc321d59a66a91fed5bb3b60ee09d113b';
const authToken = '8d199a2d4c0eaa8297b961eff8b445b6';

const client = new twilio(accountSid, authToken);

const userPhoneNumbers = new Map();
const userListings = new Map();

const identifyUserPhoneNumbers = () => {
    const statements = ["select \"User\".\"userName\", phone from \"ListingParticipants\", \"User\" where \"ListingParticipants\".\"userName\" = \"User\".\"userName\";"];
    const query = statements.join('');
    pool.query(query, (err, results) => {
            if (err) {
                throw err;
            }
            for (let i = 0; i < results.rows.length; i++) {
                const userName = results.rows[i].userName;
                const phoneNumber = results.rows[i].phone;
                if (userPhoneNumbers.get(userName) === undefined) {
                    userPhoneNumbers.set(userName, phoneNumber);
                }
            }
        }
    );
}

const identifyUserListings = () => {
    const statements = ["select \"userName\", date from \"ListingParticipants\", \"UserListing\" where \"listingID\" = id;"];
    const query = statements.join('');
    pool.query(query, (err, results) => {
            if (err) {
                throw err;
            }
            for (let i = 0; i < results.rows.length; i++) {
                const userName = results.rows[i].userName;
                const meetupDate = results.rows[i].date;
                if (userListings.get(userName) === undefined) {
                    userListings.set(userName, [meetupDate]);
                } else if (userListings.get(userName) !== undefined) {
                    userListings.get(userName).push(meetupDate);
                }
            }
        }
    );
}

const sendSMS = () => {
    identifyUserPhoneNumbers();
    identifyUserListings();
    console.log(userPhoneNumbers.get('akshaypatel'));
}

exports.sendSMS = sendSMS;