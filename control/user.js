const {db} = require("../Schema/config.js")
const UserSchema = require("../Schema/user.js")
const encrypt = require("../util/encrypt.js")

//通过db对象创建操作user数据库的模型对象
const User = db.model("users",UserSchema)

//用户注册
exports.reg = async ctx => {
    //用户注册时POST发过来的数据
    const user = ctx.request.body
    const username = user.username;
    const password = user.password;
    console.log(username,password);

    await new Promise((resolve, reject) => {
        //去users数据库查询
        User.find({username},(err,data) => {
            if(err){
                return reject(err)
            }
            //数据库查询没出错，没有数据
            if(data.length !== 0){
                //查询到数据，用户已经存在
                return resolve("")
            }
            //用户名不存在，需要存到数据库中
            //保存到数据库之前需要先加密
            const _user = new User({
                username,
                password:encrypt(password)
            })
            _user.save((err,data) => {
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
            })
        })
    })

        .then(async data => {
            if(data){
                //注册成功
                await ctx.render("isOk.pug",{
                    status:"注册成功"
                })
            }else{
                //用户名已存在
                await ctx.render("isOk.pug",{
                    status:"用户名已存在"
                })
            }
        })
        .catch(async err => {
            await ctx.render("isOk.pug",{
                status:"注册失败，请重试"
            })
        })
}

//用户登录
exports.login = async ctx => {
    //拿到POST数据
    const user = ctx.request.body;
    const username = user.username;
    const password = user.password;

    await new Promise((resolve, reject) => {
        User.find({username}, (err,data) => {
            if(err){
                return reject(err)
            }
            if(data.length === 0){
                return reject("用户名不存在")
            }

            //把用户传过来的密码加密后与数据库中的比对
            if(data[0].password === encrypt(password)){
                return resolve(data)
            }

            resolve("");

        })
    })
    .then(async data => {
        if(!data){
            return ctx.render("isOk.pug",{
                status:"密码不正确，登录失败"
            })
        }

        //让用户在他的cookie里设置username password加密后的密码权限
        ctx.cookies.set("username",username,{
            domain:"localhost",
            path:"/",
            maxAge:36e5,
            httpOnly:true,//true不让客户端能访问这个cookie
            overwrite:false,
            signed:true
        })

        //用户在数据库的id
        ctx.cookies.set("userid",data[0]._id,{
            domain:"localhost",
            path:"/",
            maxAge:36e5,
            httpOnly:true,//true不让客户端能访问这个cookie
            overwrite:false,
            signed:true
        })

        ctx.session = {
            username,
            userid:data[0]._id,
            avatar:data[0].avatar
        }


        //登录成功
        await ctx.render("isOk.pug",{
            status:"登录成功"
        })
    })
    .catch(async err => {
        await ctx.render("isOk.pug",{
            status:"登录失败"
        })
    })
}

//确定用户登录状态 保持用户状态
exports.keepLog = async (ctx, next) => {
    if(ctx.session.isNew){//session没有
        if(ctx.cookies.get("username")){
            ctx.session = {
                username:ctx.cookies.get("username"),
                userid:ctx.cookies.get("userid")
            }
        }
    }
    await next()
}

//用户退出中间件
exports.logout = async ctx => {
    ctx.session = null;
    ctx.cookies.set("username",null,{
        maxAge:0
    })
    ctx.cookies.set("userid",null,{
        maxAge:0
    })
    //在后台做重定向到根
    ctx.redirect("/")
}