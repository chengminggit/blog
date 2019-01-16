const {Schema} = require("./config.js")
const ObjectId = Schema.Types.ObjectId

const ArticleSchema = new Schema({
    title:String,
    content:String,
    author:{
        type:ObjectId,
        ref:"users"
    },//关联users的表
    tips:String
},{
    versionKey:false,
    timestamps:{
        createdAt:"created"
    }
})


module.exports = ArticleSchema;