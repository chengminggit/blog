const {db} = require("../Schema/config.js")

const CommentSchema = require("../Schema/comment.js")
const Comment = db.model("comments",CommentSchema)

module.exports = Comment;