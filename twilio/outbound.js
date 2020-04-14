const twilio = require('twilio');
const moment = require('moment');
const { pool } = require('../config/database');

const accountSid = 'ACc321d59a66a91fed5bb3b60ee09d113b';
const authToken = '8d199a2d4c0eaa8297b961eff8b445b6';
const fromPhoneNumber = '+19386668311';

const client = new twilio(accountSid, authToken);

const userPhoneNumbers = new Map();
const userListings = new Map();

const reminderThreshold = 172000000; // in milliseconds (roughly 2 days)

const identifyUserPhoneNumbers = (callback) => {
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
            callback(sendSMS);
        }
    );
}

const identifyUserListings = (callback) => {
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
            callback();
        }
    );
}

const sendSMS = () => {
    const todaysDate = moment(moment().format("YYYY-MM-DD"));
    for (const [k, v] of userListings.entries()) {
        const toPhoneNumber = userPhoneNumbers.get(k);
        for (let i = 0; i < v.length; i++) {
            const listingDate = moment(v[0]);
            if (listingDate.diff((todaysDate)) <= reminderThreshold) {
                const daysLeft = listingDate.from((todaysDate));
                const message = "You have a movie meetup coming up " + daysLeft + " - on " + v[0] + ".";
                client.messages.create({
                    body: message,
                    to: toPhoneNumber,
                    from: fromPhoneNumber
                })
                    .then((message) => console.log(message.sid));
            }
        }
    }
}


const initiateTwilioService = () => {
    console.log("Twilio service initiated.");
    identifyUserPhoneNumbers(identifyUserListings);
}

exports.initiateTwilioService = initiateTwilioService;