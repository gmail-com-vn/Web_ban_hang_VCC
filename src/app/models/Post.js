const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: { type: String },
    content: { type: String },
    imagePost: { type: String },
    slug: { type: String, slug: 'title', unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    deleteAt: {},
});

postSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

// Custom query helpers
postSchema.query.sortable = function (req) {
    if (req.query.hasOwnProperty('_sort')) {
        const isValidtype = ['asc', 'desc'].includes(req.query.type);
        return this.sort({
            [req.query.column]: isValidtype ? req.query.type : 'desc',
        });
    }
    return this;
};

module.exports = mongoose.model('Post', postSchema);
