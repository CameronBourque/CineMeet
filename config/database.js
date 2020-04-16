const { Pool } = require('pg');

const DB_USER = '00310e1b7bbfd72af08efb5c08278670129ae44da49c78af814c987a1230242f'; // change this to your username
const DB_PASS = 'yonaslwcxjnavk'; // change this to your password
const DB_HOST = 'ec2-52-71-85-210.compute-1.amazonaws.com';
const DB_PORT = '5432';
const DB_DATABASE = 'ddn8g868l664a0';

const connectionString = `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;

const pool = new Pool({
    connectionString: connectionString
});

module.exports = { pool };