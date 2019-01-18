const {db} = require("../Schema/config.js")

const ArticleSchema = require("../Schema/article.js")
const Article = db.model("articles",ArticleSchema)

//取用户的Schema，为了拿到操作users集合的实例对象
const UserSchema = require("../Schema/user.js")
const User = db.model("users",UserSchema)

const CommentSchema = require("../Schema/comment.js")
const Comment = db.model("comments",CommentSchema)

//保存评论
exports.save = async ctx => {
    let message = {
        status:0,
        msg:"登录才能发表"
    }
    //验证用户是否登录
    if(ctx.session.isNew){
        return ctx.body = message
    }
    //用户登录了
    const data = ctx.request.body;
    data.from = ctx.session.userid;
    const _comment = new Comment(data)
    await _comment
        .save()
        .then(data => {
            message = {
                status:1,
                msg:"评论成功"
            }
            //更新评论计数器
            Article
                .update({_id:data.article},{$inc:{commentNum:1}},err => {
                    if(err){
                        return console.log(err)
                    }
                    console.log("更新评论成功")
                })

            //更新用户的评论计数器
            User.update({_id:data.from},{$inc:{commentNum:1}},err => {
                if(err){
                    return console.log(err)
                }
            })
        })
        .catch(err => {
            message = {
                status:0,
                msg:err
            }
        })
    ctx.body = message;
}

//后台 查询用户所有评论
exports.comlist = async ctx => {
    const userid = ctx.session.userid;

    const data = await Comment.find({from:userid})
        .populate("article","title")

    ctx.body = {
        code:0,
        count:data.length,
        data
    }
}

//删除用户评论
exports.del = async ctx => {
    //评论id
    const commentId = ctx.params.id;

    let isOk = true;

    //让文章的计数器-1
    // await Article.update({_id:articleId},{$inc:{commentNum:-1}})
    // await User.update({_id:userId},{$inc:{commentId:-1}})

    let articleId;
    let userId;

    //删除评论
    await Comment.findById(commentId,(err,data) => {
        if(err){
            isOk = false;
            return;
        }else{
            articleId = data.article;
            userId = data.from;
        }
    })

    await Article
        .update({_id:articleId},{$inc:{commentNum:-1}})
    await User.update({_id:userId},{$inc:{commentNum:-1}})

    await Comment.deleteOne({_id:commentId})

    if(isOk){
        ctx.body = {
            state:1,
            message:"删除成功"
        }
    }
}










