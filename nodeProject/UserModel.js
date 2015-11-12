// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema(
    {
        id: {type: Number, unique: true},
        id_str: String,
        name: String,
        screen_name: String,
        location: String,
        description: String,
        url: String,
        protected: Boolean,
        followers_count: Number,
        friends_count: Number,
        listed_count: Number,
        created_at: Date,
        favourites_count: Number,
        statuses_count: Number,
        lang: String,
        retweet_count: Number,
        place: String,
        profile_background_color: String
    });

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;