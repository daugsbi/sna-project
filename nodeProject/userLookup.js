/**
 * Precondition: In the mongodb exist some users without additional information
 */
var winston = require('winston');
winston.add(winston.transports.File, { filename: 'info.log' });

var client = require('./TwitterClient');

var User = require('./UserModel');
var Edge = require('./EdgeModel');

function lookupUser(users){
    winston.log("info", "Gonna Request %d users", users.length);
    if(users.length > 0){
        var userids = "";
        users.forEach(function(user){
            userids += user.id + ",";
        });
        userids = userids.substring(0, userids.length - 1);
        var params = {user_id : userids}; // Userids in comma seperated list expected by api
        console.log(params);
        client.get('users/lookup', params, function(error, accounts, response){
            if(error) return winston.log("error", "Error is %s", error);
            accounts.forEach(function(account) {
                updateUser(account);
            });
        });
    }
    return;
}

function updateUser(user){
    winston.log("info", "update account %d : %s", user.id, user.screen_name);
    winston.log("info", "User is %s", user);

    User.update({id:user.id}, { $set: {
        id_str: user.id_str,
        name: user.name,
        screen_name: user.screen_name,
        location: user.location,
        description: user.description,
        url: user.url,
        protected: user.protected,
        followers_count: user.followers_count,
        friends_count: user.friends_count,
        listed_count: user.listed_count,
        created_at: user.created_at,
        favourites_count: user.favourites_count,
        statuses_count: user.statuses_count,
        lang: user.lang,
        //retweet_count: user.retweet_count,
        place: user.place,
        profile_background_color: user.profile_background_color
    }
    }, function(err, results) {
        if(err) winston.log("error", "Error is %s", err);
        winston.log("Returned %s", results);
    });
}

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(equ){
    // Request UserIDs that don't have additional information
    var query = User.find({ "followers_count" : { $exists : false } }).select("id").limit(100);
    query.exec(function (err, users) {
        if (err) return handleError(err);
        lookupUser(users);
    });
});