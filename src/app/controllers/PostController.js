const { mutipleMongooseToObject, mongooseToObjiect } = require('../../util/mongoose');
const Post = require('../models/Post');
class PostController {
    getPost(req, res, next) {
        Post.findOne({ slug: req.params.slug })
            .then((post) => res.render('post/post-show', { post: mongooseToObjiect(post), cssPath: 'post.css' }))
            .catch(next);
    }
    getAllPost(req, res, next) {
        Post.find({})
            .then((posts) => res.render('post/post-all', { posts: mutipleMongooseToObject(posts), cssPath: 'post.css' }))
            .catch(next);
    }
}

module.exports = new PostController();
