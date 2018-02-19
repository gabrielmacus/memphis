/**
 * Created by Gabriel on 16/02/2018.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const findOrCreate = require('mongoose-find-or-create');

var UserSchema = new Schema(
    {
        facebook_id:String,
        name:String,
        surname:String,
        email:String,
        full_name:String,
        last_login:Date,
        picture:String
    }
);
UserSchema.plugin(findOrCreate);
module.exports= mongoose.model('User',UserSchema);