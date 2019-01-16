const Router = require("koa-router");
//拿到操作user表的逻辑对象
const user = require("../control/user.js")
const article = require("../control/article.js")
const comment = require("../control/comment.js")
const admin = require("../control/admin.js")

const router = new Router();

//设计主页
router.get('/',user.keepLog, article.getList)

//主要用来处理返回 用户登陆 用户注册
router.get(/^\/user\/(?=reg|login)/, async (ctx) => {
    //show 为true 则显示注册 false显示登陆
    const show = /reg$/.test(ctx.path);

    await ctx.render("register.pug",{show})
})



//注册用户路由
router.post("/user/reg",user.reg)

//用户登录路由
router.post("/user/login",user.login)

//用户退出
router.get("/user/logout",user.logout)

//文章发表页面
router.get("/article",user.keepLog,article.addPage)

//文章添加
router.post("/article",user.keepLog,article.add)

//文章列表分页路由
router.get("/page/:id",article.getList)

//文章详情页 路由
router.get("/article/:id",user.keepLog,article.details)

//发表评论
router.post("/comment",user.keepLog,comment.save)

//文章 评论 头像上传
router.get("/admin/:id",user.keepLog,admin.index)




router.get("*", async ctx => {
    await ctx.render("404.pug",{
        title:"404"
    })
})

module.exports = router;