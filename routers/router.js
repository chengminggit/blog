const Router = require("koa-router");
//拿到操作user表的逻辑对象
const user = require("../control/user.js")
const article = require("../control/article.js")
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

module.exports = router;