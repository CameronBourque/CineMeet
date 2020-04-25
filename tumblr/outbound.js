const tumblr = require('tumblr.js');

const oauth = tumblr.createClient({
    consumer_key: 'PK7TmFwAXxyWqgJGliCsom0XlTbi2xNzZwIpyUbUu7vD4YcCts',
    consumer_secret: '0iOJP8aboGtdfj5XbKSu42KZ2VpeM8gK9sX9NFt9QYnqIsoTb6',
    token: 'o9Swi554IMh12Eww5kMMh50s2q14u7BlIockvULmAveHOrJS0N',
    token_secret: 'hMF5nwTO7bxZi69GaSZMHdTTN7jJQFZFUXM5BYyJjiniputT3o'
});

const BLOG_NAME = 'cinemeet-315.tumblr.com';

function callback() {
    console.log("Listing posted on tumblr blog.");
}

const createTumblrPost = (title, body) => {
    const post = {
        title: title,
        body: body,
    };

    oauth.createTextPost(BLOG_NAME, post, callback);
}

exports.createTumblrPost = createTumblrPost;