/**
 * Represents an Edge
 * From follows to
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var edgeSchema = new Schema(
    {
        from: Number,
        to: Number,
        value: String
    }
);

edgeSchema.index({from: 1, to: 1}, {unique: true});

// the schema is useless so far
// we need to create a model using it
var Edge = mongoose.model('Edge', edgeSchema);

// make this available to our users in our Node applications
module.exports = Edge;