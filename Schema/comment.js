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

//设置comment的remove钩子
CommentSchema.post("remove",(doc) => {
    //当前这个回调函数，一定会在remove事件执行触发
    const Article = require("../models/article.js")
    const User = require("../models/user.js")

    const {from, article} = doc;
    //对应文章的评论数-1
    Article.updateOne({_id:article},{$inc:{commentNum:-1}}).exec()
    //当前被删除评论的作者的commentNum-1
    User.updateOne({_id:from},{$inc:{commentNum:-1}}).exec()


})


module.exports = CommentSchema;