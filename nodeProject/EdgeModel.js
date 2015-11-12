// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var edgeSchema = new Schema(
    {
        from: Number,
        to: Number,
        value: String
    });

// the schema is useless so far
// we need to create a model using it
var Edge = mongoose.model('Edge', edgeSchema);

// make this available to our users in our Node applications
module.exports = Edge;