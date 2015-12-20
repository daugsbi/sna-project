/**
 * Exports the related user and edges
 */

var User = require('./UserModel');
var Edge = require('./EdgeModel');

var GexfWriter = require('gexf-writer');
var gw = new GexfWriter();

var doc = gw.createDocument({
    type: 'directed',
    attributes: {
        name: {
            type: 'string',
            default: 'name'
        },
        followers_count: {
            type: 'int',
            default: '0'
        }
    }
});

var fs = require('fs');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(equ){
    var listUser = User.find({"resolved" : true, "networkLevel" : 2, "protected": false }).sort({ id: 1 });
    listUser.exec(function (err, users) {
        var userCounter = 1;
        var max = users.length - 1;
        var i = 1;
        users.forEach(function(user){
            doc.addNode(user.id, user.screen_name, {
                    name: user.screen_name,
                    followers_count: user.followers_count
            });
            // Request Edges to this User
            var edgesInNetwork = Edge.find({"to": user.id});

            edgesInNetwork.exec(function(err, edges) {
                if(edges){
                    edges.forEach(function (edge) {
                        doc.addEdge(i, edge.from, edge.to, edge.weight);
                        console.log(i+" Edge from " + edge.from + " to " + edge.to);
                        i++;
                    });
                }
            }).then(function(){
                userCounter++;
                if(userCounter >= max || (userCounter % 100) == 0){
                    // Save to file from time to time
                    fs.writeFile("lukasReimann.gexf", doc.toString(), function(err) {
                        if(err) {
                            return console.log(err);
                        }
                        console.log("The file was saved!");
                    });
                }
            });

            console.log("Added " + user.screen_name);
        });
    });
});