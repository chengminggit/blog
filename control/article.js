const {db} = require("../Schema/config.js")
const ArticleSchema = require("../Schema/article.js")
//取用户的Schema，为了拿到操作users集合的实例对象
const UserSchema = require("../Schema/user.js")
const User = db.model("users",UserSchema)

//通过db对象创建操作article数据库的模型对象
const Article = db.model("articles",ArticleSchema)

//返回文章发表页
exports.addPage = async (ctx) => {
    await ctx.render("add-article.pug",{
        title:"文章发表页",
        session:ctx.session
    })
}

//文章的发表（保存到数据库）
exports.add = async ctx => {
    if(ctx.session.isNew){
        //true没登录，不需要查询数据库
        return ctx.body = {
            msg:"用户未登录",
            status:0
        }
    }

    //用户登录的情况
    const data = ctx.request.body;
    //添加文章的作者
    data.author = ctx.session.userid;

    await new Promise((resolve, reject) => {
        new Article(data).save((err,data) => {
            if(err){
                return reject(err);
            }
            resolve(data)
        })
    })
    .then(data => {
        ctx.body = {
            msg:"发表成功",
            status:1
        }
    })
    .catch(err => {
        ctx.body = {
            msg:"发表失败",
            status:0
        }
    })
}

//获取文章列表
exports.getList = async ctx => {
    //查询每篇文章对应的作者的头像
    let page = ctx.params.id || 1;
    const maxNum = await Article.estimatedDocumentCount((err,num) => err?console.log(err):num)
    const data = await Article
        .find()
        .sort("-created")
        .skip(5 * --page)
        .limit(5)
        .populate({
            path:"author",
            select:"username _id avatar"
        })
        .then(data => data)
        .catch(err => console.log(err))

    console.log(data,"4545")
    await ctx.render("index.pug",{
        session:ctx.session,
        title:"追逐的博客",
        artList:data,
        maxNum
    })
}