/**
 * Created by puravida on 19.11.15.
 */
var winston = require('winston');
winston.add(winston.transports.File, { filename: 'infoFetch2.log' });

var client = require('./TwitterClient');

var User = require('./UserModel');
var Edge = require('./EdgeModel');

/**
 * Request followers via followers/ids. API Limit is 5000 followers per 15 min.
 * @param user
 * @param params
 */
function requestFollowers(user, params){
    client.get('followers/ids', params, function(error, account, response){
        if (!error){

            account.ids.forEach(function(id){
                // Save to mongodb
                var newUser = new User({
                    id: id
                });

                var edge = new Edge({
                    from: id,
                    to: user.id,
                    value: 0
                });

                newUser.save(function(err){
                    if(err){
                        winston.log('error', "DB Error is:", err.errmsg);
                    }else{
                        winston.log('info', "User %s created", id );
                    }
                });

                edge.save(function(err){
                    if(err){
                        winston.log('error', "DB Error is:", err.errmsg);
                    }else{
                        winston.log('info', "Edge from %d to %d created", user.id, id );
                    }
                });

                markAsEdited(user);
            });
        }else{
            winston.log('error', error);
        }

    });
}

function requestFollowersList(user, params){
    client.get('followers/list', params, function(error, account, response){
        if (!error){

            account.users.forEach(function(u){
                // Save to mongodb
                var newUser = new User({
                    id: u.id,
                    id_str: u.id_str,
                    name: u.name,
                    screen_name: u.screen_name,
                    location: u.location,
                    description: u.description,
                    url: u.url,
                    protected: u.protected,
                    followers_count: u.followers_count,
                    friends_count: u.friends_count,
                    listed_count: u.listed_count,
                    created_at: u.created_at,
                    favourites_count: u.favourites_count,
                    statuses_count: u.statuses_count,
                    lang: u.lang,
                    place: u.place,
                    profile_background_color: u.profile_background_color,
                    networkLevel: 3
                });

                var edge = new Edge({
                    from: u.id,
                    to: user.id,
                    value: 0
                });

                newUser.save(function(err){
                    if(err){
                        winston.log('error', "DB Error is:", err.errmsg);
                    }else{
                        winston.log('info', "User %s created", u.id );
                    }
                });

                edge.save(function(err){
                    if(err){
                        winston.log('error', "DB Error is:", err.errmsg);
                    }else{
                        winston.log('info', "Edge from %d to %d created", user.id, u.id );
                    }
                });

                markAsEdited(user);
            });
        }else{
            winston.log('error', error);
        }
    });
}

/**
 * Request friends via friends/ids. API Limit is 15 * 5000 Friends per 15 min.
 * @param user
 * @param params
 */
function requestFriends(user, params){
    client.get('friends/ids', params, function(error, account, response){
        if (!error){

            account.ids.forEach(function(id){
                // Save to mongoose
                winston.log('info', id);

                var newUser = new User({
                    id: id,
                    networkLevel: 3
                });

                var edge = new Edge({
                    from: user.id,
                    to: id,
                    value: 0
                });

                newUser.save(function(err){
                    if(err){
                        winston.log('error', "DB Error is:", err.errmsg);
                    }else{
                        winston.log('info', "User %s created", id );
                    }
                });

                edge.save(function(err){
                    if(err){
                        winston.log('error', "DB Error is:", err.errmsg);
                    }else{
                        winston.log('info', "Edge from %d to %d created", id, user.id );
                    }
                });

                markAsEdited(user);
            });
        }else{
            winston.log('error', error);
        }
    });
}

/**
 * Request friends via friends/list. API Limit is 30 * max. 200 Friends per 15 min.
 * @param user
 * @param params
 */
function requestFriendsList(user, params){
    client.get('friends/list', params, function(error, account, response){
        if (!error){

            account.users.forEach(function(u){
                // Save to mongoose

                var newUser = new User({
                    id: u.id,
                    id_str: u.id_str,
                    name: u.name,
                    screen_name: u.screen_name,
                    location: u.location,
                    description: u.description,
                    url: u.url,
                    protected: u.protected,
                    followers_count: u.followers_count,
                    friends_count: u.friends_count,
                    listed_count: u.listed_count,
                    created_at: u.created_at,
                    favourites_count: u.favourites_count,
                    statuses_count: u.statuses_count,
                    lang: u.lang,
                    place: u.place,
                    profile_background_color: u.profile_background_color,
                    networkLevel: 3
                });

                var edge = new Edge({
                    from: user.id,
                    to: u.id,
                    value: 0
                });

                newUser.save(function(err){
                    if(err){
                        winston.log('error', err);
                    }else{
                        winston.log('info', "User %s created", u.id );
                    }
                });

                edge.save(function(err){
                    if(err){
                        winston.log('error', err);
                    }else{
                        winston.log('info', "Edge from %d to %d created", u.id, user.id );
                    }
                });

                markAsEdited(user);
            });
        }else{
            winston.log('error', error);
        }
    });
}

function markAsEdited(user){
    User.update({id:user.id}, { $set: {
        "resolved": true
    }}, function(err, results) {
        if(err) winston.log("error", "Error is %s", err);
        winston.log("Returned %s", results);
    });
}


function requestUserIds(user){
    var params = {screen_name: user.screen_name, cursor:-1, count:5000};
    requestFollowers(user, params);
    requestFriends(user, params);
}

function requestUserList(user){
    var params = {screen_name: user.screen_name, cursor:-1, count:200};
    requestFollowersList(user, params);
    requestFriendsList(user, params);
}

function requestData(){
    var listFollowers = User.find({"resolved" : { $exists : false }, "networkLevel" : 2, "followers_count": {$lt: 200}, "protected": false }).limit(15).sort({ id: 1 });
    listFollowers.exec(function (err, users) {
        if (err) return winston.log("error", "Query execution failed");
        users.forEach(function(user){
            requestUserList(user);
        });
    });

    var idsFollower = User.find({"resolved" : { $exists : false }, "networkLevel": 2, "followers_count": {$lt: 5000}, "protected": false}).limit(15).sort({ id: -1 });
    idsFollower.exec(function (err, users) {
        if (err) return winston.log("error", "Query execution failed");
        users.forEach(function(user){
            requestUserIds(user);
        });
    });
}

/**
 * Gets the data for the largest few users
 */
function requestLargest() {
  var largestUsers = User.find().sort(folowers_count: -1).limit(15);
  largestUsers.exec(function(err, users) {
    if (err) return winston.log("error", "Query execution failed");
    users.forEach(function user) {
      requestUserIds(user);
    }
  });
}

// Execute regulary
var CronJob = require('cron').CronJob;

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(equ){

    for (var i = 0; i < 100; i++) {
        var timeOut = i*1000*60*15.5;
        setTimeout(requestData, timeOut ); // Call every 15.5 min. (30 s for all request)
    }
});