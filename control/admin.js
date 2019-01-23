// const {db} = require("../Schema/config.js")
// //通过db对象创建操作article数据库的模型对象
// const ArticleSchema = require("../Schema/article.js")
// const Article = db.model("articles",ArticleSchema)
// //取用户的Schema，为了拿到操作users集合的实例对象
// const UserSchema = require("../Schema/user.js")
// const User = db.model("users",UserSchema)
//
//
// const CommentSchema = require("../Schema/comment.js")
// const Comment = db.model("comments",CommentSchema)

const Article = require("../models/article.js")
const User = require("../models/user.js")
const Comment = require("../models/comment.js")

const fs = require("fs")
const {join} = require("path")



exports.index = async ctx => {
    console.log(ctx.session)
    if(ctx.session.isNew){
        //没有登录
        ctx.status = 404;
        return await ctx.render("404.pug",{title:"404"})
    }
    const id = ctx.params.id;
    const arr = fs.readdirSync(join(__dirname,"../views/admin"))

    let flag = false;

    arr.forEach(v => {
        const name = v.replace(/^(admin\-)|(\.pug)$/g,"");
        if(name === id){
            flag = true;
        }
    })
    if(flag){
        await ctx.render("./admin/admin-" + id + ".pug",{
            role:ctx.session.role
        })
    }else{
        ctx.status = 404;
        await ctx.render("404.pug",{title:"404"})
    }
}










