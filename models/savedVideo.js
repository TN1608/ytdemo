const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const savedVideoSchema = new Schema({
    id: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String, required: true },
    savedAt: { type: Date, default: Date.now }
});

const ModelClass = mongoose.models.savedVideo || mongoose.model('savedVideo', savedVideoSchema);

module.exports = ModelClass;

