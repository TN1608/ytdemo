const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const likedVideoSchema = new Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    thumbnail: { type: String, required: true },
    status: { type: Boolean, required: true },
    updatedAt: { type: Date, default: Date.now },
});

const ModelClass = mongoose.models.likedVideo || mongoose.model('likedVideo', likedVideoSchema);

module.exports = ModelClass;