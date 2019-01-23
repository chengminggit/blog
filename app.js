const Koa = require('koa');
const static = require('koa-static');
const views = require('koa-views');
const router = require('./routers/router.js');
const logger = require('koa-logger');
const body = require('koa-body');
const {join} = require('path');
const session = require('koa-session');
const compress = require("koa-compress");

//生成Koa实例
const app = new Koa;

app.keys = ["追逐"];

//session的配置对象
const CONFIG = {
    key:"SID",
    maxAge:36e5,
    overwrite:true,
    httpOnly:true,
    signed:true,
    rolling:true
}

//注册日志模块
app.use(logger());

//注册资源压缩模块 compress
app.use(compress({
    // filter: function (content_type) {
    //     return /text/i.test(content_type)
    // },
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
}))

//注册session
app.use(session(CONFIG,app))

//配置koa-body处理POST请求数据
app.use(body())

//配置静态资源目录
app.use(static(join(__dirname,"public")));

//配置视图模板
app.use(views(join(__dirname,"views"), {
    extension:'pug'
}));



//注册路由信息
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
    console.log("项目启动成功，监听在3000端口")
})


//创建管理员用户，如果管理员用户已经存在则返回
{
    const {db} = require("./Schema/config.js")
    const UserSchema = require("./Schema/user.js")
    const encrypt = require("./util/encrypt.js")
    const User = db.model("users",UserSchema)

    User
        .find({username:"admin"})
        .then(data => {
            if(data.length === 0){
                //管理员不存在 创建
                new User({
                    username:"admin",
                    password:encrypt("admin"),
                    role:666,
                    commentNum:0,
                    articleNum:0
                })
                .save()
                .then(data => {
                    console.log("管理员用户名admin 密码admin")
                })
                .catch(err => {
                    console.log("管理员账号检查失败")
                })
            }else{
                //在控制台输出
                console.log("管理员用户名admin 密码admin")
            }
        })
}


















