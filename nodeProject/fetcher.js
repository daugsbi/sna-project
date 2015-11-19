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
                });

                var edge = new Edge({
                    from: user.id,
                    to: id,
                    value: 0
                });

                newUser.save(function(err, user, numAffected){
                    if(err){
                        winston.log('error', err);
                    }else{
                        winston.log('info', "User %s created", user.id );
                    }
                });

                edge.save(function(err, edge, numAffected){
                    if(err){
                        winston.log('error', err);
                    }else{
                        winston.log('info', "Edge from %d to %d created", edge.from, edge.to );
                    }
                });
            });

            if(account.next_cursor > 0){
                requestFollowers(user, {screen_name: user.screen_name, cursor: account.next_cursor, count:5000});
                winston.log('info', "There are more than 5000 followers, render more %s", account.next_cursor);
            }
        }else{
            winston.log('error', error);
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

                newUser.save(function(err, user){
                    if(err){
                        winston.log('error', err);
                    }else{
                        winston.log('info', "User %d created", user.id );
                    }
                });

                edge.save(function(err, edge){
                    if(err){
                        winston.log('error', err);
                    }else{
                        winston.log('info', "Edge from %d to %d created", edge.from, edge.to );
                    }
                });


            });
            if(account.next_cursor > 0){
                requestFriends(user, {screen_name: user.screen_name, cursor: account.next_cursor, count:5000});
                winston.log('info', "There are more than 5000 friends, render more %s", account.next_cursor);
            }
        }else{
            winston.log('error', error);
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