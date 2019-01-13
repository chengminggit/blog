//连接数据库 导出db Schema
const mongoose = require("mongoose");
const db = mongoose.createConnection("mongodb://localhost:27017/blogproject",{useNewUrlParser:true})

//用原生ES6的promise代替mongoose自实现的promise
mongoose.Promise = global.Promise;

//把mongoose的Schema取出来
const Schema = mongoose.Schema;

db.on("error",() => {
    console.log("连接数据库失败")
})

db.on("open",() => {
    console.log("数据库连接成功")
})


module.exports = {
    db,
    Schema
}