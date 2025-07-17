const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const PROVIDER = require("../config/enum/provider");

const userSchema = new Schema({
    email: { type: String, unique: true, lowercase: true },
    provider: { type: String, default: PROVIDER.GOOGLE },
    verified: { type: Boolean, default: false },
    password: String,
})

userSchema.pre('save', function (next) {
    const user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

const ModelClass = mongoose.models.user || mongoose.model('user', userSchema);

module.exports = ModelClass;
