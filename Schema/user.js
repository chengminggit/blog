const {Schema} = require("./config.js")

const UserSchema = new Schema({
    username:String,
    password:String
},{versionKey:false})


module.exports = UserSchema;