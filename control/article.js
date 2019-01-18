const {db} = require("../Schema/config.js")
//通过db对象创建操作article数据库的模型对象
const ArticleSchema = require("../Schema/article.js")
const Article = db.model("articles",ArticleSchema)
//取用户的Schema，为了拿到操作users集合的实例对象
const UserSchema = require("../Schema/user.js")
const User = db.model("users",UserSchema)


const CommentSchema = require("../Schema/comment.js")
const Comment = db.model("comments",CommentSchema)

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
    data.commentNum = 0;

    await new Promise((resolve, reject) => {
        new Article(data).save((err,data) => {
            if(err){
                return reject(err);
            }
            //更新用户文章计数
            User.update({_id:data.author},{$inc:{articleNum:1}},err => {
                if(err){
                    return console.log(err)
                }
            })
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
        .skip(2 * --page)
        .limit(2)
        .populate({
            path:"author",
            select:"username _id avatar"
        })
        .then(data => data)
        .catch(err => console.log(err))



    await ctx.render("index.pug",{
        session:ctx.session,
        title:"追逐的博客",
        artList:data,
        maxNum
    })
}

//文章详情
exports.details = async ctx => {
    //取动态路由里的id
    const _id = ctx.params.id;

    //查找文章数据
    const article = await Article
        .findById(_id)
        .populate("author","username")
        .then(data => data)


    //查找跟当前文章关联的所有评论
    const comment = await Comment
        .find({article:_id})
        .sort("-created")
        .populate("from","username avatar")
        .then(data => data)
        .catch(err => {
            console.log(err)
        })

    console.log(ctx.session)


    await ctx.render("article.pug",{
        title:article.title,
        article,
        comment,
        session:ctx.session,

    })
}

//返回用户所有文章
exports.artlist = async ctx => {
    const userid = ctx.session.userid;

    const data = await Article.find({author:userid})

    ctx.body = {
        code:0,
        count:data.length,
        data
    }
}

//删除对应id的文章
exports.del = async ctx => {
    const _id = ctx.params.id;
    let userid;

    //用户的articleNum -1
    //评论删除
    //被删除评论对应的用户表里的commentNum-1
    //删除文章

    let res ={};

    await Article.deleteOne({_id}).exec(async err => {
        if(err){
            res = {
                status:0,
                message:"删除失败"
            }
        }else{
           await Article.findById(_id).then(data => {
               userid = data.author;
           })
        }
    })

    await User.update({_id:userid},{$inc:{articleNum:-1}})

    //删除所有评论
    await Comment.find({article:_id}).then(async data => {
        let len = data.length;
        let i =0;
        async function deleteUser() {
            if(i>=len){
                return;
            }
            const cId = data[i]._id;
            await Comment.deleteOne({_id:cId}).then(data => {
                User.update({_id:data[i].from},{$inc:{commentNum:-1}},err =>{
                    if(err){
                        return console.log(err)
                    }
                    i++;
                })
            })
        }

        await deleteUser();
    })

    ctx.body = res;
}
