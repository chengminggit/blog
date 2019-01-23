const {db} = require("../Schema/config.js")
const UserSchema = require("../Schema/user.js")

//通过db对象创建操作user数据库的模型对象
const User = db.model("users",UserSchema)

module.exports = User;