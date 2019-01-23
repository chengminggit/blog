const {Schema} = require("./config.js")
const ObjectId = Schema.Types.ObjectId

const ArticleSchema = new Schema({
    title:String,
    content:String,
    author:{
        type:ObjectId,
        ref:"users"
    },//关联users的表
    tips:String,
    commentNum:Number
},{
    versionKey:false,
    timestamps:{
        createdAt:"created"
    }
})

ArticleSchema.post("remove",doc => {
    const Comment = require("../models/comment.js")
    const User = require("../models/user.js")

    const {_id:artId,author:authorId} = doc;
    //只要把用户的articleNum -1
    User.findByIdAndUpdate(authorId,{$inc:{articleNum:-1}}).exec()
    //把当前需要删除的文章所关联的所有评论，一次调用评论remove
    Comment.find({article:artId})
        .then(data => {
            data.forEach(v => v.remove())
        })
})


module.exports = ArticleSchema;