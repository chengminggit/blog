const {Schema} = require("./config.js")
const ObjectId = Schema.Types.ObjectId

const CommentSchema = new Schema({
    content:String,
    //关联用户表
    from:{
        type:ObjectId,
        ref:"users"
    },
    //关联article集合
    article:{
        type:ObjectId,
        ref:"articles"
    }
},{
    versionKey:false,
    timestamps:{
        createdAt:"created"
    }
})


module.exports = CommentSchema;