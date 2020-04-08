const { Pool } = require('pg');

const DB_USER = 'enter user here'; // change this to your username
const DB_PASS = 'enter pass here'; // change this to your password
const DB_HOST = 'csce-315-db.engr.tamu.edu';
const DB_PORT = '5432';
const DB_DATABASE = 'CineMeet';

const connectionString = `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;
console.log(connectionString);

const pool = new Pool({
    connectionString: connectionString
});

module.exports = { pool };