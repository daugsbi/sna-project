/**
 * Created by puravida on 12.11.15.
 */
var winston = require('winston');
winston.add(winston.transports.File, { filename: 'info.log' });

winston.log('info', 'starting to fetch first account');

var client = require('./TwitterClient');

var User = require('./UserModel');
var Edge = require('./EdgeModel');

function requestFollowers(user, params){
    client.get('followers/ids', params, function(error, account, response){
        if (!error){

            account.ids.forEach(function(id){
                // Save to mongoose
                winston.log('info', id);

                var newUser = new User({
                    id: id
                    /* id_str: friend.id_str,
                     name: friend.name,
                     screen_name: friend.screen_name,
                     location: friend.location,
                     description: friend.description,
                     url: friend.url,
                     protected: friend.protected,
                     followers_count: friend.followers_count,
                     friends_count: friend.friends_count,
                     listed_count: friend.listed_count,
                     created_at: friend.created_at,
                     favourites_count: friend.favourites_count,
                     statuses_count: friend.statuses_count,
                     lang: friend.lang,
                     retweet_count: friend.retweet_count,
                     place: friend.place,
                     profile_background_color: friend.profile_background_color*/
                });

                var edge = new Edge({
                    from: user.id,
                    to: id,
                    value: 0
                });

                newUser.save(function(err){
                    if(err){
                        winston.log('error', err);
                    }else{
                        winston.log('info', "User %s created", id );
                    }
                });

                edge.save(function(err){
                    if(err){
                        winston.log('error', err);
                    }else{
                        winston.log('info', "Edge from %d to %d created", user.id, id );
                    }
                });
            });
        }else{
            winston.log('error', error);
        }

        if(account.next_cursor > 0){
            requestFriends(user, account.next_cursor);
            winston.log('info', "There are more than 5000 friends, render more %s", account.next_cursor);
        }

    });
}

function requestFriends(user, params){
    client.get('friends/ids', params, function(error, account, response){
        if (!error){

            account.ids.forEach(function(id){
                // Save to mongoose
                winston.log('info', id);

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
                        winston.log('error', err);
                    }else{
                        winston.log('info', "User %s created", id );
                    }
                });

                edge.save(function(err){
                    if(err){
                        winston.log('error', err);
                    }else{
                        winston.log('info', "Edge from %d to %d created", id, user.id );
                    }
                });


            });
        }else{
            winston.log('error', error);
        }
        if(account.next_cursor > 0){
            requestFriends(user, account.next_cursor);
            winston.log('info', "There are more than 5000 friends, render more %s", account.next_cursor);
        }
    });
}

function requestUser(user){
    var params = {screen_name: user.screen_name, cursor:-1, count:5000};

    requestFollowers(user, params);
    requestFriends(user, params);

}

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(equ){
    requestUser(new User({
        id: 590562729963999233,
        screen_name: "lukasreimann"
    }));
});