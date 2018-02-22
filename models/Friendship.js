/**
 * Created by Puers on 16/02/2018.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var FriendshipSchema = new Schema(
    {
        friend:{type: Schema.Types.ObjectId, ref: 'User'},
        friend2:{type: Schema.Types.ObjectId, ref: 'User'},
        status:Number,
        friends_since : {type:Date}
    }
);

module.exports= mongoose.model('Friendship',FriendshipSchema);