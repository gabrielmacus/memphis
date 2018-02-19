/**
 * Created by Puers on 16/02/2018.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var FriendshipSchema = new Schema(
    {
        friend_id:String,
        friend_2_id:String,
        status:Number
    }
);

module.exports= mongoose.model('Friendship',FriendshipSchema);